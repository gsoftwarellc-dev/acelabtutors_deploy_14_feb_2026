<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('registration_form_options', function (Blueprint $col) {
            $col->id();
            $col->string('form_type'); // free, paid
            $col->string('category'); // PRIMARY SCHOOL, SECONDARY SCHOOL, A-LEVELS
            $col->string('group_name'); // PRIMARY 2, YEAR 3, YEAR 8, etc.
            $col->json('subjects');
            $col->integer('sort_order')->default(0);
            $col->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registration_form_options');
    }
};
