<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\AttemptAnswer */
class AttemptQuestionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->question->id,
            'text' => $this->question->text,
            'level' => $this->question->level,
            'options' => $this->question->options,
            'selected_option' => $this->selected_option,
        ];
    }
}
