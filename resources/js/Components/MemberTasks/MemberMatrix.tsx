import {
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    User,
    UserCheck,
} from 'lucide-react';

import type { MemberTaskItem } from '@/types/memberTasks';
import { cn } from '@/lib/utils';

import TaskCard from './TaskCard';

interface MatrixMemberRow {
    user: {
        id: number;
        name: string;
        isSelf: boolean;
        roles: string[];
    };
    stats: {
        overdueCount: number;
        soonCount: number;
        resolvedReporterCount: number;
        resolvedReviewerCount: number;
        loadCount: number;
        loadPct: number;
        totalCount: number;
        inProgressCount: number;
    };
    buckets: {
        open: MemberTaskItem[];
        in_progress: MemberTaskItem[];
        done: MemberTaskItem[];
    };
}

interface MemberMatrixProps {
    members: MatrixMemberRow[];
    columnCounts: { open: number; in_progress: number; done: number };
    onOpenTask: (task: MemberTaskItem) => void;
}

function roleLabel(roles: string[]): string {
    if (roles.includes('dept_manager')) return '部門管理者';
    if (roles.includes('hq_manager')) return '本部管理者';
    if (roles.includes('applicant')) return '申請者';
    return 'メンバー';
}

function loadBarColor(loadCount: number): string {
    if (loadCount > 8) return 'bg-brand-red';
    const pct = (loadCount / 8) * 100;
    if (pct > 75) return 'bg-[#F59E0B]';
    if (pct > 50) return 'bg-brand-blue';

    return 'bg-[#16A34A]';
}

export default function MemberMatrix({ members, columnCounts, onOpenTask }: MemberMatrixProps) {
    return (
        <div
            className="grid overflow-hidden rounded-[10px] border border-brand-border bg-white"
            style={{
                gridTemplateColumns: '240px 1fr 1fr 1fr 90px',
            }}
        >
            <div className="flex items-center gap-1.5 border-b border-brand-border bg-[#F1F3F5] px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                <User className="h-3.5 w-3.5" />
                メンバー
            </div>
            <MatrixHead title="未着手" dot="bg-gray-400" count={columnCounts.open} />
            <MatrixHead title="進行中" dot="bg-brand-blue" count={columnCounts.in_progress} />
            <MatrixHead
                title="完了"
                subtitle="(確認待ち含・30日)"
                dot="bg-[#16A34A]"
                count={columnCounts.done}
            />
            <div className="flex items-center justify-center border-b border-brand-border bg-[#F1F3F5] text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                合計
            </div>

            {members.map((row, idx) => (
                <MemberMatrixRow key={row.user.id || idx} row={row} onOpenTask={onOpenTask} />
            ))}
        </div>
    );
}

function MatrixHead({
    title,
    subtitle,
    dot,
    count,
}: {
    title: string;
    subtitle?: string;
    dot: string;
    count: number;
}) {
    return (
        <div className="flex items-center justify-between border-b border-brand-border bg-[#F1F3F5] px-3 py-2.5">
            <span className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                <span className={`h-2 w-2 rounded-full ${dot}`} />
                <span className="normal-case">{title}</span>
                {subtitle && (
                    <span className="text-[9px] font-normal normal-case text-brand-muted">{subtitle}</span>
                )}
            </span>
            <span className="rounded border border-brand-border bg-white px-1.5 font-mono text-[10px] text-brand-muted">
                {count}
            </span>
        </div>
    );
}

function MemberMatrixRow({
    row,
    onOpenTask,
}: {
    row: MatrixMemberRow;
    onOpenTask: (task: MemberTaskItem) => void;
}) {
    const { user, stats, buckets } = row;
    const showOkBadge =
        stats.overdueCount === 0 &&
        stats.soonCount === 0 &&
        stats.resolvedReporterCount === 0 &&
        stats.resolvedReviewerCount === 0;

    return (
        <>
            <div className="border-b border-brand-border bg-[#FAFBFC] p-2.5">
                <div className="flex gap-2">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 text-sm font-semibold text-white">
                        {user.name.trim()[0] ?? '?'}
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="truncate text-sm font-semibold text-brand-dark">{user.name}</span>
                            {user.isSelf && (
                                <span className="rounded bg-brand-blue px-1.5 py-0.5 text-[9px] font-medium text-white">
                                    自分
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-brand-muted">
                            {roleLabel(user.roles)} / 所属部門メンバー
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                            {stats.overdueCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-900">
                                    <AlertCircle className="h-2.5 w-2.5" />
                                    超過 {stats.overdueCount}
                                </span>
                            )}
                            {stats.soonCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                                    <AlertTriangle className="h-2.5 w-2.5" />
                                    3日以内 {stats.soonCount}
                                </span>
                            )}
                            {stats.resolvedReporterCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-900">
                                    <UserCheck className="h-2.5 w-2.5" />
                                    確認待ち {stats.resolvedReporterCount}
                                </span>
                            )}
                            {stats.resolvedReviewerCount > 0 && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-900">
                                    <UserCheck className="h-2.5 w-2.5" />
                                    確認依頼 {stats.resolvedReviewerCount}
                                </span>
                            )}
                            {showOkBadge && (
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-900">
                                    <CheckCircle className="h-2.5 w-2.5" />
                                    順調
                                </span>
                            )}
                        </div>
                        <div className="mt-2">
                            <div className="mb-0.5 flex justify-between text-[9px] text-brand-muted">
                                <span>
                                    負荷 {stats.loadCount}/8
                                </span>
                            </div>
                            <div className="h-[5px] overflow-hidden rounded-full bg-[#E9ECEF]">
                                <div
                                    className={cn('h-full rounded-full', loadBarColor(stats.loadCount))}
                                    style={{
                                        width: `${Math.min(100, Math.round((stats.loadCount / 8) * 100))}%`,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MatrixCell tasks={buckets.open} onOpenTask={onOpenTask} />
            <MatrixCell tasks={buckets.in_progress} onOpenTask={onOpenTask} />
            <MatrixCell tasks={buckets.done} onOpenTask={onOpenTask} resolvedMixed />
            <div className="flex items-center justify-center border-b border-l border-brand-border bg-[#FAFBFC] p-2">
                <div className="text-center">
                    <div className="font-mono text-lg font-bold text-brand-dark">{stats.totalCount}</div>
                    <div className="text-[10px] text-brand-muted">件</div>
                </div>
            </div>
        </>
    );
}

function MatrixCell({
    tasks,
    onOpenTask,
    resolvedMixed,
}: {
    tasks: MemberTaskItem[];
    onOpenTask: (task: MemberTaskItem) => void;
    resolvedMixed?: boolean;
}) {
    if (tasks.length === 0) {
        return (
            <div className="flex min-h-[80px] items-center justify-center border-b border-l border-dashed border-gray-200 p-2 text-[11px] text-slate-300">
                —
            </div>
        );
    }

    return (
        <div className="space-y-1.5 border-b border-l border-dashed border-gray-200 p-2">
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className={cn(
                        resolvedMixed && task.status === 'resolved' && 'rounded-md ring-1 ring-[#7C3AED]/30',
                    )}
                >
                    <TaskCard task={task} variant="matrix" onOpenTask={onOpenTask} />
                    {resolvedMixed && task.status === 'resolved' && (
                        <p className="mt-0.5 flex items-center justify-end gap-0.5 text-[9px] font-medium text-[#7C3AED]">
                            <UserCheck className="h-2.5 w-2.5" />
                            確認待ち
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
}
