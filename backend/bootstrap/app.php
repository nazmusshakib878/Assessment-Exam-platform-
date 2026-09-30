<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(web: __DIR__.'/../routes/web.php', api: __DIR__.'/../routes/api.php', commands: __DIR__.'/../routes/console.php', health: '/up')
    ->withMiddleware(function (Middleware $middleware): void { $middleware->alias(['role' => \App\Http\Middleware\EnsureUserHasRole::class, 'api-auth' => \App\Http\Middleware\ApiAuthenticate::class]); })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $exception, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) return null;
            [$status, $code, $message, $errors] = match (true) {
                $exception instanceof ValidationException => [422, 'VALIDATION_ERROR', $exception->getMessage(), $exception->errors()],
                $exception instanceof AuthenticationException => [401, 'UNAUTHENTICATED', 'Unauthenticated.', null],
                $exception instanceof AuthorizationException => [403, 'FORBIDDEN', 'You do not have permission to access this resource.', null],
                $exception instanceof ModelNotFoundException => [404, 'NOT_FOUND', 'Resource not found.', null],
                $exception instanceof HttpExceptionInterface && $exception->getStatusCode() >= 500 => [500, 'server_error', 'Server error. Please try again later.', null],
                $exception instanceof HttpExceptionInterface => [$exception->getStatusCode(), match ($exception->getStatusCode()) {403 => 'FORBIDDEN', 404 => 'NOT_FOUND', 405 => 'METHOD_NOT_ALLOWED', 429 => 'RATE_LIMITED', default => 'HTTP_ERROR'}, $exception->getMessage() ?: 'Request could not be completed.', null],
                default => [500, 'server_error', 'Server error. Please try again later.', null],
            };
            $payload = ['message' => $message, 'errors' => $errors, 'code' => $code]; if ($status === 500 && config('app.debug')) $payload['debug'] = $exception->getMessage(); return response()->json($payload, $status);
        });
    })->create();
