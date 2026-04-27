<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    use HasFactory;

    public const TYPE_DEPARTMENT = 'department';
    public const TYPE_HEADQUARTERS = 'headquarters';

    protected $fillable = [
        'name',
        'type',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function isHeadquarters(): bool
    {
        return $this->type === self::TYPE_HEADQUARTERS;
    }
}
