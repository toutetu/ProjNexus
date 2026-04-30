import { Head, Link, router, usePage } from '@inertiajs/react';
import { Bell, Check, ExternalLink } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';

interface NotificationItem {
    id: number;
    type: string;
    title: string;
    body: string | null;
    meta: Record<string, unknown> | null;
    readAt: string | null;
    createdAt: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedNotifications {
    data: NotificationItem[];
    links: PaginationLink[];
    meta: {
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
}

interface Props {
    notifications: PaginatedNotifications;
}

interface NotificationTypeBadgeStyle {
    label: string;
    className: string;
}

const NOTIFICATION_TYPE_BADGE: Record<string, NotificationTypeBadgeStyle> = {
    project_submitted: {
        label: '申請',
        className: 'bg-[#E0F2FE] text-[#0C7DA3]',
    },
    project_approved: {
        label: '承認',
        className: 'bg-[#DCFCE7] text-[#166534]',
    },
    project_rejected: {
        label: '却下',
        className: 'bg-[#FEE2E2] text-[#991B1B]',
    },
    project_returned: {
        label: '取り戻し',
        className: 'bg-[#E9ECEF] text-[#495057]',
    },
    task_assigned: {
        label: '担当通知',
        className: 'bg-[#E3EEFB] text-[#0A4E8A]',
    },
    task_due_soon: {
        label: '期限間近',
        className: 'bg-[#FEF3C7] text-[#92400E]',
    },
    task_completed: {
        label: 'タスク完了',
        className: 'bg-[#DCFCE7] text-[#166534]',
    },
};

const notificationTypeBadge = (type: string): NotificationTypeBadgeStyle =>
    NOTIFICATION_TYPE_BADGE[type] ?? {
        label: '通知',
        className: 'bg-[#E9ECEF] text-[#495057]',
    };

function metaProjectId(meta: Record<string, unknown> | null): number | null {
    if (!meta) {
        return null;
    }
    const raw = meta.project_id;
    if (typeof raw === 'number' && !Number.isNaN(raw)) {
        return raw;
    }
    if (typeof raw === 'string') {
        const parsed = Number.parseInt(raw, 10);
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
}

export default function NotificationsIndex({ notifications }: Props) {
    const { flash } = usePage<PageProps>().props;

    const markRead = (id: number) => {
        router.patch(
            route('notifications.read', id),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            activeKey="notifications"
            breadcrumb={[{ label: '通知' }]}
        >
            <Head title="通知一覧" />

            {flash?.error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                    {flash.error}
                </div>
            )}

            <div className="mb-5">
                <h1 className="flex items-center text-2xl font-bold tracking-tight text-brand-dark">
                    <span className="mr-2.5 inline-block h-6 w-1 rounded-sm bg-brand-accent" />
                    通知一覧
                </h1>
                <p className="mt-1 text-sm text-brand-muted">
                    全{notifications.meta.total}件
                </p>
            </div>

            <section className="overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm">
                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                        <Bell className="h-10 w-10 text-brand-muted" aria-hidden />
                        <p className="text-sm font-medium text-brand-dark">通知はありません</p>
                        <p className="max-w-sm text-xs text-brand-muted">
                            申請・承認の更新があると、ここに表示されます。
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-brand-border">
                        {notifications.data.map((item) => {
                            const unread = item.readAt === null;
                            const projectId = metaProjectId(item.meta);
                            const typeBadge = notificationTypeBadge(item.type);

                            return (
                                <li
                                    key={item.id}
                                    className={cn(
                                        'flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between',
                                        unread && 'bg-[#F8FAFC]',
                                    )}
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-semibold text-brand-dark">
                                                {item.title}
                                            </span>
                                            <span
                                                className={cn(
                                                    'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                                    typeBadge.className,
                                                )}
                                            >
                                                {typeBadge.label}
                                            </span>
                                            {unread && (
                                                <span className="rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                                                    未読
                                                </span>
                                            )}
                                            <span className="text-xs text-brand-muted">
                                                {new Date(item.createdAt).toLocaleString('ja-JP', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        {item.body && (
                                            <p className="mt-1 text-sm text-brand-muted">{item.body}</p>
                                        )}
                                        {projectId !== null && (
                                            <div className="mt-2">
                                                <Link
                                                    href={route('projects.show', projectId)}
                                                    className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline"
                                                >
                                                    案件を開く
                                                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
                                        {unread && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="outline"
                                                className="gap-1"
                                                onClick={() => markRead(item.id)}
                                            >
                                                <Check className="h-3.5 w-3.5" aria-hidden />
                                                既読にする
                                            </Button>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {notifications.meta.last_page > 1 && (
                    <nav
                        className="flex flex-wrap items-center justify-center gap-1 border-t border-brand-border bg-brand-bg px-3 py-3"
                        aria-label="ページ送り"
                    >
                        {notifications.links.map((link, index) => {
                            const label = link.label
                                .replace(/&laquo;/g, '«')
                                .replace(/&raquo;/g, '»')
                                .replace(/&nbsp;/g, ' ');

                            if (!link.url) {
                                return (
                                    <span
                                        key={`${link.label}-${index}`}
                                        className={cn(
                                            'rounded px-2 py-1 text-xs text-brand-muted',
                                            link.active && 'font-semibold text-brand-dark',
                                        )}
                                    >
                                        {label}
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url}
                                    preserveScroll
                                    className={cn(
                                        'rounded px-2 py-1 text-xs transition-colors hover:bg-white',
                                        link.active && 'bg-white font-semibold text-brand-blue shadow-sm',
                                    )}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </nav>
                )}
            </section>
        </AuthenticatedLayout>
    );
}
