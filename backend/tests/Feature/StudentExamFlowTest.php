<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\AssessmentExamService;
use Database\Seeders\QuestionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentExamFlowTest extends TestCase
{
    use RefreshDatabase;

    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(QuestionSeeder::class);
        $this->student = User::factory()->create(['role' => 'student']);
    }

    public function test_an_exam_starts_with_ten_unique_questions_and_two_per_level(): void
    {
        $response = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/attempts')
            ->assertCreated()
            ->assertJsonPath('attempt.status', 'in_progress');

        $questions = $response->json('attempt.questions');

        $this->assertCount(10, $questions);
        $this->assertCount(10, collect($questions)->pluck('id')->unique());

        foreach (range(1, 5) as $level) {
            $this->assertSame(2, collect($questions)->where('level', $level)->count());
        }

        $this->assertDatabaseCount('attempt_answers', 10);
    }

    public function test_score_to_level_mapping_uses_the_defined_bands(): void
    {
        $service = app(AssessmentExamService::class);

        $this->assertSame('Beginner', $service->levelForScore(0));
        $this->assertSame('Beginner', $service->levelForScore(5));
        $this->assertSame('Elementary', $service->levelForScore(6));
        $this->assertSame('Elementary', $service->levelForScore(11));
        $this->assertSame('Intermediate', $service->levelForScore(12));
        $this->assertSame('Intermediate', $service->levelForScore(18));
        $this->assertSame('Advanced', $service->levelForScore(19));
        $this->assertSame('Advanced', $service->levelForScore(24));
        $this->assertSame('Expert', $service->levelForScore(25));
        $this->assertSame('Expert', $service->levelForScore(30));
    }

    public function test_correct_answers_and_points_are_never_exposed_before_submission(): void
    {
        $start = $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/attempts')
            ->assertCreated();

        $attemptId = $start->json('attempt.id');

        $start->assertJsonMissingPath('attempt.questions.0.correct_option')
            ->assertJsonMissingPath('attempt.questions.0.points');

        $show = $this->actingAs($this->student, 'sanctum')
            ->getJson("/api/attempts/{$attemptId}")
            ->assertOk();

        $show->assertJsonMissingPath('attempt.questions.0.correct_option')
            ->assertJsonMissingPath('attempt.questions.0.points');
    }

    public function test_a_student_cannot_view_another_students_attempt(): void
    {
        $attempt = app(AssessmentExamService::class)->startAttempt($this->student);
        $otherStudent = User::factory()->create(['role' => 'student']);

        $this->actingAs($otherStudent, 'sanctum')
            ->getJson("/api/attempts/{$attempt->id}")
            ->assertNotFound();
    }

    public function test_submission_calculates_the_score_server_side_and_cannot_be_repeated(): void
    {
        $attempt = app(AssessmentExamService::class)->startAttempt($this->student);
        $attempt->load('answers.question');
        $answers = $attempt->answers->map(fn ($answer) => [
            'question_id' => $answer->question_id,
            'selected_option' => $answer->question->correct_option,
            'points' => 999,
        ])->all();

        $this->actingAs($this->student, 'sanctum')
            ->postJson("/api/attempts/{$attempt->id}/submit", [
                'answers' => $answers,
                'total_score' => 999,
            ])
            ->assertOk()
            ->assertJsonPath('attempt.total_score', 30)
            ->assertJsonPath('attempt.level_name', 'Expert');

        $this->actingAs($this->student, 'sanctum')
            ->postJson("/api/attempts/{$attempt->id}/submit", ['answers' => []])
            ->assertUnprocessable();

        $this->assertDatabaseHas('attempts', [
            'id' => $attempt->id,
            'total_score' => 30,
            'level_name' => 'Expert',
            'status' => 'submitted',
        ]);
    }

    public function test_a_students_selected_answers_are_saved_and_restored_without_leaking_answer_keys(): void
    {
        $attempt = app(AssessmentExamService::class)->startAttempt($this->student);
        $questionId = $attempt->answers()->firstOrFail()->question_id;

        $this->actingAs($this->student, 'sanctum')
            ->patchJson("/api/attempts/{$attempt->id}/answers", [
                'answers' => [[
                    'question_id' => $questionId,
                    'selected_option' => 2,
                ]],
            ])
            ->assertOk()
            ->assertJsonPath('attempt.questions.0.selected_option', 2)
            ->assertJsonMissingPath('attempt.questions.0.correct_option')
            ->assertJsonMissingPath('attempt.questions.0.points');

        $this->actingAs($this->student, 'sanctum')
            ->getJson("/api/attempts/{$attempt->id}")
            ->assertOk()
            ->assertJsonFragment(['id' => $questionId, 'selected_option' => 2])
            ->assertJsonMissing(['correct_option' => 2, 'points' => 2]);
    }
}
