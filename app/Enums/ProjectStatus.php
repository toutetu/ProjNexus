<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case Draft = 'draft';
    case PendingDept = 'pending_dept';
    case PendingHq = 'pending_hq';
    case Approved = 'approved';
    case Rejected = 'rejected';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }
}
