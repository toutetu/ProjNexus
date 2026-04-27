import { Link, usePage } from '@inertiajs/react';
import { Bell, Search } from 'lucide-react';

import Challenge2Badge from '@/Components/Badge/Challenge2Badge';
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
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-md border border-[#DEE2E6] bg-[#F1F3F5] px-3 py-1.5 text-sm transition-colors hover:bg-[#E9ECEF] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    aria-label="検索（⌘K）"
                >
                    <Search className="h-4 w-4 text-brand-muted" />
                    <span className="text-brand-muted">検索</span>
                    <Challenge2Badge />
                    <span className="rounded border border-[#CED4DA] bg-[#E9ECEF] px-1.5 py-0.5 font-mono text-[11px] text-[#495057]">
                        ⌘K
                    </span>
                </button>
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
