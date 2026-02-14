<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRegistrationFormSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('registration_form_settings', function (Blueprint $table) {
            $table->id();
            $table->string('form_type')->unique(); // 'paid' or 'free'
            $table->string('title')->default('');
            $table->string('subtitle')->default('');
            $table->string('alert_text')->nullable()->default(''); // e.g. "Free Classes - SATURDAYS ONLY"
            $table->text('helper_text')->nullable(); // e.g. "Winners Kingdom Children free classes..."
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('registration_form_settings');
    }
}
