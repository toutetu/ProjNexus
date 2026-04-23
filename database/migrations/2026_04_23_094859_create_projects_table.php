<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Enums\ProjectStatus;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_project_id')->nullable()->constrained('projects')->nullOnDelete();
            $table->unsignedInteger('revision')->default(1);
            $table->string('project_code')->nullable()->unique();
            $table->string('title');
            $table->text('purpose')->nullable();
            $table->foreignId('applicant_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('department_id')->constrained('departments')->cascadeOnDelete();
            $table->foreignId('primary_assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default(ProjectStatus::Draft->value)->index();
            $table->decimal('estimated_amount', 15, 2)->default(0);
            $table->decimal('budget_amount', 15, 2)->nullable();
            $table->decimal('actual_amount', 15, 2)->default(0);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();

            $table->index(['department_id', 'status']);
            $table->index(['applicant_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
