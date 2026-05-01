<?php

namespace App\Enums;

enum TaskStatus: string
{
    case Open = 'open';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Closed = 'closed';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }

    /**
     * @return array<int, string>
     */
    public static function phase3Values(): array
    {
        return [
            self::Open->value,
            self::InProgress->value,
            self::Closed->value,
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function phase4Values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }
}
