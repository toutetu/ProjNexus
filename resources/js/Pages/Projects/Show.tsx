import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit3,
    FileCheck2,
    FileText,
    FolderSearch,
    GitBranch,
    History,
    ListChecks,
    Plus,
    Send,
    Wallet,
    XCircle,
} from 'lucide-react';

import ApprovalStepperFull, {
    type ApprovalTimelineItem,
} from '@/Components/Approval/ApprovalStepperFull';
import ApprovalDialog from '@/Components/Modals/ApprovalDialog';
import BudgetActualDialog from '@/Components/Modals/BudgetActualDialog';
import ProjectTaskDialog, { type TaskListItem } from '@/Components/Modals/ProjectTaskDialog';
import InputLabel from '@/Components/InputLabel';
import StatusPill, { type ProjectStatus } from '@/Components/StatusPill';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ProjectShowData {
    id: number;
    title: string;
    status: ProjectStatus;
    department: string | null;
    applicant: string | null;
    primaryAssignee: string | null;
    purpose: string | null;
    description: string | null;
    estimatedAmount: number | null;
    estimatedDays: number | null;
    budgetAmount: number | null;
    actualAmount: number | null;
    submittedAt: string | null;
    revision: number;
    parentProjectId: number | null;
    rejectedAt?: 'dept' | 'hq' | null;
    rejectedComment?: string | null;
    applicantSubmitsToHqDirect?: boolean;
    approvals: ApprovalTimelineItem[];
    tasks: TaskListItem[];
}

interface Props {
    projectId: number;
    project: ProjectShowData;
    canEdit: boolean;
    canApproveDept: boolean;
    canApproveHq: boolean;
    canTakeBack: boolean;
    canManageTasks: boolean;
    canUpdateBudget: boolean;
    taskAssignees: Array<{ id: number; name: string }>;
}

type DetailTab = 'apply' | 'history' | 'tasks' | 'budget';

type HistoryEvent = {
    id: string;
    occurredAt: string | null;
    actor: string;
    title: string;
    detail?: string;
    fromValue?: string | null;
    toValue?: string | null;
    kind: 'approval' | 'change';
    eventType: 'submitted' | 'approved' | 'rejected' | 'change';
    statusChip?: ProjectStatus;
};

const formatCurrency = (value: number | null) => {
    if (value === null) return '—';
    return `¥${Math.trunc(value).toLocaleString('ja-JP')}`;
};

const formatAmountForDisplay = (value: number | null): string =>
    value === null ? '' : Math.trunc(value).toLocaleString('ja-JP');

const consumptionRate = (actual: number | null, budget: number | null): number =>
    budget && budget > 0 ? Math.round(((actual ?? 0) / budget) * 1000) / 10 : 0;

const taskStatusLabel: Record<TaskListItem['status'], string> = {
    open: '未着手',
    in_progress: '進行中',
    closed: '完了',
};

const taskStatusClass: Record<TaskListItem['status'], string> = {
    open: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-50 text-blue-700',
    closed: 'bg-green-50 text-green-700',
};

const taskTypeLabel: Record<TaskListItem['taskType'], string> = {
    task: 'タスク',
    feature: '機能追加',
    improvement: '改善',
    bug: 'バグ',
};

const priorityLabel: Record<TaskListItem['priority'], string> = {
    high: '高',
    medium: '中',
    low: '低',
};

const approvalActionLabel: Record<ApprovalTimelineItem['action'], string> = {
    approved: '承認',
    rejected: '却下',
};

const parseDetailTab = (raw: string | null): DetailTab => {
    if (raw === 'apply' || raw === 'history' || raw === 'tasks' || raw === 'budget') return raw;
    if (raw === 'overview') return 'apply';
    return 'apply';
};

