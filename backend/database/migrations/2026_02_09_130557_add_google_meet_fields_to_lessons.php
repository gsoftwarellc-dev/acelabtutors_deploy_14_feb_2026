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
        Schema::table('lessons', function (Blueprint $table) {
            $table->string('meeting_type')->nullable()->after('status'); // 'instant' or 'scheduled'
            $table->string('google_event_id')->nullable()->after('meeting_type');
            $table->boolean('notifications_sent')->default(false)->after('google_event_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['meeting_type', 'google_event_id', 'notifications_sent']);
        });
    }
};
