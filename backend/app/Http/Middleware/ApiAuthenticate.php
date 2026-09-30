<?php
namespace App\Http\Middleware;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
class ApiAuthenticate extends Authenticate { protected function unauthenticated($request, array $guards) { throw new \Illuminate\Auth\AuthenticationException('Unauthenticated.', $guards); } }
