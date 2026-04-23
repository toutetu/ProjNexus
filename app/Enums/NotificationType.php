<?php

namespace App\Enums;

enum NotificationType: string
{
    case ProjectSubmitted = 'project_submitted';
    case ProjectApproved = 'project_approved';
    case ProjectRejected = 'project_rejected';
    case ProjectReturned = 'project_returned';

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
