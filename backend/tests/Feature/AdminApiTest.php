<?php

namespace Tests\Feature;

use App\Models\Attempt;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->student = User::factory()->create(['role' => 'student']);
    }

    public function test_an_admin_can_create_read_update_and_delete_a_question(): void
    {
        $payload = $this->questionPayload();

        $created = $this->actingAs($this->admin, 'sanctum')
            ->postJson('/api/admin/questions', $payload)
            ->assertCreated()
            ->assertJsonPath('question.text', $payload['text'])
            ->assertJsonPath('question.correct_option', 2);

        $questionId = $created->json('question.id');

        $this->actingAs($this->admin, 'sanctum')
            ->getJson("/api/admin/questions/{$questionId}")
            ->assertOk()
            ->assertJsonPath('data.id', $questionId);

        $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/admin/questions/{$questionId}", ['text' => 'Updated assessment question'])
            ->assertOk()
            ->assertJsonPath('question.text', 'Updated assessment question');

        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/questions/{$questionId}")
            ->assertOk()
            ->assertJsonPath('message', 'Question deleted successfully.');

        $this->assertDatabaseMissing('questions', ['id' => $questionId]);
    }

    public function test_admin_question_listing_supports_level_filtering_and_pagination(): void
    {
        foreach (range(1, 3) as $number) {
            $this->createQuestion(2, "Level two question {$number}");
        }
        foreach (range(1, 15) as $number) {
            $this->createQuestion(4, "Level four question {$number}");
        }

        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/questions?level=2')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.level', 2);

        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/questions?per_page=5')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.per_page', 5)
            ->assertJsonPath('meta.total', 18);
    }

    public function test_admin_results_include_submitted_attempts_with_student_details_only(): void
    {
        $submitted = Attempt::create([
            'user_id' => $this->student->id,
            'status' => 'submitted',
            'total_score' => 18,
            'level_name' => 'Intermediate',
            'submitted_at' => now(),
        ]);
        Attempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'total_score' => 0,
            'level_name' => 'Pending',
        ]);

        $this->actingAs($this->admin, 'sanctum')
            ->getJson('/api/admin/results')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $submitted->id)
            ->assertJsonPath('data.0.student_name', $this->student->name)
            ->assertJsonPath('data.0.score', 18)
            ->assertJsonPath('data.0.level_name', 'Intermediate');
    }

    public function test_students_are_blocked_from_all_admin_routes(): void
    {
        $question = $this->createQuestion();

        $this->actingAs($this->student, 'sanctum')
            ->getJson('/api/admin/questions')
            ->assertForbidden();
        $this->actingAs($this->student, 'sanctum')
            ->postJson('/api/admin/questions', $this->questionPayload())
            ->assertForbidden();
        $this->actingAs($this->student, 'sanctum')
            ->getJson("/api/admin/questions/{$question->id}")
            ->assertForbidden();
        $this->actingAs($this->student, 'sanctum')
            ->patchJson("/api/admin/questions/{$question->id}", ['text' => 'No access'])
            ->assertForbidden();
        $this->actingAs($this->student, 'sanctum')
            ->deleteJson("/api/admin/questions/{$question->id}")
            ->assertForbidden();
        $this->actingAs($this->student, 'sanctum')
            ->getJson('/api/admin/results')
            ->assertForbidden();
    }

    public function test_an_admin_cannot_delete_a_question_used_by_an_attempt(): void
    {
        $question = $this->createQuestion();
        $attempt = Attempt::create([
            'user_id' => $this->student->id,
            'status' => 'in_progress',
            'total_score' => 0,
            'level_name' => 'Pending',
        ]);
        $attempt->answers()->create([
            'question_id' => $question->id,
            'position' => 1,
            'option_order' => [0, 1, 2, 3],
        ]);

        $this->actingAs($this->admin, 'sanctum')
            ->deleteJson("/api/admin/questions/{$question->id}")
            ->assertUnprocessable()
            ->assertJsonPath('errors.question.0', 'Questions used in an assessment cannot be deleted.');

        $this->assertDatabaseHas('questions', ['id' => $question->id]);
    }

    /** @return array{text: string, level: int, options: array<int, string>, correct_option: int} */
    private function questionPayload(): array
    {
        return [
            'text' => 'Which HTTP method is commonly used to update a resource?',
            'level' => 3,
            'options' => ['GET', 'POST', 'PUT', 'DELETE'],
            'correct_option' => 2,
        ];
    }

    private function createQuestion(int $level = 1, string $text = 'Assessment question'): Question
    {
        return Question::create([
            ...$this->questionPayload(),
            'text' => $text,
            'level' => $level,
        ]);
    }
}
