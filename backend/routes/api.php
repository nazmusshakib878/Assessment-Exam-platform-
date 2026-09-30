<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AttemptController;
use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

Route::middleware(['auth:sanctum', 'role:student'])->group(function () {
    Route::get('/attempts', [AttemptController::class, 'index']);
    Route::post('/attempts', [AttemptController::class, 'store']);
    Route::get('/attempts/{attempt}', [AttemptController::class, 'show']);
    Route::patch('/attempts/{attempt}/answers', [AttemptController::class, 'saveAnswers']);
    Route::post('/attempts/{attempt}/submit', [AttemptController::class, 'submit']);
});

Route::prefix('admin')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/questions', [AdminController::class, 'questions']);
    Route::post('/questions', [AdminController::class, 'storeQuestion']);
    Route::get('/questions/{question}', [AdminController::class, 'showQuestion']);
    Route::match(['put', 'patch'], '/questions/{question}', [AdminController::class, 'updateQuestion']);
    Route::delete('/questions/{question}', [AdminController::class, 'destroyQuestion']);
    Route::get('/results', [AdminController::class, 'results']);
});
