<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectTaskComment extends Model
{
    use HasFactory;

    protected $table = 'task_comments';

    protected $fillable = [
        'task_id',
        'user_id',
        'body',
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
