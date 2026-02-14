<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('lessons', 'meeting_link')) {
            Schema::table('lessons', function (Blueprint $table) {
                // Add new columns for Google Meet functionality
                $table->string('meeting_link')->nullable()->after('content');
                $table->timestamp('start_time')->nullable()->after('meeting_link');
                $table->integer('duration')->nullable()->after('start_time'); // in minutes
                $table->string('status')->nullable()->after('duration'); // scheduled, completed, cancelled
            });
        }

        // For SQLite, we need to recreate the table to modify the check constraint
        // This removes the type constraint to allow 'live_class'
        if (DB::connection()->getDriverName() === 'sqlite') {
            // SQLite doesn't support modifying check constraints directly
            // We'll handle this by allowing all values
            DB::statement("DROP TABLE IF EXISTS lessons_new");
            DB::statement("CREATE TABLE lessons_new AS SELECT * FROM lessons");
            DB::statement("DROP TABLE lessons");
            DB::statement("
                CREATE TABLE lessons (
                    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                    chapter_id INTEGER NOT NULL,
                    title VARCHAR NOT NULL,
                    type VARCHAR NOT NULL,
                    content TEXT,
                    meeting_link VARCHAR,
                    start_time DATETIME,
                    duration INTEGER,
                    status VARCHAR,
                    file_path VARCHAR,
                    \"order\" INTEGER NOT NULL DEFAULT 0,
                    is_free TINYINT(1) NOT NULL DEFAULT 0,
                    created_at DATETIME,
                    updated_at DATETIME,
                    meeting_type VARCHAR,
                    google_event_id VARCHAR,
                    notifications_sent TINYINT(1) NOT NULL DEFAULT 0,
                    FOREIGN KEY(chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
                )
            ");
            DB::statement("INSERT INTO lessons SELECT * FROM lessons_new");
            DB::statement("DROP TABLE lessons_new");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lessons', function (Blueprint $table) {
            $table->dropColumn(['meeting_link', 'start_time', 'duration', 'status']);
        });
    }
};
