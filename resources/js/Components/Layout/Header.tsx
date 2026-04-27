import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';

import Breadcrumb from '@/Components/Layout/Breadcrumb';
import type { BreadcrumbItem, PageProps } from '@/types';

interface HeaderProps {
    breadcrumb: BreadcrumbItem[];
}

export default function Header({ breadcrumb }: HeaderProps) {
    const unread = usePage<PageProps>().props.unreadNotificationCount ?? 0;

    return (
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-brand-border bg-white px-6">
            <Breadcrumb items={breadcrumb} />

            <div className="flex items-center gap-3">
                <Link
                    href={route('notifications.index')}
                    className="relative rounded-md p-2 transition-colors hover:bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    aria-label={
                        unread > 0 ? `通知（未読 ${unread} 件）` : '通知（未読なし）'
                    }
                >
                    <Bell className="h-5 w-5 text-brand-dark" />
                    {unread > 0 && (
                        <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold leading-none text-white">
                            {unread > 99 ? '99+' : unread}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    );
}
