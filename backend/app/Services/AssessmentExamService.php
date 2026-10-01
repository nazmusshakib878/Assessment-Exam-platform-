<?php

namespace App\Services;

use App\Models\Attempt;
use App\Models\Question;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AssessmentExamService
{
    public function startAttempt(User $user): Attempt
    {
        $questions = $this->selectQuestions()->shuffle()->values();

        return DB::transaction(function () use ($user, $questions) {
            $attempt = $user->attempts()->create([
                'status' => 'in_progress',
                'total_score' => 0,
                'level_name' => 'Pending',
            ]);

            $attempt->answers()->createMany(
                $questions->map(fn (Question $question, int $position) => [
                    'question_id' => $question->id,
                    'position' => $position + 1,
                    'option_order' => collect(range(0, 3))->shuffle()->values()->all(),
                ])->all()
            );

            return $attempt->load('answers.question');
        });
    }

    /** @return array{attempt: Attempt, resumed: bool} */
    public function startOrResumeAttempt(User $user): array
    {
        $attempt = $user->attempts()
            ->where('status', 'in_progress')
            ->latest()
            ->first();

        if ($attempt !== null) {
            return ['attempt' => $attempt->load('answers.question'), 'resumed' => true];
        }

        return ['attempt' => $this->startAttempt($user), 'resumed' => false];
    }
    /** @param array<int, array{question_id: int, selected_option: int|null}> $answers */
    public function saveAnswers(Attempt $attempt, array $answers): Attempt
    {
        return DB::transaction(function () use ($attempt, $answers) {
            $attempt = $this->lockedAttempt($attempt);

            if ($attempt->status === 'submitted') {
                throw ValidationException::withMessages([
                    'attempt' => ['Submitted attempts cannot be changed.'],
                ]);
            }

            $answersByQuestion = collect($answers)->keyBy('question_id');
            $this->ensureAnswersBelongToAttempt($attempt, $answersByQuestion->keys()->all());

            foreach ($answersByQuestion as $questionId => $answer) {
                $attempt->answers->firstWhere('question_id', $questionId)?->update([
                    'selected_option' => $answer['selected_option'] === null ? null : (int) $answer['selected_option'],
                ]);
            }

            return $attempt->fresh('answers.question');
        });
    }

    /** @param array<int, array{question_id: int, selected_option: int|null}> $submittedAnswers */
    public function submitAttempt(Attempt $attempt, array $submittedAnswers): Attempt
    {
        return DB::transaction(function () use ($attempt, $submittedAnswers) {
            $attempt = $this->lockedAttempt($attempt);

            if ($attempt->status === 'submitted') {
                throw ValidationException::withMessages([
                    'attempt' => ['This attempt has already been submitted.'],
                ]);
            }

            $answersByQuestion = collect($submittedAnswers)->keyBy('question_id');
            $this->ensureAnswersBelongToAttempt($attempt, $answersByQuestion->keys()->all());
            $score = 0;

            foreach ($attempt->answers as $answer) {
                $submittedAnswer = $answersByQuestion->get($answer->question_id);
                $selectedOption = $submittedAnswer === null ? $answer->selected_option : ($submittedAnswer['selected_option'] === null ? null : (int) $submittedAnswer['selected_option']);
                $isCorrect = $selectedOption !== null && $selectedOption === $answer->question->correct_option;
                $points = $isCorrect ? $answer->question->level : 0;

                $answer->update([
                    'selected_option' => $selectedOption,
                    'is_correct' => $isCorrect,
                    'points' => $points,
                ]);

                $score += $points;
            }

            $attempt->update([
                'status' => 'submitted',
                'total_score' => $score,
                'level_name' => $this->levelForScore($score),
                'submitted_at' => now(),
            ]);

            return $attempt->fresh('answers.question');
        });
    }

    public function levelForScore(int $score): string
    {
        return match (true) {
            $score <= 5 => 'Beginner',
            $score <= 11 => 'Elementary',
            $score <= 18 => 'Intermediate',
            $score <= 24 => 'Advanced',
            default => 'Expert',
        };
    }

    private function lockedAttempt(Attempt $attempt): Attempt
    {
        return Attempt::query()
            ->lockForUpdate()
            ->with(['answers' => fn ($query) => $query->orderBy('position'), 'answers.question'])
            ->findOrFail($attempt->id);
    }

    /** @param array<int, int> $questionIds */
    private function ensureAnswersBelongToAttempt(Attempt $attempt, array $questionIds): void
    {
        if (collect($questionIds)->diff($attempt->answers->pluck('question_id'))->isNotEmpty()) {
            throw ValidationException::withMessages([
                'answers' => ['Answers can only be submitted for questions in this attempt.'],
            ]);
        }
    }

    /** @return Collection<int, Question> */
    private function selectQuestions(): Collection
    {
        $questions = collect();

        foreach (range(1, 5) as $level) {
            $levelQuestions = Question::query()
                ->where('level', $level)
                ->inRandomOrder()
                ->limit(2)
                ->get();

            if ($levelQuestions->count() !== 2) {
                throw ValidationException::withMessages([
                    'questions' => ["Two questions are required for level {$level} before an exam can start."],
                ]);
            }

            $questions = $questions->concat($levelQuestions);
        }

        return $questions;
    }
}
