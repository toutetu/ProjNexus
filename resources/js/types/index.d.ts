import type { LucideIcon } from 'lucide-react';

export type RoleName = 'applicant' | 'dept_manager' | 'hq_manager';

export interface Department {
    id: number;
    name: string;
    type: 'department' | 'headquarters';
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    department_id: number | null;
    department: Department | null;
    roles: RoleName[];
}

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: LucideIcon;
}

export interface FlashMessages {
    error?: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash?: FlashMessages;
    unreadNotificationCount?: number;
    pendingApprovalCount?: number;
};
