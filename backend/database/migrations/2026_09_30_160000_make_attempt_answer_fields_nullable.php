<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attempt_answers', function (Blueprint $table) {
            $table->unsignedTinyInteger('selected_option')->nullable()->change();
            $table->boolean('is_correct')->nullable()->change();
            $table->unsignedInteger('points')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('attempt_answers', function (Blueprint $table) {
            $table->unsignedTinyInteger('selected_option')->nullable(false)->change();
            $table->boolean('is_correct')->nullable(false)->change();
            $table->unsignedInteger('points')->default(0)->nullable(false)->change();
        });
    }
};
