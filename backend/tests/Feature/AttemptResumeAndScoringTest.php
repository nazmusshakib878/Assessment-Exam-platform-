<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\AssessmentExamService;
use Database\Seeders\QuestionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AttemptResumeAndScoringTest extends TestCase
{
    use RefreshDatabase;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(QuestionSeeder::class);
        $this->student = User::factory()->create(['role' => 'student']);
    }

    public function test_starting_twice_resumes_the_active_attempt_and_index_exposes_it(): void
    {
        $first = $this->actingAs($this->student, 'sanctum')->postJson('/api/attempts')
            ->assertCreated()
            ->assertJsonPath('resumed', false);
        $attemptId = $first->json('attempt.id');

        $this->actingAs($this->student, 'sanctum')->postJson('/api/attempts')
            ->assertOk()
            ->assertJsonPath('attempt.id', $attemptId)
            ->assertJsonPath('resumed', true);

        $this->actingAs($this->student, 'sanctum')->getJson('/api/attempts')
            ->assertOk()
            ->assertJsonPath('active_attempt_id', $attemptId);
    }

    public function test_string_selected_option_is_graded_and_missing_submission_answers_are_preserved(): void
    {
        $attempt = app(AssessmentExamService::class)->startAttempt($this->student);
        $answer = $attempt->answers()->with('question')->firstOrFail();

        $this->actingAs($this->student, 'sanctum')->patchJson("/api/attempts/{$attempt->id}/answers", [
            'answers' => [['question_id' => $answer->question_id, 'selected_option' => (string) $answer->question->correct_option]],
        ])->assertOk();

        $this->actingAs($this->student, 'sanctum')->postJson("/api/attempts/{$attempt->id}/submit", ['answers' => []])
            ->assertOk()
            ->assertJsonPath('attempt.total_score', $answer->question->level);
    }

    public function test_duplicate_options_are_rejected(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin, 'sanctum')->postJson('/api/admin/questions', [
            'text' => 'A valid question?',
            'level' => 1,
            'options' => ['same', 'same', 'third', 'fourth'],
            'correct_option' => 0,
        ])->assertUnprocessable()->assertJsonValidationErrors(['options.0', 'options.1']);
    }

    #[DataProvider('scoreBands')]
    public function test_submission_endpoint_assigns_each_score_band(int $score, string $level): void
    {
        $attempt = app(AssessmentExamService::class)->startAttempt($this->student);
        $attempt->load('answers.question');

        $answers = $this->answersForScore($attempt->answers->all(), $score);

        $this->actingAs($this->student, 'sanctum')->postJson("/api/attempts/{$attempt->id}/submit", [
            'answers' => $answers,
        ])->assertOk()
            ->assertJsonPath('attempt.total_score', $score)
            ->assertJsonPath('attempt.level_name', $level);
    }

    public static function scoreBands(): array
    {
        return [[0, 'Beginner'], [5, 'Beginner'], [6, 'Elementary'], [11, 'Elementary'], [12, 'Intermediate'], [18, 'Intermediate'], [19, 'Advanced'], [24, 'Advanced'], [25, 'Expert'], [30, 'Expert']];
    }

    private function answersForScore(array $answers, int $target): array
    {
        for ($mask = 0; $mask < (1 << count($answers)); $mask++) {
            $score = 0;
            $payload = [];

            foreach ($answers as $index => $answer) {
                if (($mask & (1 << $index)) !== 0) {
                    $score += $answer->question->level;
                    $payload[] = ['question_id' => $answer->question_id, 'selected_option' => $answer->question->correct_option];
                }
            }

            if ($score === $target) {
                return $payload;
            }
        }

        $this->fail("No answer combination produces score {$target}.");
    }
}
