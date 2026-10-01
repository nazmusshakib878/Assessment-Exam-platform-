<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveAttemptAnswersRequest;
use App\Http\Requests\SubmitAttemptRequest;
use App\Http\Resources\AttemptResource;
use App\Http\Resources\AttemptResultResource;
use App\Models\Attempt;
use App\Services\AssessmentExamService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttemptController extends Controller
{
    public function __construct(private AssessmentExamService $examService) {}

    public function index(Request $request): JsonResponse
    {
        $attempts = Attempt::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'submitted')
            ->latest()
            ->get();

        $activeAttemptId = Attempt::query()->where('user_id', $request->user()->id)->where('status', 'in_progress')->value('id');

        return response()->json(['attempts' => AttemptResultResource::collection($attempts), 'active_attempt_id' => $activeAttemptId]);
    }

    public function store(Request $request): JsonResponse
    {
        $result = $this->examService->startOrResumeAttempt($request->user());

        return response()->json([
            'message' => $result['resumed'] ? 'Attempt resumed successfully.' : 'Attempt started successfully.',
            'attempt' => new AttemptResource($result['attempt']),
            'resumed' => $result['resumed'],
        ], $result['resumed'] ? 200 : 201);
    }

    public function show(Request $request, Attempt $attempt): JsonResponse
    {
        $attempt = $this->ownedAttempt($request, $attempt)->load('answers.question');

        return response()->json(['attempt' => new AttemptResource($attempt)]);
    }

    public function saveAnswers(SaveAttemptAnswersRequest $request, Attempt $attempt): JsonResponse
    {
        $attempt = $this->ownedAttempt($request, $attempt);
        $attempt = $this->examService->saveAnswers($attempt, $request->validated('answers'));

        return response()->json([
            'message' => 'Progress saved successfully.',
            'attempt' => new AttemptResource($attempt),
        ]);
    }

    public function submit(SubmitAttemptRequest $request, Attempt $attempt): JsonResponse
    {
        $attempt = $this->ownedAttempt($request, $attempt);
        $attempt = $this->examService->submitAttempt($attempt, $request->validated('answers', []));

        return response()->json([
            'message' => 'Attempt submitted successfully.',
            'attempt' => new AttemptResultResource($attempt),
        ]);
    }

    private function ownedAttempt(Request $request, Attempt $attempt): Attempt
    {
        abort_unless($attempt->user_id === $request->user()->id, 404, 'Attempt not found.');

        return $attempt;
    }
}
