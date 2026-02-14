<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tutor_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained('users')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->string('method')->default('bank_transfer'); // bank_transfer, cash, cheque, other
            $table->string('reference')->nullable(); // payment reference/receipt number
            $table->text('note')->nullable();
            $table->date('payment_date');
            $table->foreignId('paid_by')->nullable()->constrained('users')->onDelete('set null'); // admin who made payment
            $table->timestamps();

            $table->index(['tutor_id', 'payment_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tutor_payments');
    }
};
