<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'name' => 'Level Assessment API',
    'status' => 'ok',
]));
