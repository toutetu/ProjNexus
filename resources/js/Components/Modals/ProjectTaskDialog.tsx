import { Link, router } from '@inertiajs/react';
import {
    Activity,
    Calendar,
    Check,
    ChevronDown,
    ChevronUp,
    Clock3,
    Edit3,
    Folder,
    History,
    ListChecks,
    MessageSquare,
    Send,
    Trash2,
} from 'lucide-react';
import { type KeyboardEventHandler, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Infotip } from '@/Components/ui/infotip';
import { cn } from '@/lib/utils';

export type TaskStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TaskType = 'task' | 'feature' | 'improvement' | 'bug';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface TaskCommentItem {
    id: number;
    user: string;
    body: string;
    createdAt: string | null;
}

export interface TaskListItem {
    id: number;
    title: string;
    description: string | null;
    taskType: TaskType;
    priority: TaskPriority;
    status: TaskStatus;
    progressRate: number;
    estimatedDays?: number | null;
    actualDays?: number | null;
    assigneeId: number | null;
    assignee: string | null;
    reviewerId?: number | null;
    reviewer?: string | null;
    dueDate: string | null;
    updatedAt: string | null;
    canUpdate?: boolean;
    comments?: TaskCommentItem[];
    histories?: TaskHistoryItem[];
}

export interface TaskHistoryItem {
    id: number;
    user: string;
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    createdAt: string | null;
}

interface ProjectTaskDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: number;
    projectTitle: string;
    task: TaskListItem | null;
    assignees: Array<{ id: number; name: string }>;
    readOnly?: boolean;
    returnTo?: string;
}

type ChipOption<T extends string> = {
    value: T;
    label: string;
    activeClass: string;
};

const TYPE_OPTIONS: ChipOption<TaskType>[] = [
    { value: 'task', label: 'タスク', activeClass: 'bg-gray-700 border-gray-700 text-white' },
    {
        value: 'feature',
        label: '機能追加',
        activeClass: 'bg-blue-800 border-blue-800 text-white',
    },
    {
        value: 'improvement',
        label: '改善',
        activeClass: 'bg-emerald-800 border-emerald-800 text-white',
    },
    { value: 'bug', label: 'バグ', activeClass: 'bg-red-800 border-red-800 text-white' },
];

const PRIORITY_OPTIONS: ChipOption<TaskPriority>[] = [
    { value: 'high', label: '高', activeClass: 'bg-red-600 border-red-600 text-white' },
    { value: 'medium', label: '中', activeClass: 'bg-yellow-600 border-yellow-600 text-white' },
    { value: 'low', label: '低', activeClass: 'bg-brand-blue border-brand-blue text-white' },
];

const STATUS_OPTIONS: ChipOption<TaskStatus>[] = [
    { value: 'open', label: '未着手', activeClass: 'bg-gray-600 border-gray-600 text-white' },
    {
        value: 'in_progress',
        label: '進行中',
        activeClass: 'bg-brand-blue border-brand-blue text-white',
    },
    {
        value: 'resolved',
        label: '確認待ち',
        activeClass: 'bg-[#7C3AED] border-[#7C3AED] text-white',
    },
    { value: 'closed', label: '完了', activeClass: 'bg-green-600 border-green-600 text-white' },
];

