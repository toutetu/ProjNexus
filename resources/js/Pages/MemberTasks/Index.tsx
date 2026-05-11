import { Head, router } from '@inertiajs/react';
import { AlertCircle, GitBranch, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import KanbanBoard from '@/Components/MemberTasks/KanbanBoard';
import MemberMatrix from '@/Components/MemberTasks/MemberMatrix';
import ViewToggle, { type ViewMode } from '@/Components/MemberTasks/ViewToggle';
import ProjectTaskDialog, { type TaskListItem } from '@/Components/Modals/ProjectTaskDialog';
import { Input } from '@/Components/ui/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { MemberTaskItem } from '@/types/memberTasks';

interface DepartmentOption {
    id: number;
    name: string;
}

interface MatrixMemberPayload {
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

interface Kpis {
    total: number;
    overdue: number;
    soon: number;
    completionRate: number;
    closedCount: number;
}

interface Props {
    view: ViewMode;
    defaultView: ViewMode;
    departmentId: number | null;
    departmentName: string | null;
    departments: DepartmentOption[];
    memberCount: number;
    taskTotalCount: number;
    needsDepartmentSelection: boolean;
    filters: {
        keyword: string;
        assignee_id: number | null;
        project_id: number | null;
        priority: string;
        due: string;
    };
    sort: string;
    kpis: Kpis | null;
    tasks: MemberTaskItem[];
    matrixMembers: MatrixMemberPayload[];
    matrixColumnCounts: { open: number; in_progress: number; done: number } | null;
    approvedProjects: { id: number; title: string }[];
    assigneesForDept: { id: number; name: string }[];
    rolesMeta: {
        isHqManager: boolean;
        isDeptManager: boolean;
    };
}

const taskTypeLabel: Record<MemberTaskItem['taskType'], string> = {
    task: 'タスク',
    feature: '機能追加',
    improvement: '改善',
    bug: 'バグ',
};

const taskTypeChipClass: Record<MemberTaskItem['taskType'], string> = {
    task: 'border-[#B3EAF8] bg-[#E0F7FE] text-[#0C7DA3]',
    feature: 'border-[#BEE3FF] bg-[#E3EEFB] text-[#0A4E8A]',
    improvement: 'border-[#D9D4FF] bg-[#EDE9FE] text-[#5B21B6]',
    bug: 'border-[#FECACA] bg-[#FEE2E2] text-[#991B1B]',
};

const priorityLabel: Record<MemberTaskItem['priority'], string> = {
    high: '高',
    medium: '中',
    low: '低',
};

const taskStatusLabel: Record<MemberTaskItem['status'], string> = {
    open: '未着手',
    in_progress: '進行中',
    resolved: '確認待ち',
    closed: '完了',
};

const taskStatusClass: Record<MemberTaskItem['status'], string> = {
    open: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-50 text-blue-700',
    resolved: 'bg-violet-50 text-violet-800',
    closed: 'bg-green-50 text-green-700',
};

const progressRateTone = (rate: number): { bar: string; text: string } => {
    if (rate > 100) return { bar: 'bg-brand-red', text: 'text-brand-red' };
    if (rate >= 86) return { bar: 'bg-[#F59E0B]', text: 'text-[#92400E]' };
    if (rate >= 61) return { bar: 'bg-brand-blue', text: 'text-brand-blue' };
    return { bar: 'bg-[#16A34A]', text: 'text-[#166534]' };
};

function toTaskListItem(t: MemberTaskItem): TaskListItem {
    return {
        id: t.id,
        title: t.title,
        description: t.description,
        taskType: t.taskType,
        priority: t.priority,
        status: t.status,
        progressRate: t.progressRate,
        assigneeId: t.assigneeId,
        assignee: t.assignee,
        reviewerId: t.reviewerId,
        reviewer: t.reviewer,
        dueDate: t.dueDate,
        updatedAt: t.updatedAt,
        canUpdate: t.canUpdate,
        comments: t.comments,
        histories: t.histories,
    };
}

export default function MemberTasksIndex({
    view,
    departmentId,
    departmentName,
    departments,
    memberCount,
    taskTotalCount,
    needsDepartmentSelection,
    filters,
    sort,
    kpis,
    tasks,
    matrixMembers,
    matrixColumnCounts,
    approvedProjects,
    assigneesForDept,
    rolesMeta,
}: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeTask, setActiveTask] = useState<MemberTaskItem | null>(null);
    const [boardTasks, setBoardTasks] = useState<MemberTaskItem[]>(tasks);
    const [movingTaskId, setMovingTaskId] = useState<number | null>(null);

    const queryParams = useMemo(() => {
        const q: Record<string, string | number> = { view };
        if (departmentId !== null) {
            q.department_id = departmentId;
        }
        if (filters.assignee_id !== null) {
            q.assignee_id = filters.assignee_id;
        }
        if (filters.keyword.trim() !== '') {
            q.keyword = filters.keyword.trim();
        }
        if (filters.project_id !== null) {
            q.project_id = filters.project_id;
        }
        if (filters.priority !== 'all') {
            q.priority = filters.priority;
        }
        if (filters.due !== 'all') {
            q.due = filters.due;
        }
        if (view === 'members') {
            q.sort = sort;
        }

        return q;
    }, [view, departmentId, filters, sort]);

    const navigate = useCallback(
        (patch: Partial<Record<string, string | number | undefined | null>>) => {
            const merged: Record<string, unknown> = { ...queryParams };
            Object.entries(patch).forEach(([k, v]) => {
                if (
                    v === undefined ||
                    v === null ||
                    v === '' ||
                    v === 'all'
                ) {
                    delete merged[k];
                } else {
                    merged[k] = v;
                }
            });
            const next: Record<string, string | number> = {};
            Object.entries(merged).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== '') {
                    next[k] = v as string | number;
                }
            });
            router.get(route('member-tasks.index'), next, { preserveState: true, replace: true });
        },
        [queryParams],
    );

    const subtitleParts = [
        departmentName ?? '部門未選択',
        `メンバー${memberCount}名`,
        `全${taskTotalCount}件`,
    ];
    const memberTasksReturnTo = route('member-tasks.index', queryParams);

    useEffect(() => {
        setBoardTasks(tasks);
    }, [tasks]);

    const openTask = (task: MemberTaskItem) => {
        setActiveTask(task);
        setDialogOpen(true);
    };

    const moveTaskStatus = (task: MemberTaskItem, nextStatus: MemberTaskItem['status']) => {
        if (task.status === nextStatus || movingTaskId !== null) {
            return;
        }

        const prevTasks = boardTasks;
        const optimisticTasks = boardTasks.map((row) =>
            row.id === task.id ? { ...row, status: nextStatus } : row,
        );
        setBoardTasks(optimisticTasks);
        setMovingTaskId(task.id);

        router.put(
            route('member-tasks.status.update', task.id),
            {
                status: nextStatus,
                return_to: memberTasksReturnTo,
            },
            {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setBoardTasks(prevTasks);
                    window.alert('ステータス更新に失敗しました。権限または遷移条件を確認してください。');
                },
                onFinish: () => setMovingTaskId(null),
            },
        );
    };

    const sortButtons: { id: string; label: string }[] = [
        { id: 'overdue_desc', label: '期限超過 多い順' },
        { id: 'assignee_total', label: '担当数 多い順' },
        { id: 'in_progress_desc', label: '進行中 多い順' },
        { id: 'name', label: '名前順' },
    ];

    return (
        <AuthenticatedLayout
            activeKey="tasks"
            contentMaxWidthClass="max-w-[1500px]"
            breadcrumb={[
                { label: '開発管理', icon: GitBranch },
                { label: 'タスク一覧' },
            ]}
        >
            <Head title="タスク一覧" />

            <div>
                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="flex items-center text-2xl font-bold tracking-tight text-brand-dark">
                            <span
                                className="mr-2.5 inline-block h-6 w-1 rounded-sm bg-brand-accent"
                                aria-hidden
                            />
                            タスク一覧
                        </h1>
                        <p className="mt-1 text-sm text-brand-muted">{subtitleParts.join(' · ')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <ViewToggle
                            value={view}
                            onChange={(next) => navigate({ view: next })}
                        />
                        <p className="text-xs text-brand-muted">完了は直近30日分のみ表示</p>
                    </div>
                </div>

                <div className="mb-5 space-y-2 rounded-lg border border-brand-border bg-white p-4">
                    <div className="relative w-full min-w-[12rem] max-w-md">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
                        <Input
                            type="search"
                            value={filters.keyword}
                            onChange={(e) => navigate({ keyword: e.target.value })}
                            placeholder="キーワード（タイトル・説明・担当など）"
                            className="h-8 border-brand-border bg-white py-1 pl-8 pr-2 text-xs placeholder:text-[11px]"
                            aria-label="タスクキーワード検索"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                    {rolesMeta.isHqManager && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-brand-muted">部門</span>
                            <select
                                value={departmentId ?? ''}
                                onChange={(e) =>
                                    navigate({
                                        department_id:
                                            e.target.value === '' ? null : Number(e.target.value),
                                    })
                                }
                                className="h-8 rounded-md border border-brand-border px-2 py-0 pr-7 text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                            >
                                <option value="">選択してください</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {!rolesMeta.isHqManager && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-brand-muted">部門</span>
                            <select
                                disabled
                                value={departmentId ?? ''}
                                className="h-8 cursor-not-allowed rounded-md border border-brand-border bg-gray-50 px-2 py-0 pr-7 text-xs text-brand-muted"
                            >
                                <option>{departmentName ?? '—'}</option>
                            </select>
                        </div>
                    )}
                    <select
                        value={filters.assignee_id ?? ''}
                        onChange={(e) =>
                            navigate({
                                assignee_id:
                                    e.target.value === '' ? undefined : Number(e.target.value),
                            })
                        }
                        className="h-8 min-w-[8.5rem] rounded-md border border-brand-border px-2 py-0 pr-7 text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    >
                        <option value="">担当者：すべて</option>
                        {assigneesForDept.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.project_id ?? ''}
                        onChange={(e) =>
                            navigate({
                                project_id:
                                    e.target.value === '' ? undefined : Number(e.target.value),
                            })
                        }
                        className="h-8 min-w-[8.5rem] rounded-md border border-brand-border px-2 py-0 pr-7 text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    >
                        <option value="">案件：すべて</option>
                        {approvedProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                                PRJ-{String(p.id).padStart(4, '0')} {p.title.slice(0, 40)}
                                {p.title.length > 40 ? '…' : ''}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.priority}
                        onChange={(e) => navigate({ priority: e.target.value })}
                        className="h-8 min-w-[7.25rem] rounded-md border border-brand-border px-2 py-0 pr-7 text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    >
                        <option value="all">優先度：すべて</option>
                        <option value="high">高</option>
                        <option value="medium">中</option>
                        <option value="low">低</option>
                    </select>
                    <select
                        value={filters.due}
                        onChange={(e) => navigate({ due: e.target.value })}
                        className="h-8 min-w-[9rem] rounded-md border border-brand-border px-2 py-0 pr-7 text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    >
                        <option value="all">期日：すべて</option>
                        <option value="overdue">期限超過</option>
                        <option value="soon">3日以内（早期警告）</option>
                        <option value="week">今週中</option>
                        <option value="month">今月中</option>
                        <option value="unset">期日未設定</option>
                    </select>
                    <button
                        type="button"
                        onClick={() =>
                            navigate({
                                keyword: '',
                                assignee_id: null,
                                project_id: null,
                                priority: 'all',
                                due: 'all',
                            })
                        }
                        className="ml-auto h-8 shrink-0 rounded-md border border-brand-red/35 px-2.5 text-xs text-brand-red transition hover:bg-brand-red/5"
                    >
                        クリア
                    </button>
                    </div>
                </div>

                {needsDepartmentSelection && (
                    <div className="rounded-lg border border-dashed border-amber-400 bg-amber-50 px-6 py-12 text-center text-sm text-amber-900">
                        表示する部門を選択してください。
                    </div>
                )}

                {!needsDepartmentSelection && (
                    <>
                        {view === 'board' && (
                            <>
                                <p className="mb-2 flex flex-wrap items-center gap-2 text-xs text-brand-muted">
                                    <span className="rounded bg-brand-dark px-2 py-0.5 text-[10px] font-semibold text-white">
                                        表示中
                                    </span>
                                    カンバンビュー — ステータス別にタスクを俯瞰できます。
                                </p>
                                <KanbanBoard
                                    tasks={boardTasks}
                                    onOpenTask={openTask}
                                    onDropStatus={moveTaskStatus}
                                />
                            </>
                        )}

                        {view === 'list' && (
                            <>
                                <p className="mb-2 flex flex-wrap items-center gap-2 text-xs text-brand-muted">
                                    <span className="rounded bg-brand-dark px-2 py-0.5 text-[10px] font-semibold text-white">
                                        表示中
                                    </span>
                                    一覧ビュー — 案件詳細の開発管理に準じた表形式で確認できます。
                                </p>
                                <div className="overflow-x-auto rounded-lg border border-brand-border bg-white">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-brand-bg text-xs uppercase tracking-wider text-brand-muted">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left">タイトル</th>
                                                <th className="px-3 py-2.5 text-left">種類</th>
                                                <th className="px-3 py-2.5 text-left">優先度</th>
                                                <th className="px-3 py-2.5 text-left">ステータス</th>
                                                <th className="px-3 py-2.5 text-left">担当</th>
                                                <th className="px-3 py-2.5 text-left">確認者</th>
                                                <th className="px-3 py-2.5 text-left">期日</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-brand-border">
                                            {tasks.map((task) => {
                                                const rawProgress = Number(task.progressRate) || 0;
                                                const barWidthPct = Math.min(rawProgress, 100);
                                                const tone = progressRateTone(rawProgress);
                                                return (
                                                    <tr
                                                        key={task.id}
                                                        className="cursor-pointer hover:bg-slate-50"
                                                        onClick={() => openTask(task)}
                                                    >
                                                        <td className="px-4 py-3.5 font-medium text-brand-dark">
                                                            {task.title}
                                                            <div className="mt-0.5 text-[10px] text-brand-muted">
                                                                PRJ-{String(task.projectId).padStart(4, '0')} /{' '}
                                                                {task.projectTitle}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3.5">
                                                            <span
                                                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${taskTypeChipClass[task.taskType]}`}
                                                            >
                                                                {taskTypeLabel[task.taskType]}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3.5">
                                                            <span className="rounded-full bg-[#FEF9C3] px-2 py-0.5 text-[10px] font-semibold text-[#854D0E]">
                                                                {priorityLabel[task.priority]}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3.5">
                                                            <div className="flex min-w-[6.5rem] flex-col gap-1.5">
                                                                <span
                                                                    className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${taskStatusClass[task.status]}`}
                                                                >
                                                                    {taskStatusLabel[task.status]}
                                                                </span>
                                                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#E9ECEF]">
                                                                    <div
                                                                        className={`h-full rounded-full ${tone.bar}`}
                                                                        style={{ width: `${barWidthPct}%` }}
                                                                    />
                                                                </div>
                                                                <div
                                                                    className={`text-right font-mono text-[10px] font-semibold tabular-nums ${tone.text}`}
                                                                >
                                                                    {Math.round(rawProgress)}%
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3.5 text-brand-muted">
                                                            {task.assignee ?? '未割当'}
                                                        </td>
                                                        <td className="px-3 py-3.5 text-brand-muted">
                                                            {task.reviewer ?? '—'}
                                                        </td>
                                                        <td className="px-3 py-3.5 text-brand-muted">
                                                            {task.dueDate ?? '—'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {view === 'members' && kpis && matrixColumnCounts && (
                            <>
                                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                    <KpiCard label="部門合計" value={kpis.total} suffix="件" />
                                    <KpiCard
                                        label="期限超過"
                                        value={kpis.overdue}
                                        suffix="件"
                                        valueClass="text-brand-red"
                                        dotClass="bg-brand-red"
                                    />
                                    <KpiCard
                                        label="3日以内"
                                        value={kpis.soon}
                                        suffix="件"
                                        valueClass="text-[#92400E]"
                                        dotClass="bg-[#F59E0B]"
                                    />
                                    <KpiCard
                                        label="完了率"
                                        value={`${kpis.completionRate}%`}
                                        suffix={`${kpis.closedCount}/${kpis.total}`}
                                        valueClass="text-[#16A34A]"
                                        dotClass="bg-[#16A34A]"
                                    />
                                </div>

                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className="mr-1 text-xs text-brand-muted">並び替え：</span>
                                    {sortButtons.map((b) => (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => navigate({ sort: b.id })}
                                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                                                sort === b.id
                                                    ? 'border-brand-dark bg-brand-dark text-white'
                                                    : 'border-brand-border bg-white text-brand-muted hover:border-brand-blue hover:text-brand-blue'
                                            }`}
                                        >
                                            {b.id === 'overdue_desc' && (
                                                <AlertCircle className="h-3 w-3" />
                                            )}
                                            {b.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="overflow-x-auto pb-2">
                                    <div className="min-w-[920px]">
                                        <MemberMatrix
                                            tasks={boardTasks}
                                            members={matrixMembers}
                                            columnCounts={matrixColumnCounts}
                                            onOpenTask={openTask}
                                            onDropStatus={moveTaskStatus}
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-brand-muted">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded border border-brand-red shadow-[0_0_0_1px_rgba(230,0,19,.15)]" />
                        期限超過
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded border border-[#F59E0B] shadow-[0_0_0_1px_rgba(245,158,11,.15)]" />
                        3日以内
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-2.5 w-2.5 rounded border border-[#7C3AED] shadow-[0_0_0_1px_rgba(124,58,237,.10)]" />
                        確認待ち
                    </span>
                    <span>
                        順調 = 超過・警告・確認待ちが0件のときにメンバー別で表示されます。
                    </span>
                    <span>負荷バーは担当タスク数（未完了）÷ 8件固定。</span>
                    <span className="ml-auto">カードクリックでタスク詳細モーダルを開きます。</span>
                </div>
            </div>

            {activeTask && (
                <ProjectTaskDialog
                    open={dialogOpen}
                    onClose={() => {
                        setDialogOpen(false);
                        setActiveTask(null);
                    }}
                    projectId={activeTask.projectId}
                    projectTitle={activeTask.projectTitle}
                    task={toTaskListItem(activeTask)}
                    assignees={assigneesForDept}
                    readOnly={!activeTask.canUpdate}
                    returnTo={memberTasksReturnTo}
                />
            )}
        </AuthenticatedLayout>
    );
}

function KpiCard({
    label,
    value,
    suffix,
    valueClass,
    dotClass,
}: {
    label: string;
    value: string | number;
    suffix: string;
    valueClass?: string;
    dotClass?: string;
}) {
    return (
        <div className="rounded-lg border border-brand-border bg-white p-4">
            <div className="mb-1 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-brand-muted">
                {dotClass && <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />}
                {label}
            </div>
            <div className="flex items-baseline gap-2">
                <span className={`font-mono text-xl font-bold ${valueClass ?? 'text-brand-dark'}`}>
                    {value}
                </span>
                <span className="text-xs text-brand-muted">{suffix}</span>
            </div>
        </div>
    );
}
