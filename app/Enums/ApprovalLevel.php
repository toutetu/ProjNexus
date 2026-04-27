<?php

namespace App\Enums;

enum ApprovalLevel: string
{
    case Dept = 'dept';
    case Hq = 'hq';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $level) => $level->value, self::cases());
    }
}
