<?php

namespace Tests\Feature;

use App\Models\Attempt;
use App\Models\AttemptAnswer;
use App\Models\Question;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssessmentModelsTest extends TestCase
{
    use RefreshDatabase;

    public function test_assessment_models_persist_casts_and_relationships(): void
    {
        $user = User::factory()->create();
        $question = Question::create([
            'text' => 'What is 2 + 2?',
            'level' => 1,
            'options' => ['1', '2', '3', '4'],
            'correct_option' => 3,
        ]);
        $attempt = Attempt::create([
            'user_id' => $user->id,
            'status' => 'submitted',
            'total_score' => 10,
            'level_name' => 'Level 1',
            'submitted_at' => now(),
        ]);
        $answer = AttemptAnswer::create([
            'attempt_id' => $attempt->id,
            'question_id' => $question->id,
            'selected_option' => 3,
            'is_correct' => true,
            'points' => 10,
        ]);

        $this->assertSame(['1', '2', '3', '4'], $question->options);
        $this->assertTrue($answer->is_correct);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $attempt->submitted_at);
        $this->assertTrue($user->attempts->first()->is($attempt));
        $this->assertTrue($attempt->answers->first()->is($answer));
        $this->assertTrue($answer->question->is($question));
        $this->assertTrue($question->attemptAnswers->first()->is($answer));
    }

    public function test_deleting_an_attempt_deletes_its_answers(): void
    {
        $attempt = Attempt::create([
            'user_id' => User::factory()->create()->id,
            'status' => 'in_progress',
            'level_name' => 'Level 1',
        ]);
        $answer = AttemptAnswer::create([
            'attempt_id' => $attempt->id,
            'question_id' => Question::create([
                'text' => 'Question',
                'level' => 1,
                'options' => ['A', 'B', 'C', 'D'],
                'correct_option' => 0,
            ])->id,
            'selected_option' => 0,
            'is_correct' => true,
            'points' => 1,
        ]);

        $attempt->delete();

        $this->assertDatabaseMissing('attempt_answers', ['id' => $answer->id]);
    }
}
