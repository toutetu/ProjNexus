<?php

namespace App\Enums;

enum ApprovalAction: string
{
    case Approved = 'approved';
    case Rejected = 'rejected';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $action) => $action->value, self::cases());
    }
}
