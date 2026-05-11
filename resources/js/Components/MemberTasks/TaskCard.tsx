import { Link } from '@inertiajs/react';
import { useRef } from 'react';
import {
    Bug,
    CheckCircle2,
    CheckSquare,
    Sparkles,
    UserCheck,
    Wrench,
    type LucideIcon,
} from 'lucide-react';

import type { MemberTaskItem } from '@/types/memberTasks';
import { cn } from '@/lib/utils';

const TYPE_ICON: Record<MemberTaskItem['taskType'], LucideIcon> = {
    task: CheckSquare,
    bug: Bug,
    feature: Sparkles,
    improvement: Wrench,
};

/** モック s14b（種類チップ）と同一ガイド */
const TYPE_CLASS: Record<MemberTaskItem['taskType'], string> = {
    task: 'bg-[#E0E7FF] text-[#3730A3]',
    bug: 'bg-[#FEE2E2] text-[#991B1B]',
    feature: 'bg-[#D1FAE5] text-[#065F46]',
    improvement: 'bg-[#FEF3C7] text-[#92400E]',
};

const PRI_CLASS: Record<MemberTaskItem['priority'], string> = {
    high: 'bg-red-100 text-red-900',
    medium: 'bg-amber-100 text-amber-900',
    low: 'bg-gray-200 text-gray-800',
};

