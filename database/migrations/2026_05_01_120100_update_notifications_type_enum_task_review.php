<?php

use App\Enums\NotificationType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        $values = implode(
            ',',
            array_map(
                static fn (string $value): string => "'{$value}'",
                NotificationType::values(),
            ),
        );

        DB::statement("ALTER TABLE notifications MODIFY type ENUM({$values}) NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            return;
        }

        DB::statement(
            "ALTER TABLE notifications MODIFY type ENUM(
                'project_submitted',
                'project_approved',
                'project_rejected',
                'project_returned',
                'task_assigned',
                'task_completed',
                'task_due_soon'
            ) NOT NULL",
        );
    }
};
