<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'text',
        'level',
        'options',
        'correct_option',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'level' => 'integer',
            'correct_option' => 'integer',
        ];
    }

    /** @return HasMany<AttemptAnswer, $this> */
    public function attemptAnswers(): HasMany
    {
        return $this->hasMany(AttemptAnswer::class);
    }
}