function formatDueMeta(dueDate: string | null): {
    label: string;
    tone: 'overdue' | 'soon' | 'normal';
    daysOverdue?: number;
} | null {
    if (!dueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${dueDate}T00:00:00`);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { label: '', tone: 'overdue', daysOverdue: Math.abs(diffDays) };
    }
    if (diffDays <= 3) {
        return { label: `あと${diffDays}日`, tone: 'soon' };
    }
    return { label: '', tone: 'normal' };
}

function formatShortDate(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}/${dd}`;
}

interface TaskCardProps {
    task: MemberTaskItem;
    variant: 'kanban' | 'matrix';
    onOpenTask: (task: MemberTaskItem) => void;
    draggable?: boolean;
    onDragStart?: (task: MemberTaskItem) => void;
    onDragEnd?: () => void;
}

export default function TaskCard({
    task,
    variant,
    onOpenTask,
    draggable = false,
    onDragStart,
    onDragEnd,
}: TaskCardProps) {
    const draggingRef = useRef(false);
    const TypeIcon = TYPE_ICON[task.taskType];
    const dueMeta = formatDueMeta(task.dueDate);
    const isOverdue = dueMeta?.tone === 'overdue' && task.status !== 'closed';
    const isSoon = dueMeta?.tone === 'soon' && task.status !== 'closed';
    const isResolved = task.status === 'resolved';
    const isClosed = task.status === 'closed';

    const prjRef = `PRJ-${String(task.projectId).padStart(4, '0')}`;
    const titleMax = variant === 'matrix' ? 14 : 22;
    const projectTitle =
        task.projectTitle.length > titleMax
            ? `${task.projectTitle.slice(0, titleMax)}…`
            : task.projectTitle;

    const wrapperClass =
        variant === 'kanban'
            ? 'rounded-lg border border-brand-border bg-white p-2.5 shadow-sm transition hover:border-brand-blue hover:shadow-md'
            : 'rounded-md border border-brand-border bg-white p-2 text-[12px] leading-snug transition hover:border-brand-blue hover:shadow-sm';

    return (
        <div
            role="button"
            tabIndex={0}
            draggable={draggable}
            className={cn(
                wrapperClass,
                'cursor-pointer text-left',
                isOverdue && 'border-brand-red shadow-[0_0_0_1px_rgba(230,0,19,.15)]',
                isSoon && !isOverdue && 'border-[#F59E0B] shadow-[0_0_0_1px_rgba(245,158,11,.15)]',
                isResolved && 'border-[#7C3AED] shadow-[0_0_0_1px_rgba(124,58,237,.10)]',
                isClosed && 'opacity-[0.85]',
            )}
            onClick={() => {
                if (draggingRef.current) {
                    draggingRef.current = false;
                    return;
                }
                onOpenTask(task);
            }}
            onDragStart={(e) => {
                if (!draggable) return;
                draggingRef.current = true;
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(task.id));
                onDragStart?.(task);
            }}
            onDragEnd={() => onDragEnd?.()}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenTask(task);
                }
            }}
        >
            <div className="mb-1.5 flex min-w-0 items-center gap-1.5 text-[10px] text-brand-muted">
                <span className="shrink-0 font-mono">{prjRef}</span>
                <Link
                    href={`/projects/${task.projectId}?detailTab=tasks`}
                    className="min-w-0 truncate font-medium text-brand-dark hover:text-brand-blue hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    {projectTitle}
                </Link>
                <span
                    className={cn(
                        'ml-auto inline-flex shrink-0 items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium',
                        TYPE_CLASS[task.taskType],
                    )}
                >
                    <TypeIcon className="h-2.5 w-2.5" />
                    {task.taskType}
                </span>
            </div>

            <p
                className={cn(
                    'font-medium text-brand-dark',
                    variant === 'kanban' ? 'mb-2 text-sm leading-snug' : 'mtx-title mb-1 font-medium',
                    isClosed && 'text-brand-muted line-through',
                )}
            >
                {task.title}
            </p>

            {task.status === 'in_progress' && (
                <div className="mb-1">
                    <div className="h-[3px] overflow-hidden rounded-full bg-[#E9ECEF]">
                        <div
                            className="h-full rounded-full bg-brand-blue"
                            style={{ width: `${Math.min(task.progressRate, 100)}%` }}
                        />
                    </div>
                    <div className="mt-0.5 flex justify-between font-mono text-[10px] text-brand-muted">
                        <span />
                        <span>{task.progressRate}%</span>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between gap-1">
                <div className="flex min-w-0 items-center gap-1">
                    <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 text-[10px] font-semibold text-white">
                        {(task.assignee ?? '?').trim()[0] ?? '?'}
                    </span>
                    <span className="truncate text-xs text-brand-muted">{task.assignee ?? '未割当'}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <span
                        className={cn(
                            'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold',
                            PRI_CLASS[task.priority],
                        )}
                    >
                        {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                    </span>
                    {task.dueDate && (
                        <span
                            className={cn(
                                'font-mono text-[11px]',
                                isOverdue ? 'font-semibold text-brand-red' : isSoon ? 'font-semibold text-[#C2410C]' : 'text-brand-muted',
                            )}
                        >
                            {task.dueDate.slice(5).replace('-', '/')}
                        </span>
                    )}
                </div>
            </div>

            {isOverdue && dueMeta?.daysOverdue !== undefined && variant === 'kanban' && (
                <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-brand-red">
                    期限超過 {dueMeta.daysOverdue}日
                </p>
            )}

            {isResolved && variant === 'kanban' && task.reviewer && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1 border-t border-dashed border-gray-200 pt-1.5 text-[10px] text-[#5B21B6]">
                    <UserCheck className="h-3 w-3 shrink-0" />
                    <span>確認者：</span>
                    <span className="font-medium">{task.reviewer}</span>
                    <span className="ml-auto text-[9px] text-brand-muted">
                        報告 {formatShortDate(task.updatedAt)}
                    </span>
                </div>
            )}

            {isClosed && variant === 'kanban' && (
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-brand-muted">
                    <span className="flex items-center gap-1 text-[#16A34A]">
                        <CheckCircle2 className="h-3 w-3" />
                        {formatShortDate(task.updatedAt)}
                    </span>
                    {task.reviewer && <span>確認 {task.reviewer}</span>}
                </div>
            )}

            {variant === 'matrix' && isResolved && (
                <p className="mt-1 text-[9px] text-brand-muted">確認者：{task.reviewer ?? '—'}</p>
            )}
        </div>
    );
}
