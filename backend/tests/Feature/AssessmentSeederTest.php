<?php

namespace Tests\Feature;

use App\Models\Question;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssessmentSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_assessment_seeders_create_the_expected_baseline_data(): void
    {
        $this->seed();

        $this->assertDatabaseCount('users', 3);
        $this->assertDatabaseCount('questions', 50);
        $this->assertDatabaseHas('users', ['email' => 'admin@example.com', 'role' => 'admin']);
        $this->assertDatabaseHas('users', ['email' => 'student1@example.com', 'role' => 'student']);
        $this->assertDatabaseHas('users', ['email' => 'student2@example.com', 'role' => 'student']);

        foreach (range(1, 5) as $level) {
            $this->assertSame(10, Question::where('level', $level)->count());
        }

        foreach (Question::all() as $question) {
            $this->assertCount(4, $question->options);
            $this->assertContains($question->correct_option, [0, 1, 2, 3]);
        }
    }

    public function test_the_assessment_seeders_are_idempotent(): void
    {
        $this->seed();
        $this->seed();

        $this->assertDatabaseCount('users', 3);
        $this->assertDatabaseCount('questions', 50);
    }
}
