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
        Schema::create('student_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // free or paid
            $table->string('parent_name');
            $table->string('relationship')->nullable();
            $table->string('parent_email');
            $table->string('parent_phone');
            $table->string('student_name');
            $table->date('student_dob');
            $table->string('student_email')->nullable();
            $table->json('selections'); // Store subjects/years as JSON
            $table->text('specific_needs')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_registrations');
    }
};
