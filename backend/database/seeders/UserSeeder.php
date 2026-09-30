<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(['email' => 'admin@example.com'], [
            'name' => 'Platform Admin',
            'email' => 'admin@example.com',
            'password' => 'password',
            'role' => 'admin',
        ]);

        User::updateOrCreate(['email' => 'student1@example.com'], [
            'name' => 'Student One',
            'email' => 'student1@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);

        User::updateOrCreate(['email' => 'student2@example.com'], [
            'name' => 'Student Two',
            'email' => 'student2@example.com',
            'password' => 'password',
            'role' => 'student',
        ]);
    }
}
