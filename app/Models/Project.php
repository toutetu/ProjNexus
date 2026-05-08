<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use App\Enums\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_project_id',
        'revision',
        'project_code',
        'title',
        'purpose',
        'description',
        'applicant_id',
        'department_id',
        'primary_assignee_id',
        'status',
        'estimated_amount',
        'estimated_days',
        'budget_amount',
        'actual_amount',
        'submitted_at',
        'approved_at',
        'rejected_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ProjectStatus::class,
            'estimated_amount' => 'decimal:2',
            'estimated_days' => 'integer',
            'budget_amount' => 'decimal:2',
            'actual_amount' => 'decimal:2',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    public function parentProject(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_project_id');
    }

    public function childProjects(): HasMany
    {
        return $this->hasMany(self::class, 'parent_project_id');
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'applicant_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function primaryAssignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'primary_assignee_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(\App\Models\ProjectWorkItem::class, 'project_id');
    }

    public function budgetHistories(): HasMany
    {
        return $this->hasMany(ProjectBudgetHistory::class, 'project_id');
    }

    public function scopeForTab(Builder $query, string $tab): Builder
    {
        return match ($tab) {
            'dev', 'budget' => $query->where('status', ProjectStatus::Approved->value),
            default => $query,
        };
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->hasRole(Role::HqManager->value)) {
            $visibleQuery = $query;
        } elseif ($user->hasRole(Role::DeptManager->value)) {
            $visibleQuery = $query->where('department_id', $user->department_id);
        } else {
            $visibleQuery = $query->where(function (Builder $inner) use ($user) {
                $inner
                    ->where('applicant_id', $user->id)
                    ->orWhere('primary_assignee_id', $user->id);
            });
        }

        // 下書きは申請者本人のみ閲覧可能
        return $visibleQuery->where(function (Builder $inner) use ($user) {
            $inner
                ->where('status', '!=', ProjectStatus::Draft->value)
                ->orWhere('applicant_id', $user->id);
        });
    }

    public function scopePendingFor(Builder $query, User $user): Builder
    {
        if ($user->hasRole(Role::HqManager->value)) {
            return $query->where('status', ProjectStatus::PendingHq->value);
        }

        if ($user->hasRole(Role::DeptManager->value)) {
            return $query
                ->where('status', ProjectStatus::PendingDept->value)
                ->where('department_id', $user->department_id);
        }

        return $query->where('applicant_id', $user->id)->whereIn('status', [
            ProjectStatus::PendingDept->value,
            ProjectStatus::PendingHq->value,
        ]);
    }
}