const formatRelativeDays = (dueDate: string): { label: string; isOverdue: boolean } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${dueDate}T00:00:00`);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { label: `${Math.abs(diffDays)}日超過`, isOverdue: true };
    }
    if (diffDays === 0) {
        return { label: '本日期日', isOverdue: false };
    }
    return { label: `あと ${diffDays} 日`, isOverdue: false };
};

const commentTimeLabel = (createdAt: string | null): string => {
    if (!createdAt) return '日時不明';

    const created = new Date(createdAt);
    if (Number.isNaN(created.getTime())) return createdAt;
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
        return new Intl.DateTimeFormat('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(created);
    }

    if (diffMinutes < 1) return 'たった今';
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    const yyyy = created.getFullYear();
    const mm = String(created.getMonth() + 1).padStart(2, '0');
    const dd = String(created.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
};

const avatarText = (name: string): string => {
    const trimmed = name.trim();
    return trimmed.length === 0 ? '?' : trimmed[0];
};

const historyFieldLabel = (fieldName: string): string => {
    const map: Record<string, string> = {
        created: '新規作成',
        title: 'タイトル',
        task_type: '種類',
        priority: '優先度',
        status: 'ステータス',
        progress_rate: '進捗率',
        assignee_id: '担当者',
        reviewer_id: '確認者',
        due_date: '期日',
        description: '説明',
        estimated_days: '計画工数',
        actual_days: '実績工数',
    };

    return map[fieldName] ?? fieldName;
};

export default function ProjectTaskDialog({
    open,
    onClose,
    projectId,
    projectTitle,
    task,
    assignees,
    readOnly = false,
    returnTo,
}: ProjectTaskDialogProps) {
    const [title, setTitle] = useState('');
    const [taskType, setTaskType] = useState<TaskType>('task');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [status, setStatus] = useState<TaskStatus>('open');
    const [progressRate, setProgressRate] = useState(0);
    const [assigneeId, setAssigneeId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [reviewerId, setReviewerId] = useState('');
    const [description, setDescription] = useState('');
    const [estimatedDaysInput, setEstimatedDaysInput] = useState('');
    const [actualDaysInput, setActualDaysInput] = useState('');
    const [commentBody, setCommentBody] = useState('');
    const [processing, setProcessing] = useState(false);
    const [postingComment, setPostingComment] = useState(false);
    const [pendingCommentScroll, setPendingCommentScroll] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const latestCommentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        setTitle(task?.title ?? '');
        setTaskType(task?.taskType ?? 'task');
        setPriority(task?.priority ?? 'medium');
        setStatus(task?.status ?? 'open');
        setProgressRate(task?.progressRate ?? 0);
        setAssigneeId(task?.assigneeId ? String(task.assigneeId) : '');
        setReviewerId(task?.reviewerId ? String(task.reviewerId) : '');
        setDueDate(task?.dueDate ?? '');
        setDescription(task?.description ?? '');
        setEstimatedDaysInput(
            task?.estimatedDays !== undefined && task.estimatedDays !== null
                ? String(task.estimatedDays)
                : '',
        );
        setActualDaysInput(
            task?.actualDays !== undefined && task.actualDays !== null ? String(task.actualDays) : '',
        );
        setCommentBody('');
        setProcessing(false);
        setPostingComment(false);
        setPendingCommentScroll(false);
        setHistoryOpen(false);
    }, [open, task]);

    useEffect(() => {
        if (!open || !pendingCommentScroll) return;
        if (!task || (task.comments?.length ?? 0) === 0) return;

        latestCommentRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
        });
        setPendingCommentScroll(false);
    }, [open, pendingCommentScroll, task, task?.comments?.length]);

    const effectiveProgress = useMemo(() => {
        if (status === 'open') return 0;
        if (status === 'closed') return 100;
        if (status === 'resolved') return progressRate;
        return progressRate;
    }, [progressRate, status]);

    const allowEdit = readOnly === false;
    const headingVerb = !task ? '追加' : allowEdit ? '編集' : '閲覧';

    const taskCode = useMemo(() => {
        if (!task) return null;
        return `TASK-${String(projectId).padStart(4, '0')}-${String(task.id).padStart(3, '0')}`;
    }, [projectId, task]);

    const dueInfo = useMemo(() => {
        if (!dueDate) return null;
        return formatRelativeDays(dueDate);
    }, [dueDate]);

    const submit = () => {
        if (!allowEdit) return;

        setProcessing(true);

        const estimatedLabor = ((): number | null => {
            const t = estimatedDaysInput.trim();
            if (t === '') return null;
            const n = Number.parseFloat(t.replace(',', '.'));
            return Number.isNaN(n) ? null : n;
        })();
        const actualLabor = ((): number => {
            const t = actualDaysInput.trim();
            if (t === '') return 0;
            const n = Number.parseFloat(t.replace(',', '.'));
            return Number.isNaN(n) ? 0 : n;
        })();

        const payload = {
            title,
            task_type: taskType,
            priority,
            status,
            progress_rate: effectiveProgress,
            assignee_id: assigneeId === '' ? null : Number(assigneeId),
            reviewer_id: reviewerId === '' ? null : Number(reviewerId),
            due_date: dueDate === '' ? null : dueDate,
            description: description.trim() === '' ? null : description,
            estimated_days: estimatedLabor,
            actual_days: actualLabor,
            return_to: returnTo ?? null,
        };

        const options = {
            preserveScroll: true,
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        };

        if (task) {
            router.put(route('projects.tasks.update', [projectId, task.id]), payload, options);
            return;
        }

        router.post(route('projects.tasks.store', projectId), payload, options);
    };

    const destroy = () => {
        if (!allowEdit || !task || !window.confirm('このタスクを削除しますか？')) return;

        setProcessing(true);
        router.delete(route('projects.tasks.destroy', [projectId, task.id]), {
            data: { return_to: returnTo ?? null },
            preserveScroll: true,
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    };

    const submitComment = () => {
        if (!allowEdit || !task || commentBody.trim() === '') return;
        setPostingComment(true);
        setPendingCommentScroll(true);
        router.post(
            route('projects.tasks.comments.store', [projectId, task.id]),
            { body: commentBody.trim(), return_to: returnTo ?? null },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setCommentBody(''),
                onFinish: () => setPostingComment(false),
            },
        );
    };

    const onCommentKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            submitComment();
        }
    };

    const chipClass = (active: boolean, activeClass: string) =>
        cn(
            'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
            active ? activeClass : 'border-brand-border bg-white text-brand-muted hover:bg-brand-bg',
        );

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
            <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
                <DialogHeader className="border-b border-brand-border px-6 py-4">
                        <DialogTitle className="flex items-center gap-1.5 text-xs font-medium text-brand-muted">
                        <Edit3 className="h-3.5 w-3.5 text-brand-blue" />
                        タスクを{headingVerb}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-1.5 text-base font-semibold text-brand-dark">
                        <Folder className="h-4 w-4 text-brand-muted" />
                        <Link
                            href={route('projects.show', { project: projectId, detailTab: 'tasks' })}
                            className="max-w-[22rem] truncate text-brand-dark hover:text-brand-blue hover:underline"
                        >
                            {projectTitle}
                        </Link>
                        {taskCode && (
                            <span className="font-mono text-xs font-medium text-brand-muted">/ {taskCode}</span>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-5 pt-0">
                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-brand-dark">
                            タイトル <span className="text-brand-red">*</span>
                        </label>
                        <input
                            value={title}
                            disabled={!allowEdit}
                            onChange={(event) => setTitle(event.target.value.slice(0, 120))}
                            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:cursor-not-allowed disabled:bg-brand-bg"
                            placeholder="例：IoTゲートウェイ設計書作成"
                        />
                        <div className="mt-1 text-right font-mono text-[10px] text-brand-muted">
                            {title.length} / 120
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <ChipGroup
                            label="種類"
                            options={TYPE_OPTIONS}
                            value={taskType}
                            onChange={setTaskType}
                            chipClass={chipClass}
                            disabled={!allowEdit}
                        />

                        <ChipGroup
                            label="優先度"
                            options={PRIORITY_OPTIONS}
                            value={priority}
                            onChange={setPriority}
                            chipClass={chipClass}
                            disabled={!allowEdit}
                        />
                    </div>

                    <ChipGroup
                        label="ステータス"
                        options={STATUS_OPTIONS}
                        value={status}
                        onChange={setStatus}
                        chipClass={chipClass}
                        disabled={!allowEdit}
                    />

                    {status === 'in_progress' && (
                        <div className="rounded-lg border border-brand-border bg-brand-bg p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-dark">
                                    <Activity className="h-3.5 w-3.5 text-brand-blue" />
                                    進捗
                                </p>
                                <span className="font-mono text-lg font-bold text-brand-blue">
                                    {effectiveProgress}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={progressRate}
                                disabled={!allowEdit}
                                onChange={(event) => setProgressRate(Number(event.target.value))}
                                className="w-full accent-[#106EBE] disabled:opacity-50"
                            />
                            <div className="mt-1 flex justify-between font-mono text-[10px] text-brand-muted">
                                <span>0%</span>
                                <span>25%</span>
                                <span>50%</span>
                                <span>75%</span>
                                <span>100%</span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-brand-dark">担当者</label>
                            <div className="relative">
                                <select
                                    value={assigneeId}
                                    disabled={!allowEdit}
                                    onChange={(event) => setAssigneeId(event.target.value)}
                                    className="w-full appearance-none rounded-md border border-brand-border bg-white px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:cursor-not-allowed disabled:bg-brand-bg"
                                >
                                    <option value="">未割当</option>
                                    {assignees.map((assignee) => (
                                        <option key={assignee.id} value={assignee.id}>
                                            {assignee.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-brand-dark">
                                確認者 <span className="text-brand-red">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={reviewerId}
                                    disabled={!allowEdit}
                                    onChange={(event) => setReviewerId(event.target.value)}
                                    className="w-full appearance-none rounded-md border border-brand-border bg-white px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:cursor-not-allowed disabled:bg-brand-bg"
                                >
                                    <option value="">選択してください</option>
                                    {assignees.map((assignee) => (
                                        <option key={assignee.id} value={assignee.id}>
                                            {assignee.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                            </div>
                            {status === 'resolved' && (
                                <p className="mt-1 text-[10px] text-brand-muted">
                                    確認待ちでは確認者が完了内容を確認します。
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-brand-dark">期日</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={dueDate}
                                    disabled={!allowEdit}
                                    onChange={(event) => setDueDate(event.target.value)}
                                    className="w-full rounded-md border border-brand-border px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:cursor-not-allowed disabled:bg-brand-bg"
                                />
                                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                            </div>
                            {dueInfo && (
                                <p
                                    className={cn(
                                        'mt-1 flex items-center gap-1 text-[10px]',
                                        dueInfo.isOverdue ? 'text-brand-red' : 'text-brand-muted',
                                    )}
                                >
                                    <Clock3 className="h-3 w-3" />
                                    {dueInfo.label}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <div className="mb-1.5 flex items-center gap-1.5">
                                <label className="block text-xs font-semibold text-brand-dark">
                                    計画工数（人日）
                                </label>
                                <Infotip ariaLabel="計画工数の説明">
                                    タスク単位の見込み工数です。空欄は未設定として集計から除外されます。
                                </Infotip>
                            </div>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={estimatedDaysInput}
                                disabled={!allowEdit}
                                onChange={(event) => setEstimatedDaysInput(event.target.value)}
                                placeholder="例: 3 または 2.5"
                                className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:cursor-not-allowed disabled:bg-brand-bg"
                            />
                        </div>
                        <div>
                            <div className="mb-1.5 flex items-center gap-1.5">
                                <label className="block text-xs font-semibold text-brand-dark">
                                    実績工数（人日）
                                </label>
                                <Infotip ariaLabel="実績工数の説明">
                                    実際に投入した工数の目安です。
                                </Infotip>
                            </div>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={actualDaysInput}
                                disabled={!allowEdit}
                                onChange={(event) => setActualDaysInput(event.target.value)}
                                placeholder="例: 0"
                                className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:cursor-not-allowed disabled:bg-brand-bg"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-semibold text-brand-dark">説明</label>
                        <textarea
                            value={description}
                            disabled={!allowEdit}
                            onChange={(event) => setDescription(event.target.value)}
                            rows={4}
                            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:cursor-not-allowed disabled:bg-brand-bg"
                            placeholder="タスクの詳細や受入基準を記入"
                        />
                    </div>

                    <div className="border-t border-brand-border pt-4">
                        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-dark">
                            <MessageSquare className="h-4 w-4 text-brand-muted" />
                            コメント
                            {task && (
                                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-brand-muted">
                                    {(task.comments ?? []).length}
                                </span>
                            )}
                        </div>

                        {task ? (
                            <>
                                <div className="mb-4 space-y-3">
                                    {(task.comments ?? []).length === 0 ? (
                                        <p className="text-xs text-brand-muted">
                                            まだコメントはありません。
                                        </p>
                                    ) : (
                                        (task.comments ?? []).map((comment, index, comments) => (
                                            <div
                                                key={comment.id}
                                                ref={
                                                    index === comments.length - 1
                                                        ? latestCommentRef
                                                        : null
                                                }
                                                className="flex gap-2.5"
                                            >
                                                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 text-[10px] font-semibold text-white">
                                                    {avatarText(comment.user)}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium">
                                                            {comment.user}
                                                        </span>
                                                        <span className="text-[10px] text-brand-muted">
                                                            {commentTimeLabel(comment.createdAt)}
                                                        </span>
                                                    </div>
                                                    <div className="mt-0.5 rounded-md border border-brand-border bg-gray-50 p-2.5 text-sm text-brand-dark">
                                                        {comment.body}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="flex gap-2.5">
                                    <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 text-[10px] font-semibold text-white">
                                        自
                                    </span>
                                    <div className="flex-1">
                                        <textarea
                                            rows={2}
                                            value={commentBody}
                                            disabled={!allowEdit}
                                            onChange={(event) => setCommentBody(event.target.value)}
                                            onKeyDown={onCommentKeyDown}
                                            placeholder="コメントを追加..."
                                            className="w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:cursor-not-allowed disabled:bg-brand-bg"
                                        />
                                        <div className="mt-2 flex items-center justify-end gap-2">
                                            <p className="text-[10px] text-brand-muted">
                                                Windows: Ctrl + Enter で送信
                                            </p>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="gap-1.5"
                                                disabled={
                                                    !allowEdit ||
                                                    postingComment ||
                                                    commentBody.trim() === ''
                                                }
                                                onClick={submitComment}
                                            >
                                                <Send className="h-3.5 w-3.5" />
                                                投稿
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-brand-muted">
                                コメントはタスク保存後に追加できます。
                            </p>
                        )}
                    </div>

                    <div className="border-t border-brand-border pt-3">
                        <button
                            type="button"
                            className="flex w-full items-center justify-between text-sm text-brand-muted hover:text-brand-dark"
                            onClick={() => setHistoryOpen((prev) => !prev)}
                        >
                            <span className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                変更履歴（{task?.histories?.length ?? 0}件）
                            </span>
                            {historyOpen ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                        </button>

                        {historyOpen && (
                            <div className="mt-3 space-y-2">
                                {(task?.histories?.length ?? 0) === 0 ? (
                                    <p className="text-xs text-brand-muted">変更履歴はありません。</p>
                                ) : (
                                    (task?.histories ?? []).map((history) => (
                                        <div
                                            key={history.id}
                                            className="rounded-md border border-brand-border bg-gray-50 p-2.5 text-xs"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-brand-dark">
                                                    {history.user}
                                                </span>
                                                <span className="text-brand-muted">
                                                    {commentTimeLabel(history.createdAt)}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-brand-dark">
                                                {history.fieldName === 'created'
                                                    ? history.newValue ?? 'タスクを新規作成'
                                                    : `${historyFieldLabel(history.fieldName)}: ${history.oldValue ?? '—'} → ${history.newValue ?? '—'}`}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="sticky bottom-0 items-center justify-between border-t border-brand-border bg-white px-6 py-4 sm:justify-between">
                    <div>
                        {task && allowEdit && (
                            <Button
                                type="button"
                                variant="outline"
                                className="gap-1.5 border-brand-red text-brand-red hover:bg-red-50 hover:text-brand-red"
                                onClick={destroy}
                                disabled={processing}
                            >
                                <Trash2 className="h-4 w-4" />
                                削除
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            {allowEdit ? 'キャンセル' : '閉じる'}
                        </Button>
                        {allowEdit && (
                            <Button
                                type="button"
                                className="gap-1.5 bg-brand-red hover:bg-brand-red/90"
                                onClick={submit}
                                disabled={
                                    processing ||
                                    title.trim().length === 0 ||
                                    reviewerId === ''
                                }
                            >
                                <Check className="h-4 w-4" />
                                保存
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ChipGroup<T extends string>({
    label,
    options,
    value,
    onChange,
    chipClass,
    disabled = false,
}: {
    label: string;
    options: ChipOption<T>[];
    value: T;
    onChange: (value: T) => void;
    chipClass: (active: boolean, activeClass: string) => string;
    disabled?: boolean;
}) {
    return (
        <div>
            <p className="mb-2 text-xs font-semibold text-brand-dark">{label}</p>
            <div className="flex flex-wrap gap-1.5">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        disabled={disabled}
                        className={cn(
                            chipClass(value === option.value, option.activeClass),
                            disabled && 'cursor-not-allowed opacity-45',
                        )}
                        onClick={() => onChange(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
