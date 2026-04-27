<?php

namespace App\Models;

use App\Enums\ApprovalAction;
use App\Enums\ApprovalLevel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Approval extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'level',
        'action',
        'approver_id',
        'comment',
        'acted_at',
    ];

    protected function casts(): array
    {
        return [
            'level' => ApprovalLevel::class,
            'action' => ApprovalAction::class,
            'acted_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
