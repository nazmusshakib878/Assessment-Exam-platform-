<?php

namespace Tests\Feature;

use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ProductionErrorHandlingTest extends TestCase
{
    public function test_production_query_exceptions_do_not_expose_sql_or_paths(): void
    {
        config(['app.debug' => false]);
        Route::get('/api/test-query-exception', function (): never {
            throw new QueryException(
                'sqlite',
                'insert into attempt_answers values (?)',
                [],
                new \PDOException('SQLSTATE[HY000]: C:\\Users\\Shakib\\database.sqlite'),
            );
        });

        $response = $this->getJson('/api/test-query-exception');

        $response->assertStatus(500)->assertExactJson([
            'message' => 'Server error. Please try again later.',
            'errors' => null,
            'code' => 'SERVER_ERROR',
        ]);
        $this->assertStringNotContainsString('SQLSTATE', $response->getContent());
        $this->assertStringNotContainsString('database.sqlite', $response->getContent());
        $this->assertStringNotContainsString('C:\\Users', $response->getContent());
    }
}
