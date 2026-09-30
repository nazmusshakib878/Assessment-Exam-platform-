<?php
namespace App\Http\Resources;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
/** @mixin \App\Models\AttemptAnswer */
class AttemptQuestionResource extends JsonResource { public function toArray(Request $request): array { $order = $this->option_order ?? [0, 1, 2, 3]; return ['id' => $this->question->id, 'text' => $this->question->text, 'level' => $this->question->level, 'options' => collect($order)->map(fn ($index) => $this->question->options[$index])->values()->all(), 'option_ids' => $order, 'selected_option' => $this->selected_option]; } }
