<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Attempt */
class AdminAttemptResultResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'student_name' => $this->user->name,
            'score' => $this->total_score,
            'level_name' => $this->level_name,
            'submitted_at' => $this->submitted_at,
        ];
    }
}