const formatDateTime = (value: string | null): string => {
    if (!value) return '日時不明';
    const dt = new Date(value.replace(' ', 'T'));
    if (Number.isNaN(dt.getTime())) return value;
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mi = String(dt.getMinutes()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
};

const historyFieldLabel = (fieldName: string): string => {
    const map: Record<string, string> = {
        title: 'タイトル',
        task_type: '種類',
        priority: '優先度',
        status: 'ステータス',
        progress_rate: '進捗率',
        assignee_id: '担当者',
        due_date: '期日',
        description: '説明',
    };
    return map[fieldName] ?? fieldName;
};

const historyValueLabel = (fieldName: string, value: string | null): string => {
    if (value === null || value === '') return '—';

    if (fieldName === 'status') {
        const map: Record<string, string> = {
            open: '未着手',
            in_progress: '進行中',
            closed: '完了',
        };
        return map[value] ?? value;
    }

    if (fieldName === 'task_type') {
        const map: Record<string, string> = {
            task: 'タスク',
            feature: '機能追加',
            improvement: '改善',
            bug: 'バグ',
        };
        return map[value] ?? value;
    }

    if (fieldName === 'priority') {
        const map: Record<string, string> = {
            high: '高',
            medium: '中',
            low: '低',
        };
        return map[value] ?? value;
    }

    if (fieldName === 'progress_rate') {
        return `${value}%`;
    }

    return value;
};

export default function ProjectsShow({
    projectId,
    project,
    canEdit,
    canApproveDept,
    canApproveHq,
    canTakeBack,
    canManageTasks,
    canUpdateBudget,
    taskAssignees,
}: Props) {
    const skipsDeptStep =
        !!project.applicantSubmitsToHqDirect &&
        (project.status === 'pending_hq' ||
            project.status === 'approved' ||
            (project.status === 'rejected' && project.rejectedAt === 'hq'));
    const [approvalDialog, setApprovalDialog] = useState<{
        open: boolean;
        mode: 'approve' | 'reject';
    }>({
        open: false,
        mode: 'approve',
    });
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
    const approvalLevel: 'dept' | 'hq' = canApproveDept ? 'dept' : 'hq';
    const taskCount = project.tasks.length;
    const closedTaskCount = project.tasks.filter((task) => task.status === 'closed').length;
    const projectProgress = taskCount === 0 ? 0 : Math.round((closedTaskCount / taskCount) * 100);
    const budgetRate = consumptionRate(project.actualAmount, project.budgetAmount);
    const editingTask =
        editingTaskId === null ? null : project.tasks.find((task) => task.id === editingTaskId) ?? null;
    const initialTab =
        typeof window === 'undefined'
            ? 'apply'
            : parseDetailTab(new URLSearchParams(window.location.search).get('detailTab'));
    const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);
    const activeSidebarKey = activeTab === 'tasks' ? 'projects-dev' : 'projects-approval';
    const sectionLabel =
        activeTab === 'tasks' ? '開発管理' : activeTab === 'budget' ? '予算管理' : '申請・承認';
    const sectionIcon = activeTab === 'tasks' ? GitBranch : activeTab === 'budget' ? Wallet : FileCheck2;
    const sectionListHref =
        activeTab === 'tasks'
            ? '/projects?tab=dev'
            : activeTab === 'budget'
              ? '/projects?tab=budget'
              : '/projects?tab=approval';
    const isRejectedProject =
        project.status === 'rejected' || !!project.rejectedAt || !!project.rejectedComment;
    const pageTitle = project.status === 'approved' ? '案件詳細' : '承認画面';
    const pageDescription =
        project.status === 'approved'
            ? '案件の詳細・履歴・タスク・予算を確認できます'
            : '申請内容を確認し、承認または却下を行います';
    const historyEvents = useMemo<HistoryEvent[]>(() => {
        const submittedEvent: HistoryEvent = {
            id: 'project-submitted',
            occurredAt: project.submittedAt,
            actor: project.applicant ?? '申請者',
            title: '申請',
            kind: 'approval',
            eventType: 'submitted',
            statusChip: 'pending_dept',
        };

        const approvalEvents: HistoryEvent[] = project.approvals.map((approval, index) => ({
            id: `approval-${index}-${approval.level}`,
            occurredAt: approval.actedAt,
            actor: approval.approver ?? '承認者',
            title: `${approvalActionLabel[approval.action]}（${approval.level === 'dept' ? '部門' : '本部'}）`,
            kind: 'approval',
            eventType: approval.action === 'approved' ? 'approved' : 'rejected',
            statusChip: approval.action === 'approved' ? 'approved' : 'rejected',
        }));

        const changeEvents: HistoryEvent[] = project.tasks.flatMap((task) =>
            (task.histories ?? []).map((history) => ({
                id: `task-history-${task.id}-${history.id}`,
                occurredAt: history.createdAt,
                actor: history.user,
                title: `タスク「${task.title}」の${historyFieldLabel(history.fieldName)}を更新`,
                fromValue: historyValueLabel(history.fieldName, history.oldValue),
                toValue: historyValueLabel(history.fieldName, history.newValue),
                kind: 'change',
                eventType: 'change',
            })),
        );

        return [submittedEvent, ...approvalEvents, ...changeEvents].sort((a, b) => {
            const aTime = a.occurredAt ? new Date(a.occurredAt).getTime() : 0;
            const bTime = b.occurredAt ? new Date(b.occurredAt).getTime() : 0;
            return bTime - aTime;
        });
    }, [project.submittedAt, project.applicant, project.approvals, project.tasks]);

    const switchTab = (nextTab: DetailTab) => {
        setActiveTab(nextTab);
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        url.searchParams.set('detailTab', nextTab);
        window.history.replaceState({}, '', url.toString());
    };

    useEffect(() => {
        if (!isRejectedProject) return;
        if (activeTab !== 'tasks' && activeTab !== 'budget') return;
        setActiveTab('apply');
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        url.searchParams.set('detailTab', 'apply');
        window.history.replaceState({}, '', url.toString());
    }, [activeTab, isRejectedProject]);

    return (
        <AuthenticatedLayout
            activeKey={activeSidebarKey}
            breadcrumb={[
                { label: sectionLabel, icon: sectionIcon },
                { label: '案件一覧', href: sectionListHref, icon: FolderSearch },
                { label: pageTitle },
            ]}
        >
            <Head title={pageTitle} />

            <div className="space-y-6">
                <section className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">{pageTitle}</h1>
                        <p className="mt-1 text-sm text-brand-muted">
                            {pageDescription}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {canTakeBack && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    router.post(route('projects.takeBack', project.id), {}, {
                                        preserveScroll: true,
                                    });
                                }}
                            >
                                取り戻して下書きに戻す
                            </Button>
                        )}
                        {canEdit && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={route('projects.edit', project.id)}>編集</Link>
                            </Button>
                        )}
                    </div>
                </section>

                <section className="rounded-lg border border-brand-border bg-white shadow-sm">
                    <div className="border-b border-brand-border px-2">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                className={`relative px-4 py-3 text-sm font-medium transition ${activeTab === 'apply' ? 'text-brand-red' : 'text-brand-muted hover:text-brand-dark'}`}
                                onClick={() => switchTab('apply')}
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <FileText className="h-4 w-4" />
                                    申請
                                </span>
                                {activeTab === 'apply' && (
                                    <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t bg-brand-red" />
                                )}
                            </button>
                            <button
                                type="button"
                                className={`relative px-4 py-3 text-sm font-medium transition ${activeTab === 'history' ? 'text-brand-red' : 'text-brand-muted hover:text-brand-dark'}`}
                                onClick={() => switchTab('history')}
                            >
                                <span className="inline-flex items-center gap-1.5">
                                    <History className="h-4 w-4" />
                                    履歴
                                </span>
                                {activeTab === 'history' && (
                                    <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t bg-brand-red" />
                                )}
                            </button>
                            {!isRejectedProject && (
                                <button
                                    type="button"
                                    className={`relative px-4 py-3 text-sm font-medium transition ${activeTab === 'tasks' ? 'text-brand-red' : 'text-brand-muted hover:text-brand-dark'}`}
                                    onClick={() => switchTab('tasks')}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        <ListChecks className="h-4 w-4" />
                                        タスク
                                        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                                            {taskCount}
                                        </span>
                                    </span>
                                    {activeTab === 'tasks' && (
                                        <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t bg-brand-red" />
                                    )}
                                </button>
                            )}
                            {!isRejectedProject && (
                                <button
                                    type="button"
                                    className={`relative px-4 py-3 text-sm font-medium transition ${activeTab === 'budget' ? 'text-brand-red' : 'text-brand-muted hover:text-brand-dark'}`}
                                    onClick={() => switchTab('budget')}
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        <Wallet className="h-4 w-4" />
                                        予算
                                    </span>
                                    {activeTab === 'budget' && (
                                        <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-t bg-brand-red" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                    {activeTab === 'apply' && (
                        <>
                    <div className="border-b border-brand-border px-6 py-5">
                        <h2 className="flex items-center gap-2 text-base font-semibold">
                            <FileCheck2 className="h-4 w-4 text-brand-blue" />
                            申請情報
                        </h2>
                        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
                            <span>
                                案件ID: {projectId}
                                {project.revision > 1 && (
                                    <span className="text-brand-dark"> / 改訂{project.revision}回目</span>
                                )}
                            </span>
                            <span className="text-brand-muted">·</span>
                            <StatusPill status={project.status} />
                            {project.applicantSubmitsToHqDirect &&
                                (project.status === 'pending_hq' ||
                                    project.status === 'approved' ||
                                    (project.status === 'rejected' && project.rejectedAt === 'hq')) && (
                                    <span className="rounded-full bg-[#E0F2FE] px-2 py-0.5 text-[10px] font-semibold text-[#0369A1]">
                                        本部直行
                                    </span>
                                )}
                        </p>
                        {project.parentProjectId != null && (
                            <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-muted">
                                <GitBranch className="h-4 w-4 shrink-0" />
                                再申請チェイン:
                                <Link
                                    href={route('projects.show', project.parentProjectId)}
                                    className="font-medium text-brand-blue hover:underline"
                                >
                                    元案件 #{project.parentProjectId}
                                </Link>
                            </p>
                        )}
                    </div>

                    <div className="space-y-6 p-6">
                        <ApprovalStepperFull
                            status={project.status}
                            approvals={project.approvals}
                            submittedAt={project.submittedAt}
                            applicantName={project.applicant}
                            rejectedAt={project.rejectedAt}
                            skipsDeptStep={skipsDeptStep}
                        />
                        {project.status === 'rejected' && project.rejectedComment && (
                                <div className="rounded-md border border-brand-red/20 bg-[#FEE2E2] px-4 py-3 text-sm text-[#991B1B]">
                                    <p className="font-semibold">却下コメント</p>
                                    <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                                        {project.rejectedComment}
                                    </p>
                                </div>
                        )}

                        <div>
                            <InputLabel htmlFor="title" value="案件名" />
                            <Input id="title" value={project.title} readOnly className="mt-1.5 bg-brand-bg" />
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="department" value="担当部門" />
                                <Input
                                    id="department"
                                    value={project.department ?? '—'}
                                    readOnly
                                    className="mt-1.5 bg-brand-bg"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="submittedAt" value="申請日" />
                                <Input
                                    id="submittedAt"
                                    value={project.submittedAt ?? '—'}
                                    readOnly
                                    className="mt-1.5 bg-brand-bg"
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="purpose" value="目的" />
                            <textarea
                                id="purpose"
                                value={project.purpose ?? ''}
                                readOnly
                                rows={4}
                                className="mt-1.5 w-full rounded-md border border-brand-border bg-brand-bg px-3 py-2 text-sm focus:outline-none"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="概要・説明" />
                            <textarea
                                id="description"
                                value={project.description ?? ''}
                                readOnly
                                rows={7}
                                className="mt-1.5 w-full rounded-md border border-brand-border bg-brand-bg px-3 py-2 text-sm focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="estimatedAmount" value="概算予算（円）" />
                                <Input
                                    id="estimatedAmount"
                                    value={formatAmountForDisplay(project.estimatedAmount)}
                                    readOnly
                                    className="mt-1.5 bg-brand-bg text-right font-mono"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="estimatedDays" value="概算工数（人日）" />
                                <Input
                                    id="estimatedDays"
                                    value={
                                        project.estimatedDays !== null
                                            ? String(project.estimatedDays)
                                            : ''
                                    }
                                    readOnly
                                    className="mt-1.5 bg-brand-bg text-right font-mono"
                                />
                            </div>
                        </div>

                    </div>
                        </>
                    )}
                    {activeTab === 'history' && (
                        <div className="space-y-4 p-6">
                            <h2 className="text-base font-semibold text-brand-dark">履歴（承認・変更の時系列）</h2>
                            {historyEvents.length === 0 ? (
                                <div className="rounded-md border border-brand-border bg-brand-bg px-4 py-6 text-sm text-brand-muted">
                                    表示できる履歴がありません。
                                </div>
                            ) : (
                                <div className="rounded-lg border border-brand-border bg-white px-5 py-4">
                                    {historyEvents.map((event, index) => (
                                        <div key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
                                            {index !== historyEvents.length - 1 && (
                                                <span className="absolute left-[14px] top-9 h-[calc(100%-12px)] w-px bg-brand-border" />
                                            )}
                                            <span
                                                className={`z-[1] mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full ${
                                                    event.eventType === 'submitted'
                                                        ? 'bg-[#E0F2FE] text-[#0C7DA3]'
                                                        : event.eventType === 'approved'
                                                          ? 'bg-green-100 text-green-700'
                                                          : event.eventType === 'rejected'
                                                            ? 'bg-red-100 text-red-700'
                                                            : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {event.eventType === 'submitted' && <Send className="h-3.5 w-3.5" />}
                                                {event.eventType === 'approved' && <CheckCircle2 className="h-3.5 w-3.5" />}
                                                {event.eventType === 'rejected' && <XCircle className="h-3.5 w-3.5" />}
                                                {event.eventType === 'change' && <Edit3 className="h-3.5 w-3.5" />}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-brand-dark">
                                                    {event.actor}さんが{event.title}しました
                                                </p>
                                                <p className="mt-0.5 text-xs text-brand-muted">{formatDateTime(event.occurredAt)}</p>
                                                {event.statusChip && (
                                                    <div className="mt-1.5">
                                                        <StatusPill status={event.statusChip} size="sm" />
                                                    </div>
                                                )}
                                                {event.detail && (
                                                    <p className="mt-2 rounded-md border border-brand-border bg-brand-bg px-3 py-2 text-sm text-brand-dark">
                                                        {event.detail}
                                                    </p>
                                                )}
                                                {(event.fromValue !== undefined || event.toValue !== undefined) && (
                                                    <p className="mt-2 text-xs text-brand-muted">
                                                        <span className="line-through">{event.fromValue ?? '—'}</span>
                                                        <span className="mx-1">→</span>
                                                        <span className="font-semibold text-brand-dark">{event.toValue ?? '—'}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    {!isRejectedProject && activeTab === 'tasks' && (
                        <section className="rounded-lg bg-white">
                            <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
                                <div>
                                    <h2 className="flex items-center gap-2 text-base font-semibold text-brand-dark">
                                        <ListChecks className="h-4 w-4 text-brand-blue" />
                                        タスク一覧
                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                            {taskCount}件
                                        </span>
                                    </h2>
                                    <p className="mt-1 text-xs text-brand-muted">
                                        承認済案件のみタスク作成・進捗入力ができます。
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="gap-1.5"
                                    disabled={!canManageTasks}
                                    onClick={() => {
                                        setEditingTaskId(null);
                                        setTaskDialogOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                    タスク追加
                                </Button>
                            </div>

                            {project.tasks.length === 0 ? (
                                <div className="px-6 py-10 text-center text-sm text-brand-muted">
                                    まだタスクはありません。承認後にタスクを追加できます。
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-brand-bg text-xs uppercase tracking-wider text-brand-muted">
                                            <tr>
                                                <th className="px-5 py-3 text-left font-semibold">タイトル</th>
                                                <th className="px-3 py-3 text-left font-semibold">種類</th>
                                                <th className="px-3 py-3 text-left font-semibold">優先度</th>
                                                <th className="px-3 py-3 text-left font-semibold">ステータス</th>
                                                <th className="px-3 py-3 text-left font-semibold">担当</th>
                                                <th className="px-3 py-3 text-left font-semibold">期日</th>
                                                <th className="px-3 py-3 text-left font-semibold">進捗</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-brand-border">
                                            {project.tasks.map((task) => (
                                                <tr
                                                    key={task.id}
                                                    className="cursor-pointer hover:bg-slate-50"
                                                    onClick={() => {
                                                        if (!canManageTasks) return;
                                                        setEditingTaskId(task.id);
                                                        setTaskDialogOpen(true);
                                                    }}
                                                >
                                                    <td className="px-5 py-3.5 font-medium text-brand-dark">
                                                        {task.title}
                                                        <div className="mt-0.5 font-mono text-[10px] font-normal text-brand-muted">
                                                            TASK-{String(project.id).padStart(4, '0')}-
                                                            {String(task.id).padStart(3, '0')}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3.5">
                                                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                                                            {taskTypeLabel[task.taskType]}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3.5">
                                                        <span className="rounded-full bg-[#FEF9C3] px-2 py-0.5 text-[10px] font-semibold text-[#854D0E]">
                                                            {priorityLabel[task.priority]}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3.5">
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${taskStatusClass[task.status]}`}
                                                        >
                                                            {taskStatusLabel[task.status]}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3.5 text-brand-muted">
                                                        {task.assignee ?? '未割当'}
                                                    </td>
                                                    <td className="px-3 py-3.5 text-brand-muted">
                                                        {task.dueDate ?? '—'}
                                                    </td>
                                                    <td className="px-3 py-3.5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-[#E9ECEF]">
                                                                <div
                                                                    className={
                                                                        task.progressRate >= 100
                                                                            ? 'h-full bg-[#16A34A]'
                                                                            : 'h-full bg-brand-blue'
                                                                    }
                                                                    style={{ width: `${task.progressRate}%` }}
                                                                />
                                                            </div>
                                                            <span className="w-10 text-right font-mono text-[10px] font-semibold">
                                                                {task.progressRate}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            <div className="border-t border-brand-border px-6 py-4">
                                <div className="rounded-lg border border-brand-border bg-white p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                                        進捗
                                    </p>
                                    <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-muted">
                                        <ListChecks className="h-4 w-4 text-brand-muted" />
                                        案件進捗: {projectProgress}%（{closedTaskCount}/{taskCount}件完了）
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}
                    {!isRejectedProject && activeTab === 'budget' && (
                        <div className="space-y-4 p-6">
                            <h2 className="text-base font-semibold text-brand-dark">予算</h2>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="rounded-lg border border-brand-border bg-white p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                                        予算情報
                                    </p>
                                    <ul className="mt-2 space-y-1 text-sm text-brand-dark">
                                        <li>見積: {formatCurrency(project.estimatedAmount)}</li>
                                        <li>予算: {formatCurrency(project.budgetAmount)}</li>
                                        <li>実績: {formatCurrency(project.actualAmount)}</li>
                                    </ul>
                                    <div className="mt-3">
                                        <div className="mb-1 flex items-center justify-between text-xs">
                                            <span className="text-brand-muted">消費率</span>
                                            <span className="font-mono font-semibold">{budgetRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-[#E9ECEF]">
                                            <div
                                                className={
                                                    budgetRate > 100
                                                        ? 'h-full bg-brand-red'
                                                        : budgetRate >= 86
                                                          ? 'h-full bg-[#F59E0B]'
                                                          : budgetRate >= 61
                                                            ? 'h-full bg-brand-blue'
                                                            : 'h-full bg-[#16A34A]'
                                                }
                                                style={{ width: `${Math.min(budgetRate, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant={canUpdateBudget ? 'default' : 'secondary'}
                                        size="sm"
                                        className="mt-3 w-full gap-1.5"
                                        disabled={!canUpdateBudget}
                                        onClick={() => setBudgetDialogOpen(true)}
                                    >
                                        <Wallet className="h-4 w-4" />
                                        実績を入力
                                    </Button>
                                </div>
                                <div className="rounded-lg border border-brand-border bg-white p-4 md:col-span-2">
                                    <p className="text-sm text-brand-muted">
                                        予算タブでは、S-03cの方針に合わせて予算額・実績額・消費率を確認します。
                                        実績入力は承認済み案件で、主担当または部門長が操作できます。
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {(canApproveDept || canApproveHq) && (
                    <section className="rounded-lg border border-brand-border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex items-center gap-1.5"
                                onClick={() => setApprovalDialog({ open: true, mode: 'reject' })}
                            >
                                <XCircle className="h-4 w-4" />
                                却下
                            </Button>
                            <Button
                                type="button"
                                className="flex items-center gap-1.5"
                                onClick={() => setApprovalDialog({ open: true, mode: 'approve' })}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                承認
                            </Button>
                        </div>
                    </section>
                )}
            </div>

            <ApprovalDialog
                mode={approvalDialog.mode}
                open={approvalDialog.open}
                onClose={() => setApprovalDialog((prev) => ({ ...prev, open: false }))}
                approvalLevel={approvalLevel}
                project={{
                    id: project.id,
                    title: project.title,
                    department: project.department ?? '—',
                }}
                onSubmit={(comment) => {
                    const routeName =
                        approvalDialog.mode === 'approve' ? 'projects.approve' : 'projects.reject';
                    router.post(
                        route(routeName, project.id),
                        { level: approvalLevel, comment },
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                setApprovalDialog((prev) => ({ ...prev, open: false })),
                        },
                    );
                }}
            />
            <ProjectTaskDialog
                open={taskDialogOpen}
                onClose={() => {
                    setTaskDialogOpen(false);
                    setEditingTaskId(null);
                }}
                projectId={project.id}
                projectTitle={project.title}
                task={editingTask}
                assignees={taskAssignees}
            />
            <BudgetActualDialog
                open={budgetDialogOpen}
                onClose={() => setBudgetDialogOpen(false)}
                project={{
                    id: project.id,
                    title: project.title,
                    primaryAssignee: project.primaryAssignee,
                    budgetAmount: project.budgetAmount,
                    actualAmount: project.actualAmount,
                }}
            />
        </AuthenticatedLayout>
    );
}
