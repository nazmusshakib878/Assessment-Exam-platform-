<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class QuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        $presence = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'text' => [$presence, 'string'],
            'level' => [$presence, 'integer', 'between:1,5'],
            'options' => [$presence, 'array', 'list', 'size:4'],
            'options.*' => ['required_with:options', 'string', 'max:255'],
            'correct_option' => [$presence, 'integer', 'between:0,3'],
        ];
    }
}
