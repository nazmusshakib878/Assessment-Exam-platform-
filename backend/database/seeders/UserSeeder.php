<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Platform Admin',
            'email' => 'admin@example.com',
            'password' => 'password',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Student One',
            'email' => 'student1@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        User::factory()->create([
            'name' => 'Student Two',
            'email' => 'student2@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);
    }
}
