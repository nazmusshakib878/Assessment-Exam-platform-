<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attempt_answers', function (Blueprint $table) {
            $table->unsignedTinyInteger('position')->nullable()->after('question_id');
            $table->json('option_order')->nullable()->after('position');
            $table->unique(['attempt_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::table('attempt_answers', function (Blueprint $table) {
            $table->dropUnique(['attempt_id', 'position']);
            $table->dropColumn(['position', 'option_order']);
        });
    }
};
