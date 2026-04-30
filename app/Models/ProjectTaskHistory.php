<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectTaskHistory extends Model
{
    use HasFactory;

    protected $table = 'task_histories';

    public const UPDATED_AT = null;

    protected $fillable = [
        'task_id',
        'user_id',
        'field_name',
        'old_value',
        'new_value',
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(ProjectWorkItem::class, 'task_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
