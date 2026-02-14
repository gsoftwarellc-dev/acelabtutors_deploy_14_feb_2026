<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Support\Facades\Schema;

class ClearDemoData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clear-demo-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear demo courses and enrollments';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Clearing demo data...');

        try {
            Schema::disableForeignKeyConstraints();
            Enrollment::truncate();
            Course::truncate();
            Schema::enableForeignKeyConstraints();
            $this->info('Courses and Enrollments cleared successfully.');
        } catch (\Exception $e) {
            $this->error('Error clearing data: ' . $e->getMessage());
        }
    }
}
