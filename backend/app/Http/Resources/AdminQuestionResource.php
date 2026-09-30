<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Question */
class AdminQuestionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'text' => $this->text,
            'level' => $this->level,
            'options' => $this->options,
            'correct_option' => $this->correct_option,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
