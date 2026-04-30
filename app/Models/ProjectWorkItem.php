<?php

namespace App\Models;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Enums\TaskType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectWorkItem extends Model
{
    use HasFactory;

    protected $table = 'tasks';

    protected $fillable = [
        'project_id',
        'parent_id',
        'assignee_id',
        'created_by',
        'milestone_id',
        'title',
        'description',
        'task_type',
        'priority',
        'category',
        'status',
        'progress_rate',
        'estimated_days',
        'actual_days',
        'start_date',
        'due_date',
    ];

    protected function casts(): array
    {
        return [
            'task_type' => TaskType::class,
            'priority' => TaskPriority::class,
            'status' => TaskStatus::class,
            'progress_rate' => 'integer',
            'estimated_days' => 'decimal:2',
            'actual_days' => 'decimal:2',
            'start_date' => 'date',
            'due_date' => 'date',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ProjectTaskComment::class, 'task_id');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(ProjectTaskHistory::class, 'task_id');
    }
}
