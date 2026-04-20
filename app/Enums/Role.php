<?php

namespace App\Enums;

enum Role: string
{
    case Applicant = 'applicant';
    case DeptManager = 'dept_manager';
    case HqManager = 'hq_manager';

    public function label(): string
    {
        return match ($this) {
            self::Applicant => '申請者',
            self::DeptManager => '部門管理者',
            self::HqManager => '本部管理者',
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(fn (self $role) => $role->value, self::cases());
    }
}
