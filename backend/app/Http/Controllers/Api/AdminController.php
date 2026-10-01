<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminQuestionIndexRequest;
use App\Http\Requests\QuestionRequest;
use App\Http\Resources\AdminAttemptResultResource;
use App\Http\Resources\AdminQuestionResource;
use App\Models\Attempt;
use App\Models\Question;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminController extends Controller
{
    public function questions(AdminQuestionIndexRequest $request)
    {
        $filters = $request->validated();
        $questions = Question::query()
            ->when($filters['level'] ?? null, fn ($query, $level) => $query->where('level', $level))
            ->orderBy('id')
            ->paginate($filters['per_page'] ?? 15);

        return AdminQuestionResource::collection($questions);
    }

    public function storeQuestion(QuestionRequest $request): JsonResponse
    {
        $question = Question::create($request->validated());

        return response()->json([
            'message' => 'Question created successfully.',
            'question' => new AdminQuestionResource($question),
        ], 201);
    }

    public function showQuestion(Question $question): AdminQuestionResource
    {
        return new AdminQuestionResource($question);
    }

    public function updateQuestion(QuestionRequest $request, Question $question): JsonResponse
    {
        $question->update($request->validated());

        return response()->json([
            'message' => 'Question updated successfully.',
            'question' => new AdminQuestionResource($question->fresh()),
        ]);
    }

    public function destroyQuestion(Question $question): JsonResponse
    {
        if ($question->attemptAnswers()->exists()) {
            throw ValidationException::withMessages([
                'question' => ['Questions used in an assessment cannot be deleted.'],
            ]);
        }

        $question->delete();

        return response()->json(['message' => 'Question deleted successfully.']);
    }

    public function results(Request $request)
    {
        $filters = $request->validate([
            'level' => ['nullable', 'string', 'in:Beginner,Elementary,Intermediate,Advanced,Expert'],
            'sort' => ['nullable', 'string', 'in:score_desc'],
        ]);

        $results = Attempt::query()
            ->with('user')
            ->where('status', 'submitted')
            ->when($filters['level'] ?? null, fn ($query, $level) => $query->where('level_name', $level))
            ->when(
                ($filters['sort'] ?? null) === 'score_desc' || isset($filters['level']),
                fn ($query) => $query->orderByDesc('total_score')->orderByDesc('submitted_at'),
                fn ($query) => $query->orderByDesc('submitted_at')
            )
            ->paginate(15);

        return AdminAttemptResultResource::collection($results);
    }
}
