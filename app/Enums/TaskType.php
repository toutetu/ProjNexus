<?php

namespace App\Enums;

enum TaskType: string
{
    case Task = 'task';
    case Bug = 'bug';
    case Feature = 'feature';
    case Improvement = 'improvement';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
