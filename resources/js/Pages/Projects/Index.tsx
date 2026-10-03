import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronsUpDown,
    ChevronUp,
    FileCheck2,
    FileText,
    FolderSearch,
    GitBranch,
    Inbox,
    Plus,
    Search,
    Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import ApprovalStepperMini from '@/Components/Approval/ApprovalStepperMini';
import EmptyState from '@/Components/EmptyState';
import StatusPill, { type ProjectStatus } from '@/Components/StatusPill';
import Tabs, { type TabItem } from '@/Components/Tabs';
import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { ActiveKey } from '@/Components/Layout/Sidebar';
import { PROJECT_LIST_PAGE_TITLE } from '@/lib/projectListLabels';
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';

type ProjectTab = 'approval' | 'dev' | 'budget';

interface Props {
    tab: ProjectTab;
    filter?: string | null;
    status?: string | null;
    department?: number | null;
    assignee?: number | null;
    progress?: string | null;
    consumption?: string | null;
    q?: string | null;
    departments?: Array<{ id: number; name: string }>;
    assignees?: Array<{ id: number; name: string }>;
    budgetSummary?: BudgetSummary | null;
    tabCounts?: Record<ProjectTab, number>;
    projects?: {
        data: ProjectListItem[];
        current_page: number;
        last_page: number;
        from: number | null;
        to: number | null;
        total: number;
    };
}

interface ProjectListItem {
    id: number;
    title: string;
    department: string | null;
    status: ProjectStatus;
    applicant?: string | null;
    primaryAssignee?: string | null;
    submittedAt: string | null;
    approvedAt?: string | null;
    updatedAt: string;
    estimatedAmount?: number | string | null;
    budgetAmount?: number | string | null;
    actualAmount?: number | string | null;
    taskCount?: number;
    closedTaskCount?: number;
    inProgressTaskCount?: number;
    openTaskCount?: number;
    nearestTaskDueDate?: string | null;
    canEdit?: boolean;
    rejectedAt?: 'dept' | 'hq' | null;
    applicantSubmitsToHqDirect?: boolean;
}

interface BudgetSummary {
    budgetTotal: number;
    actualTotal: number;
    averageConsumptionRate: number;
    warningCount: number;
}

const TAB_SUBTITLE: Record<ProjectTab, string> = {
    approval: '申請フェーズ',
    dev: '開発フェーズ',
    budget: '予算フェーズ',
};

const TAB_ACTIVE_KEY: Record<ProjectTab, ActiveKey> = {
    approval: 'projects-approval',
    dev: 'projects-dev',
    budget: 'projects-budget',
};

const toNumber = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined || value === '') return 0;
    return Number(value);
};

const formatCurrency = (value: number | string | null | undefined): string =>
    `¥${Math.trunc(toNumber(value)).toLocaleString('ja-JP')}`;

const formatDate = (value: string | null | undefined): string => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('ja-JP', { month: '2-digit', day: '2-digit' });
};

const formatRelativeUpdatedAt = (value: string | null | undefined): string => {
    if (!value) return '—';
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return value;
    const now = new Date();
    const diffMs = now.getTime() - dt.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'たった今';
    if (diffMinutes < 60) return `${diffMinutes}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return formatDate(value);
};

const dueDateMeta = (
    value: string | null | undefined,
): { date: string; label: string; className: string } => {
    if (!value) return { date: '—', label: '', className: 'text-jpt-muted' };
    const dt = new Date(`${value}T00:00:00`);
    if (Number.isNaN(dt.getTime())) return { date: value, label: '', className: 'text-jpt-muted' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((dt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 14) {
        return {
            date: formatDate(value),
            label: diffDays < 0 ? `${Math.abs(diffDays)}日超過` : `あと${diffDays}日`,
            className: 'text-jpt-red font-semibold',
        };
    }
    if (diffDays <= 31) {
        return {
            date: formatDate(value),
            label: `あと${diffDays}日`,
            className: 'text-[#C2410C] font-medium',
        };
    }
    return {
        date: formatDate(value),
        label: `あと${diffDays}日`,
        className: 'text-jpt-muted',
    };
};

const avatarClassByName = (name: string): string => {
    const gradients = [
        'from-cyan-400 to-violet-600',
        'from-amber-500 to-red-600',
        'from-emerald-500 to-sky-500',
        'from-fuchsia-500 to-indigo-500',
        'from-pink-500 to-purple-500',
    ];
    const code = name.charCodeAt(0) || 0;
    return gradients[code % gradients.length];
};

const projectCode = (id: number): string => `PRJ-${String(id).padStart(4, '0')}`;

const taskProgress = (project: ProjectListItem): number => {
    const total = project.taskCount ?? 0;
    if (total === 0) return 0;
    return Math.round(((project.closedTaskCount ?? 0) / total) * 100);
};

type TabSortDir = 'asc' | 'desc';

type DevSortKey =
    | 'title'
    | 'department'
    | 'primaryAssignee'
    | 'taskProgress'
    | 'nearestDue'
    | 'updatedAt';

function compareDevProjects(
    a: ProjectListItem,
    b: ProjectListItem,
    key: DevSortKey,
    dir: TabSortDir,
): number {
    const mul = dir === 'asc' ? 1 : -1;
    switch (key) {
        case 'title':
            return a.title.localeCompare(b.title, 'ja') * mul;
        case 'department':
            return (a.department ?? '').localeCompare(b.department ?? '', 'ja') * mul;
        case 'primaryAssignee': {
            const va = a.primaryAssignee?.trim() ?? '';
            const vb = b.primaryAssignee?.trim() ?? '';
            if (!va && !vb) return 0;
            if (!va) return 1;
            if (!vb) return -1;
            return va.localeCompare(vb, 'ja') * mul;
        }
        case 'taskProgress':
            return (taskProgress(a) - taskProgress(b)) * mul;
        case 'nearestDue': {
            const ta = a.nearestTaskDueDate
                ? Date.parse(`${a.nearestTaskDueDate}T00:00:00`)
                : null;
            const tb = b.nearestTaskDueDate
                ? Date.parse(`${b.nearestTaskDueDate}T00:00:00`)
                : null;
            if (ta === null && tb === null) return 0;
            if (ta === null) return 1;
            if (tb === null) return -1;
            return (ta - tb) * mul;
        }
        case 'updatedAt': {
            const ta = Date.parse(a.updatedAt);
            const tb = Date.parse(b.updatedAt);
            const va = Number.isNaN(ta) ? null : ta;
            const vb = Number.isNaN(tb) ? null : tb;
            if (va === null && vb === null) return 0;
            if (va === null) return 1;
            if (vb === null) return -1;
            return (va - vb) * mul;
        }
        default:
            return 0;
    }
}

function TableSortHeader<T extends string>({
    label,
    sortKey,
    activeKey,
    dir,
    onSort,
    className,
}: {
    label: string;
    sortKey: T;
    activeKey: T | null;
    dir: TabSortDir;
    onSort: (key: T) => void;
    className: string;
}) {
    const active = activeKey === sortKey;
    return (
        <th scope="col" className={`py-3 text-left align-bottom font-semibold ${className}`}>
            <button
                type="button"
                className="-mx-1 inline-flex max-w-full items-center gap-1 rounded px-1 py-0.5 text-xs uppercase tracking-wider text-slate-600 hover:bg-slate-100 hover:text-jpt-dark focus:outline-none focus:ring-2 focus:ring-jpt-blue"
                onClick={() => onSort(sortKey)}
                aria-label={`${label}で並び替え（クリックで昇順・降順の切替）`}
                aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
                <span className="truncate normal-case tracking-normal">{label}</span>
                {active ? (
                    dir === 'asc' ? (
                        <ChevronUp className="h-3.5 w-3.5 shrink-0 text-slate-800" aria-hidden />
                    ) : (
                        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-800" aria-hidden />
                    )
                ) : (
                    <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
                )}
            </button>
        </th>
    );
}

type ProgressBand = 'not_started' | 'in_progress' | 'completing' | 'completed';

const projectProgressBand = (project: ProjectListItem): ProgressBand => {
    const total = project.taskCount ?? 0;
    const rate = taskProgress(project);
    if (total === 0 || rate === 0) return 'not_started';
    if (rate >= 100) return 'completed';
    if (rate >= 90) return 'completing';
    return 'in_progress';
};

const progressBandLabel: Record<ProgressBand, string> = {
    not_started: '未着手',
    in_progress: '進行中',
    completing: '完了間近',
    completed: '完了',
};

const progressBandClass: Record<ProgressBand, string> = {
    not_started: 'bg-gray-100 text-gray-600',
    in_progress: 'bg-blue-50 text-blue-700',
    completing: 'bg-[#EDE9FE] text-[#5B21B6]',
    completed: 'bg-green-50 text-green-700',
};

const consumptionRate = (project: ProjectListItem): number => {
    const budget = toNumber(project.budgetAmount);
    if (budget <= 0) return 0;
    return Math.round((toNumber(project.actualAmount) / budget) * 1000) / 10;
};

const consumptionClass = (rate: number): string => {
    if (rate > 100) return 'bg-jpt-red text-jpt-red';
    if (rate >= 86) return 'bg-[#F59E0B] text-[#92400E]';
    if (rate >= 60) return 'bg-jpt-blue text-jpt-blue';
    return 'bg-[#16A34A] text-[#166534]';
};

type BudgetSortKey =
    | 'title'
    | 'department'
    | 'budgetAmount'
    | 'actualAmount'
    | 'consumption'
    | 'updatedAt';

function compareBudgetProjects(
    a: ProjectListItem,
    b: ProjectListItem,
    key: BudgetSortKey,
    dir: TabSortDir,
): number {
    const mul = dir === 'asc' ? 1 : -1;
    switch (key) {
        case 'title':
            return a.title.localeCompare(b.title, 'ja') * mul;
        case 'department':
            return (a.department ?? '').localeCompare(b.department ?? '', 'ja') * mul;
        case 'budgetAmount':
            return (toNumber(a.budgetAmount) - toNumber(b.budgetAmount)) * mul;
        case 'actualAmount':
            return (toNumber(a.actualAmount) - toNumber(b.actualAmount)) * mul;
        case 'consumption':
            return (consumptionRate(a) - consumptionRate(b)) * mul;
        case 'updatedAt': {
            const ta = Date.parse(a.updatedAt);
            const tb = Date.parse(b.updatedAt);
            const va = Number.isNaN(ta) ? null : ta;
            const vb = Number.isNaN(tb) ? null : tb;
            if (va === null && vb === null) return 0;
            if (va === null) return 1;
            if (vb === null) return -1;
            return (va - vb) * mul;
        }
        default:
            return 0;
    }
}

interface ApprovalProjectRow {
    id: number;
    title: string;
    department: string;
    status: ProjectStatus;
    appliedAt: string;
    updatedAt: string;
    rejectedAt?: 'dept' | 'hq';
    canEdit: boolean;
    applicantSubmitsToHqDirect?: boolean;
}

type ApprovalSortKey =
    | 'title'
    | 'status'
    | 'approvalStep'
    | 'appliedAt'
    | 'department'
    | 'updatedAt';

const approvalStatusRank: Record<ProjectStatus, number> = {
    draft: 1,
    pending_dept: 2,
    pending_hq: 3,
    approved: 4,
    rejected: 5,
};

function parseSubmittedAtSortValue(value: string): number | null {
    if (!value || value === '—') return null;
    const t = Date.parse(value);
    return Number.isNaN(t) ? null : t;
}

function compareApprovalRows(
    a: ApprovalProjectRow,
    b: ApprovalProjectRow,
    key: ApprovalSortKey,
    dir: TabSortDir,
): number {
    const mul = dir === 'asc' ? 1 : -1;
    switch (key) {
        case 'title':
            return a.title.localeCompare(b.title, 'ja') * mul;
        case 'status':
        case 'approvalStep':
            return (approvalStatusRank[a.status] - approvalStatusRank[b.status]) * mul;
        case 'appliedAt': {
            const va = parseSubmittedAtSortValue(a.appliedAt);
            const vb = parseSubmittedAtSortValue(b.appliedAt);
            if (va !== null && vb !== null) return (va - vb) * mul;
            if (va === null && vb === null)
                return a.appliedAt.localeCompare(b.appliedAt, 'ja') * mul;
            if (va === null) return 1;
            return -1;
        }
        case 'department':
            return a.department.localeCompare(b.department, 'ja') * mul;
        case 'updatedAt': {
            const ta = Date.parse(a.updatedAt);
            const tb = Date.parse(b.updatedAt);
            const va = Number.isNaN(ta) ? null : ta;
            const vb = Number.isNaN(tb) ? null : tb;
            if (va === null && vb === null)
                return a.updatedAt.localeCompare(b.updatedAt, 'ja') * mul;
            if (va === null) return 1;
            if (vb === null) return -1;
            return (va - vb) * mul;
        }
        default:
            return 0;
    }
}

interface DevProjectRow {
    id: number;
    title: string;
    department: string;
    owner: string;
    progress: number;
    dueDate: string;
    updatedAt: string;
}

interface BudgetProjectRow {
    id: number;
    title: string;
    department: string;
    budgetAmount: string;
    actualAmount: string;
    consumptionRate: string;
    updatedAt: string;
}

const DEFAULT_TAB_ITEMS: TabItem<ProjectTab>[] = [
    { value: 'approval', label: '申請', icon: FileText, count: 0 },
    { value: 'dev', label: '開発', icon: GitBranch, count: 0 },
    { value: 'budget', label: '予算', icon: Wallet, count: 0 },
];

const APPROVAL_ROWS: ApprovalProjectRow[] = [
    {
        id: 1,
        title: '次世代EAMシステム開発',
        department: '開発1部',
        status: 'pending_hq',
        appliedAt: '04/14',
        updatedAt: '2時間前',
        canEdit: false,
    },
    {
        id: 2,
        title: 'LNGプラント解析ツール刷新',
        department: '開発1部',
        status: 'pending_dept',
        appliedAt: '04/15',
        updatedAt: '1日前',
        canEdit: true,
    },
    {
        id: 3,
        title: '現場IoTセンサー可視化ダッシュボード',
        department: '開発1部',
        status: 'draft',
        appliedAt: '—',
        updatedAt: '3日前',
        canEdit: true,
    },
    {
        id: 4,
        title: '調達部向けRPA導入PoC',
        department: '開発1部',
        status: 'rejected',
        rejectedAt: 'hq',
        appliedAt: '04/08',
        updatedAt: '6日前',
        canEdit: true,
    },
];

const DEV_ROWS: DevProjectRow[] = [
    {
        id: 11,
        title: '次世代EAMシステム開発',
        department: '開発1部',
        owner: '小林 由佳',
        progress: 68,
        dueDate: '05/30',
        updatedAt: '2時間前',
    },
    {
        id: 12,
        title: '人事評価システムリプレース',
        department: '開発2部',
        owner: '田中 一郎',
        progress: 42,
        dueDate: '06/14',
        updatedAt: '1日前',
    },
];

const BUDGET_ROWS: BudgetProjectRow[] = [
    {
        id: 21,
        title: '次世代EAMシステム開発',
        department: '開発1部',
        budgetAmount: '¥6,000,000',
        actualAmount: '¥2,860,000',
        consumptionRate: '47.7%',
        updatedAt: '2時間前',
    },
    {
        id: 22,
        title: 'LNGプラント解析ツール刷新',
        department: '開発1部',
        budgetAmount: '¥4,200,000',
        actualAmount: '¥1,190,000',
        consumptionRate: '28.3%',
        updatedAt: '1日前',
    },
];

export default function ProjectsIndex({
    tab,
    filter,
    status,
    department,
    assignee,
    progress,
    consumption,
    q,
    departments = [],
    assignees = [],
    budgetSummary,
    tabCounts,
    projects,
}: Props) {
    const { flash } = usePage<PageProps>().props;
    const isPendingFilter = filter === 'pending';

    const activeKey: ActiveKey =
        isPendingFilter ? 'pending' : TAB_ACTIVE_KEY[tab];
    const projectRows = projects?.data ?? [];
    const [devSort, setDevSort] = useState<{ key: DevSortKey | null; dir: TabSortDir }>({
        key: null,
        dir: 'asc',
    });
    const [approvalSort, setApprovalSort] = useState<{
        key: ApprovalSortKey | null;
        dir: TabSortDir;
    }>({ key: null, dir: 'asc' });
    const [budgetSort, setBudgetSort] = useState<{ key: BudgetSortKey | null; dir: TabSortDir }>({
        key: null,
        dir: 'asc',
    });

    useEffect(() => {
        if (tab !== 'dev') {
            setDevSort({ key: null, dir: 'asc' });
        }
        if (tab !== 'approval') {
            setApprovalSort({ key: null, dir: 'asc' });
        }
        if (tab !== 'budget') {
            setBudgetSort({ key: null, dir: 'asc' });
        }
    }, [tab]);

    const devSortedRows = useMemo(() => {
        if (tab !== 'dev' || devSort.key === null) {
            return projectRows;
        }
        return [...projectRows].sort((a, b) =>
            compareDevProjects(a, b, devSort.key!, devSort.dir),
        );
    }, [tab, projectRows, devSort]);

    const toggleDevSort = (nextKey: DevSortKey) => {
        setDevSort((prev) =>
            prev.key !== nextKey
                ? { key: nextKey, dir: 'asc' }
                : { key: nextKey, dir: prev.dir === 'asc' ? 'desc' : 'asc' },
        );
    };

    const currentPage = projects?.current_page ?? 1;
    const lastPage = projects?.last_page ?? 1;
    const from = projects?.from ?? (projectRows.length > 0 ? 1 : 0);
    const to = projects?.to ?? projectRows.length;
    const total = projects?.total ?? projectRows.length;
    const approvalRows: ApprovalProjectRow[] = projects
        ? projects.data.map((project) => ({
              id: project.id,
              title: project.title,
              department: project.department ?? '—',
              status: project.status,
              appliedAt: project.submittedAt ?? '—',
              updatedAt: project.updatedAt,
              rejectedAt: project.rejectedAt ?? undefined,
              canEdit: project.canEdit ?? false,
              applicantSubmitsToHqDirect: project.applicantSubmitsToHqDirect ?? false,
          }))
        : APPROVAL_ROWS;

    const approvalSortedRows = useMemo(() => {
        if (tab !== 'approval' || approvalSort.key === null) {
            return approvalRows;
        }
        return [...approvalRows].sort((a, b) =>
            compareApprovalRows(a, b, approvalSort.key!, approvalSort.dir),
        );
    }, [tab, approvalRows, approvalSort]);

    const budgetSortedRows = useMemo(() => {
        if (tab !== 'budget' || budgetSort.key === null) {
            return projectRows;
        }
        return [...projectRows].sort((a, b) =>
            compareBudgetProjects(a, b, budgetSort.key!, budgetSort.dir),
        );
    }, [tab, projectRows, budgetSort]);

    const toggleApprovalSort = (nextKey: ApprovalSortKey) => {
        setApprovalSort((prev) =>
            prev.key !== nextKey
                ? { key: nextKey, dir: 'asc' }
                : { key: nextKey, dir: prev.dir === 'asc' ? 'desc' : 'asc' },
        );
    };

    const toggleBudgetSort = (nextKey: BudgetSortKey) => {
        setBudgetSort((prev) =>
            prev.key !== nextKey
                ? { key: nextKey, dir: 'asc' }
                : { key: nextKey, dir: prev.dir === 'asc' ? 'desc' : 'asc' },
        );
    };

    const tabItems: TabItem<ProjectTab>[] = DEFAULT_TAB_ITEMS.map((item) => ({
        ...item,
        count: tabCounts?.[item.value] ?? 0,
    }));
    const titleCount = tab === 'approval' ? approvalRows.length : projectRows.length;
    const showDetailHref = (id: number, detailTab: 'apply' | 'tasks' | 'budget'): string =>
        `${route('projects.show', id)}?detailTab=${detailTab}`;

    const handleTabChange = (nextTab: ProjectTab) => {
        if (nextTab === tab) return;
        router.visit(route('projects.index'), {
            data: {
                tab: nextTab,
                ...(filter ? { filter } : {}),
                ...(status ? { status } : {}),
                ...(department ? { department } : {}),
                ...(q ? { q } : {}),
            },
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const submitApprovalFilters = ({
        keyword,
        nextStatus,
        nextDepartment,
    }: {
        keyword: string;
        nextStatus?: string;
        nextDepartment?: string;
    }) => {
        const nextQ = keyword.trim();
        const statusValue = (nextStatus ?? status ?? '').trim();
        const departmentValue = (nextDepartment ?? String(department ?? '')).trim();
        router.visit(route('projects.index'), {
            data: {
                tab: 'approval',
                ...(filter ? { filter } : {}),
                ...(statusValue ? { status: statusValue } : {}),
                ...(departmentValue ? { department: Number(departmentValue) } : {}),
                ...(nextQ ? { q: nextQ } : {}),
            },
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const submitProjectFilters = ({
        nextTab,
        keyword,
        nextDepartment,
        nextAssignee,
        nextProgress,
        nextConsumption,
    }: {
        nextTab: 'dev' | 'budget';
        keyword: string;
        nextDepartment?: string;
        nextAssignee?: string;
        nextProgress?: string;
        nextConsumption?: string;
    }) => {
        const nextQ = keyword.trim();
        const departmentValue = (nextDepartment ?? String(department ?? '')).trim();
        const assigneeValue = (nextAssignee ?? String(assignee ?? '')).trim();
        const progressValue = (nextProgress ?? progress ?? '').trim();
        const consumptionValue = (nextConsumption ?? consumption ?? '').trim();
        router.visit(route('projects.index'), {
            data: {
                tab: nextTab,
                ...(departmentValue ? { department: Number(departmentValue) } : {}),
                ...(nextQ ? { q: nextQ } : {}),
                ...(nextTab === 'dev' && assigneeValue
                    ? { assignee: Number(assigneeValue) }
                    : {}),
                ...(nextTab === 'dev' && progressValue ? { progress: progressValue } : {}),
                ...(nextTab === 'budget' && consumptionValue
                    ? { consumption: consumptionValue }
                    : {}),
            },
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const changePage = (page: number) => {
        const safePage = Math.max(1, Math.min(page, lastPage));
        if (safePage === currentPage) return;

        if (tab === 'approval') {
            router.visit(route('projects.index'), {
                data: {
                    tab,
                    ...(filter ? { filter } : {}),
                    ...(status ? { status } : {}),
                    ...(department ? { department } : {}),
                    ...(q ? { q } : {}),
                    page: safePage,
                },
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
            return;
        }

        if (tab === 'dev') {
            router.visit(route('projects.index'), {
                data: {
                    tab,
                    ...(department ? { department } : {}),
                    ...(q ? { q } : {}),
                    ...(progress ? { progress } : {}),
                    page: safePage,
                },
                preserveScroll: true,
                preserveState: true,
                replace: true,
            });
            return;
        }

        router.visit(route('projects.index'), {
            data: {
                tab,
                ...(department ? { department } : {}),
                ...(q ? { q } : {}),
                ...(consumption ? { consumption } : {}),
                page: safePage,
            },
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const approvalRowHref = (row: ApprovalProjectRow): string =>
        row.status === 'draft' && row.canEdit
            ? route('projects.edit', row.id)
            : showDetailHref(row.id, 'apply');

    return (
        <AuthenticatedLayout
            activeKey={activeKey}
            breadcrumb={[
                {
                    label:
                        tab === 'dev'
                            ? '開発管理'
                            : tab === 'budget'
                              ? '予算管理'
                              : '申請・承認',
                    icon: tab === 'dev' ? GitBranch : tab === 'budget' ? Wallet : FileCheck2,
                },
                { label: PROJECT_LIST_PAGE_TITLE[tab], icon: FolderSearch },
            ]}
        >
            <Head title={PROJECT_LIST_PAGE_TITLE[tab]} />

            {flash?.error && (
                <div
                    role="alert"
                    className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                >
                    {flash.error}
                </div>
            )}
            {flash?.success && (
                <div
                    role="status"
                    className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
                >
                    {flash.success}
                </div>
            )}

            <div className="mb-5 flex items-start justify-between">
                <div>
                    <h1 className="flex items-center text-2xl font-bold tracking-tight text-jpt-dark">
                        <span className="mr-2.5 inline-block h-6 w-1 rounded-sm bg-jpt-accent" />
                        {PROJECT_LIST_PAGE_TITLE[tab]}
                    </h1>
                    <p className="mt-1 text-sm text-jpt-muted">
                        {TAB_SUBTITLE[tab]}
                        <span className="mx-1.5">·</span>
                        全{titleCount}件
                    </p>
                    {filter === 'pending' && (
                        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-xs font-semibold text-[#991B1B]">
                            <Inbox className="h-3.5 w-3.5" />
                            承認待ち
                        </span>
                    )}
                </div>
                {tab === 'approval' && (
                    <Button
                        size="default"
                        className="flex items-center gap-2"
                        onClick={() => router.visit(route('projects.create'))}
                    >
                        <Plus className="h-4 w-4" />
                        新規申請
                    </Button>
                )}
            </div>

            <section className="overflow-hidden rounded-lg border border-jpt-border bg-white shadow-sm">
                <div className="border-b border-jpt-border px-5">
                    <div className="flex items-center gap-4">
                        <Tabs
                            value={tab}
                            onChange={handleTabChange}
                            items={
                                isPendingFilter
                                    ? tabItems.filter((item) => item.value === 'approval')
                                    : tabItems
                            }
                            className="min-w-0 flex-1"
                        />
                        <p className="hidden shrink-0 text-xs text-jpt-muted md:block">
                            フェーズ別に表示列が切り替わります
                        </p>
                    </div>
                </div>
                {tab === 'approval' && (
                    <div className="border-b border-jpt-border px-5 py-3">
                        <form
                            className="flex flex-wrap items-center gap-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                const form = event.currentTarget;
                                const formData = new FormData(form);
                                submitApprovalFilters({
                                    keyword: String(formData.get('q') ?? ''),
                                    nextStatus: String(formData.get('status') ?? ''),
                                    nextDepartment: String(formData.get('department') ?? ''),
                                });
                            }}
                        >
                            <div className="relative w-full max-w-[20rem]">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jpt-muted" />
                                <input
                                    name="q"
                                    defaultValue={q ?? ''}
                                    placeholder="案件名・主担当で検索"
                                    className="w-full rounded-md border border-jpt-border bg-white py-2 pl-9 pr-3 text-sm text-jpt-dark placeholder:text-jpt-muted focus:outline-none focus:ring-2 focus:ring-jpt-blue/40"
                                />
                            </div>
                            <select
                                name="status"
                                defaultValue={status ?? ''}
                                className="min-w-[170px] rounded-md border border-jpt-border bg-white px-3 py-2 pr-9 text-sm text-jpt-dark focus:outline-none focus:ring-2 focus:ring-jpt-blue/40"
                                onChange={(event) =>
                                    submitApprovalFilters({
                                        keyword: String(
                                            (
                                                event.currentTarget.form?.elements.namedItem(
                                                    'q',
                                                ) as HTMLInputElement | null
                                            )?.value ?? '',
                                        ),
                                        nextStatus: event.currentTarget.value,
                                        nextDepartment: String(
                                            (
                                                event.currentTarget.form?.elements.namedItem(
                                                    'department',
                                                ) as HTMLSelectElement | null
                                            )?.value ?? '',
                                        ),
                                    })
                                }
                            >
                                <option value="">ステータス：すべて</option>
                                <option value="draft">下書き</option>
                                <option value="pending_dept">部門承認待ち</option>
                                <option value="pending_hq">本部承認待ち</option>
                                <option value="rejected">却下</option>
                            </select>
                            <select
                                name="department"
                                defaultValue={department ? String(department) : ''}
                                className="min-w-[150px] rounded-md border border-jpt-border bg-white px-3 py-2 pr-9 text-sm text-jpt-dark focus:outline-none focus:ring-2 focus:ring-jpt-blue/40"
                                onChange={(event) =>
                                    submitApprovalFilters({
                                        keyword: String(
                                            (
                                                event.currentTarget.form?.elements.namedItem(
                                                    'q',
                                                ) as HTMLInputElement | null
                                            )?.value ?? '',
                                        ),
                                        nextStatus: String(
                                            (
                                                event.currentTarget.form?.elements.namedItem(
                                                    'status',
                                                ) as HTMLSelectElement | null
                                            )?.value ?? '',
                                        ),
                                        nextDepartment: event.currentTarget.value,
                                    })
                                }
                            >
                                <option value="">部門：すべて</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                                onClick={() =>
                                    submitApprovalFilters({
                                        keyword: '',
                                        nextStatus: '',
                                        nextDepartment: '',
                                    })
                                }
                            >
                                クリア
                            </Button>
                        </form>
                    </div>
                )}
                {tab === 'dev' && (
                    <div className="border-b border-jpt-border px-5 py-3">
                        <form
                            className="flex flex-wrap items-center gap-3"
                            onSubmit={(event) => {
                                event.preventDefault();
                                const formData = new FormData(event.currentTarget);
                                submitProjectFilters({
                                    nextTab: 'dev',
                                    keyword: String(formData.get('q') ?? ''),
                                    nextDepartment: String(formData.get('department') ?? ''),
                                    nextAssignee: String(formData.get('assignee') ?? ''),
                                    nextProgress: String(formData.get('progress') ?? ''),
                                });
                            }}
                        >
                            <div className="relative w-full max-w-[20rem]">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jpt-muted" />
                                <input
                                    name="q"
                                    defaultValue={q ?? ''}
                                    placeholder="案件名・申請者で検索"
                                    className="w-full rounded-md border border-jpt-border bg-white py-2 pl-9 pr-3 text-sm text-jpt-dark placeholder:text-jpt-muted focus:outline-none focus:ring-2 focus:ring-jpt-blue/40"
                                />
                            </div>
                            <select
                                name="department"
                                defaultValue={department ? String(department) : ''}
                                className="min-w-[150px] rounded-md border border-jpt-border bg-white px-3 py-2 pr-9 text-sm text-jpt-dark focus:outline-none focus:ring-2 focus:ring-jpt-blue/40"
                                onChange={(event) =>
                                    submitProjectFilters({
                                        nextTab: 'dev',
                                        keyword: String(
                                            (
                                                event.currentTarget.form?.elements.namedItem(
                                                    'q',
                                                ) as HTMLInputElement | null
                                            )?.value ?? '',
                                        ),
                                        nextDepartment: event.currentTarget.value,
                                        nextProgress: String(
                                            (
                                                event.currentTarget.form?.elements.namedItem(
                                                    'progress',
                                                ) as HTMLSelectElement | null
                                            )?.value ?? '',
                                        ),
                                    })
                                }
                            >
                                <option value="">部門：すべて</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="progress"
                                defaultValue={progress ?? ''}
                                className="min-w-[160px] rounded-md border border-jpt-border bg-white px-3 py-2 pr-9 text-sm text-jpt-dark focus:outline-none focus:ring-2 focus:ring-jpt-blue/40"
                                onChange={(event) =>
                                    submitProjectFilters({
                                        nextTab: 'dev',
                                        keyword: String(
                                            (
                                                event.currentTarget.form?.elements.namedItem(
                                                    'q',
                                                ) as HTMLInputElement | null
                                            )?.value ?? '',
                                        ),
                                        nextDepartment: String(
                                            (
                                                event.currentTarget.form?.elements.namedItem(
                                                    'department',
                                                ) as HTMLSelectElement | null
                                            )?.value ?? '',
                                        ),
                                        nextProgress: event.currentTarget.value,
                                    })
                                }
                            >
                                <option value="">進捗：すべて</option>
                                <option value="not_started">未着手（0%）</option>
                                <option value="in_progress">進行中</option>
                                <option value="completing">完了間近（90%+）</option>
                                <option value="completed">完了</option>
                            </select>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="ml-auto"
                                onClick={() =>
                                    submitProjectFilters({
                                        nextTab: 'dev',
                                        keyword: '',
                                        nextDepartment: '',
                                        nextProgress: '',
                                    })
                                }
                            >
                                クリア
                            </Button>
                        </form>
                    </div>
                )}
                {tab === 'budget' && (
                    <>
                        <div className="grid gap-3 border-b border-jpt-border bg-jpt-bg/40 px-5 py-4 md:grid-cols-4">
                            <div className="rounded-lg border border-jpt-border bg-white p-3">
                                <p className="text-xs text-jpt-muted">予算合計</p>
                                <p className="mt-1 font-mono text-lg font-bold">
                                    {formatCurrency(budgetSummary?.budgetTotal ?? 0)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-jpt-border bg-white p-3">
                                <p className="text-xs text-jpt-muted">実績合計</p>
                                <p className="mt-1 font-mono text-lg font-bold text-jpt-blue">
                                    {formatCurrency(budgetSummary?.actualTotal ?? 0)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-jpt-border bg-white p-3">
                                <p className="text-xs text-jpt-muted">平均消費率</p>
                                <p className="mt-1 font-mono text-lg font-bold">
                                    {(budgetSummary?.averageConsumptionRate ?? 0).toFixed(1)}%
                                </p>
                            </div>
                            <div className="rounded-lg border border-jpt-border bg-white p-3">
                                <p className="text-xs text-jpt-muted">要注意案件</p>
                                <p className="mt-1 font-mono text-lg font-bold text-[#92400E]">
                                    {budgetSummary?.warningCount ?? 0}件
                                </p>
                            </div>
                        </div>
                        <div className="border-b border-jpt-border px-5 py-3">
                            <form
                                className="flex flex-wrap items-center gap-3"
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    const formData = new FormData(event.currentTarget);
                                    submitProjectFilters({
                                        nextTab: 'budget',
                                        keyword: String(formData.get('q') ?? ''),
                                        nextDepartment: String(formData.get('department') ?? ''),
                                        nextConsumption: String(formData.get('consumption') ?? ''),
                                    });
                                }}
                            >
                                <div className="relative w-full max-w-[20rem]">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jpt-muted" />
                                    <input
                                        name="q"
                                        defaultValue={q ?? ''}
                                        placeholder="案件名で検索"
                                        className="w-full rounded-md border border-jpt-border bg-white py-2 pl-9 pr-3 text-sm text-jpt-dark placeholder:text-jpt-muted focus:outline-none focus:ring-2 focus:ring-jpt-blue/40"
                                    />
                                </div>
                                <select
                                    name="department"
                                    defaultValue={department ? String(department) : ''}
                                    className="min-w-[150px] rounded-md border border-jpt-border bg-white px-3 py-2 pr-9 text-sm text-jpt-dark focus:outline-none focus:ring-2 focus:ring-jpt-blue/40"
                                    onChange={(event) =>
                                        submitProjectFilters({
                                            nextTab: 'budget',
                                            keyword: String(
                                                (
                                                    event.currentTarget.form?.elements.namedItem(
                                                        'q',
                                                    ) as HTMLInputElement | null
                                                )?.value ?? '',
                                            ),
                                            nextDepartment: event.currentTarget.value,
                                            nextConsumption: String(
                                                (
                                                    event.currentTarget.form?.elements.namedItem(
                                                        'consumption',
                                                    ) as HTMLSelectElement | null
                                                )?.value ?? '',
                                            ),
                                        })
                                    }
                                >
                                    <option value="">部門：すべて</option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="consumption"
                                    defaultValue={consumption ?? ''}
                                    className="min-w-[170px] rounded-md border border-jpt-border bg-white px-3 py-2 pr-9 text-sm text-jpt-dark focus:outline-none focus:ring-2 focus:ring-jpt-blue/40"
                                    onChange={(event) =>
                                        submitProjectFilters({
                                            nextTab: 'budget',
                                            keyword: String(
                                                (
                                                    event.currentTarget.form?.elements.namedItem(
                                                        'q',
                                                    ) as HTMLInputElement | null
                                                )?.value ?? '',
                                            ),
                                            nextDepartment: String(
                                                (
                                                    event.currentTarget.form?.elements.namedItem(
                                                        'department',
                                                    ) as HTMLSelectElement | null
                                                )?.value ?? '',
                                            ),
                                            nextConsumption: event.currentTarget.value,
                                        })
                                    }
                                >
                                    <option value="">消費率：すべて</option>
                                    <option value="safe">60%未満</option>
                                    <option value="normal">60-85%</option>
                                    <option value="warn">86-100%</option>
                                    <option value="over">100%超</option>
                                </select>
                                <Button type="submit" variant="secondary" size="sm">
                                    検索
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="ml-auto"
                                    onClick={() =>
                                        submitProjectFilters({
                                            nextTab: 'budget',
                                            keyword: '',
                                            nextDepartment: '',
                                            nextConsumption: '',
                                        })
                                    }
                                >
                                    クリア
                                </Button>
                            </form>
                        </div>
                    </>
                )}
                <div className="overflow-x-auto">
                    {tab === 'approval' && approvalRows.length === 0 ? (
                        <div className="px-6 py-14">
                            <EmptyState
                                icon={Inbox}
                                title={
                                    filter === 'pending'
                                        ? '承認待ちの案件はありません'
                                        : '案件がありません'
                                }
                                description={
                                    filter === 'pending'
                                        ? '現在、あなたが対応すべき承認待ち案件は表示されません。'
                                        : '新規申請を作成すると、ここに表示されます。'
                                }
                            />
                        </div>
                    ) : tab === 'approval' ? (
                        <table className="min-w-full text-sm">
                            <thead className="bg-jpt-bg text-xs uppercase tracking-wider text-jpt-muted">
                                <tr>
                                    <TableSortHeader
                                        label="タイトル"
                                        sortKey="title"
                                        activeKey={approvalSort.key}
                                        dir={approvalSort.dir}
                                        onSort={toggleApprovalSort}
                                        className="px-5"
                                    />
                                    <TableSortHeader
                                        label="ステータス"
                                        sortKey="status"
                                        activeKey={approvalSort.key}
                                        dir={approvalSort.dir}
                                        onSort={toggleApprovalSort}
                                        className="px-4"
                                    />
                                    <TableSortHeader
                                        label="承認ステップ"
                                        sortKey="approvalStep"
                                        activeKey={approvalSort.key}
                                        dir={approvalSort.dir}
                                        onSort={toggleApprovalSort}
                                        className="px-4"
                                    />
                                    <TableSortHeader
                                        label="申請日"
                                        sortKey="appliedAt"
                                        activeKey={approvalSort.key}
                                        dir={approvalSort.dir}
                                        onSort={toggleApprovalSort}
                                        className="px-4"
                                    />
                                    <TableSortHeader
                                        label="部門"
                                        sortKey="department"
                                        activeKey={approvalSort.key}
                                        dir={approvalSort.dir}
                                        onSort={toggleApprovalSort}
                                        className="px-4"
                                    />
                                    <TableSortHeader
                                        label="最終更新"
                                        sortKey="updatedAt"
                                        activeKey={approvalSort.key}
                                        dir={approvalSort.dir}
                                        onSort={toggleApprovalSort}
                                        className="px-4"
                                    />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-jpt-border">
                                {approvalSortedRows.map((row, index) => (
                                    <tr
                                        key={row.id}
                                        className={cn(
                                            'cursor-pointer hover:bg-slate-50',
                                            index === 0 && 'bg-white',
                                        )}
                                        onClick={() => router.visit(approvalRowHref(row))}
                                    >
                                        <td className="px-5 py-3.5 font-medium text-jpt-dark">
                                            <Link
                                                href={approvalRowHref(row)}
                                                className="hover:text-jpt-blue hover:underline"
                                            >
                                                {row.title}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <StatusPill status={row.status} />
                                                {row.applicantSubmitsToHqDirect &&
                                                    (row.status === 'pending_hq' ||
                                                        row.status === 'approved' ||
                                                        (row.status === 'rejected' &&
                                                            row.rejectedAt === 'hq')) && (
                                                        <span className="rounded-full bg-[#E0F2FE] px-2 py-0.5 text-[10px] font-semibold text-[#0369A1]">
                                                            本部直行
                                                        </span>
                                                    )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <ApprovalStepperMini
                                                status={row.status}
                                                rejectedAt={row.rejectedAt}
                                                skipsDeptStep={
                                                    !!row.applicantSubmitsToHqDirect &&
                                                    (row.status === 'pending_hq' ||
                                                        row.status === 'approved' ||
                                                        (row.status === 'rejected' &&
                                                            row.rejectedAt === 'hq'))
                                                }
                                            />
                                        </td>
                                        <td className="px-4 py-3.5 text-jpt-muted">
                                            {row.appliedAt}
                                        </td>
                                        <td className="px-4 py-3.5 text-jpt-dark">
                                            {row.department}
                                        </td>
                                        <td className="px-4 py-3.5 text-jpt-muted">
                                            {row.updatedAt}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : null}

                    {tab === 'dev' && (
                        <table className="min-w-full text-sm">
                            <thead className="bg-jpt-bg text-xs uppercase tracking-wider text-jpt-muted">
                                <tr>
                                    <TableSortHeader
                                        label="タイトル"
                                        sortKey="title"
                                        activeKey={devSort.key}
                                        dir={devSort.dir}
                                        onSort={toggleDevSort}
                                        className="px-5"
                                    />
                                    <TableSortHeader
                                        label="部門"
                                        sortKey="department"
                                        activeKey={devSort.key}
                                        dir={devSort.dir}
                                        onSort={toggleDevSort}
                                        className="px-4"
                                    />
                                    <TableSortHeader
                                        label="主担当"
                                        sortKey="primaryAssignee"
                                        activeKey={devSort.key}
                                        dir={devSort.dir}
                                        onSort={toggleDevSort}
                                        className="px-4"
                                    />
                                    <TableSortHeader
                                        label="タスク進捗"
                                        sortKey="taskProgress"
                                        activeKey={devSort.key}
                                        dir={devSort.dir}
                                        onSort={toggleDevSort}
                                        className="px-4"
                                    />
                                    <TableSortHeader
                                        label="期限"
                                        sortKey="nearestDue"
                                        activeKey={devSort.key}
                                        dir={devSort.dir}
                                        onSort={toggleDevSort}
                                        className="px-4"
                                    />
                                    <TableSortHeader
                                        label="最終更新"
                                        sortKey="updatedAt"
                                        activeKey={devSort.key}
                                        dir={devSort.dir}
                                        onSort={toggleDevSort}
                                        className="px-4"
                                    />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-jpt-border">
                                {devSortedRows.map((row) => {
                                    const progressRate = taskProgress(row);
                                    const total = row.taskCount ?? 0;

                                    return (
                                    <tr
                                        key={row.id}
                                        className="cursor-pointer hover:bg-slate-50"
                                        onClick={() => router.visit(showDetailHref(row.id, 'tasks'))}
                                    >
                                        <td className="px-5 py-3.5 font-medium text-jpt-dark">
                                            <Link
                                                href={showDetailHref(row.id, 'tasks')}
                                                className="hover:text-jpt-blue hover:underline"
                                            >
                                                {row.title}
                                            </Link>
                                            <div className="mt-0.5 flex items-center gap-2 text-xs font-normal text-jpt-muted">
                                                <span className="font-mono">{projectCode(row.id)}</span>
                                                <span
                                                    className={cn(
                                                        'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                                        progressBandClass[projectProgressBand(row)],
                                                    )}
                                                >
                                                    {progressBandLabel[projectProgressBand(row)]}
                                                </span>
                                                {progressRate >= 90 && total > 0 && progressRate < 100 && (
                                                    <span className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-semibold text-[#5B21B6]">
                                                        完了間近
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-jpt-dark">
                                            {row.department}
                                        </td>
                                        <td className="px-4 py-3.5 text-jpt-dark">
                                            {row.primaryAssignee ? (
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            'inline-flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white',
                                                            avatarClassByName(row.primaryAssignee),
                                                        )}
                                                    >
                                                        {row.primaryAssignee[0]}
                                                    </span>
                                                    <span>{row.primaryAssignee}</span>
                                                </div>
                                            ) : (
                                                '未設定'
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-jpt-dark">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 min-w-32 flex-1 overflow-hidden rounded-full bg-[#E9ECEF]">
                                                    <div
                                                        className={cn(
                                                            'h-full rounded-full',
                                                            progressRate >= 95 ? 'bg-[#16A34A]' : 'bg-jpt-blue',
                                                        )}
                                                        style={{ width: `${progressRate}%` }}
                                                    />
                                                </div>
                                                <span className="w-11 text-right font-mono text-xs font-semibold">
                                                    {progressRate}%
                                                </span>
                                            </div>
                                            <div className="mt-1 text-[10px] text-jpt-muted">
                                                {total}件中 {row.closedTaskCount ?? 0}件完了 / 進行中{' '}
                                                {row.inProgressTaskCount ?? 0} / 未着手 {row.openTaskCount ?? 0}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-jpt-dark">
                                            <div className={cn('text-sm', dueDateMeta(row.nearestTaskDueDate).className)}>
                                                {dueDateMeta(row.nearestTaskDueDate).date}
                                            </div>
                                            {dueDateMeta(row.nearestTaskDueDate).label && (
                                                <div className={cn('text-[10px]', dueDateMeta(row.nearestTaskDueDate).className)}>
                                                    {dueDateMeta(row.nearestTaskDueDate).label}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-jpt-muted">
                                            {formatRelativeUpdatedAt(row.updatedAt)}
                                        </td>
                                    </tr>
                                );
                                })}
                            </tbody>
                        </table>
                    )}

                    {tab === 'budget' && (
                        <table className="min-w-full text-sm">
                            <thead className="bg-jpt-bg text-xs uppercase tracking-wider text-jpt-muted">
                                <tr>
                                    <TableSortHeader
                                        label="タイトル"
                                        sortKey="title"
                                        activeKey={budgetSort.key}
                                        dir={budgetSort.dir}
                                        onSort={toggleBudgetSort}
                                        className="px-5"
                                    />
                                    <TableSortHeader
                                        label="部門"
                                        sortKey="department"
                                        activeKey={budgetSort.key}
                                        dir={budgetSort.dir}
                                        onSort={toggleBudgetSort}
                                        className="px-4"
                                    />
                                    <TableSortHeader
                                        label="予算額"
                                        sortKey="budgetAmount"
                                        activeKey={budgetSort.key}
                                        dir={budgetSort.dir}
                                        onSort={toggleBudgetSort}
                                        className="px-4"
                                    />
                                    <TableSortHeader
                                        label="実績額"
                                        sortKey="actualAmount"
                                        activeKey={budgetSort.key}
                                        dir={budgetSort.dir}
                                        onSort={toggleBudgetSort}
                                        className="px-4"
                                    />
                                    <TableSortHeader
                                        label="消費率"
                                        sortKey="consumption"
                                        activeKey={budgetSort.key}
                                        dir={budgetSort.dir}
                                        onSort={toggleBudgetSort}
                                        className="px-4"
                                    />
                                    <TableSortHeader
                                        label="更新日"
                                        sortKey="updatedAt"
                                        activeKey={budgetSort.key}
                                        dir={budgetSort.dir}
                                        onSort={toggleBudgetSort}
                                        className="px-4"
                                    />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-jpt-border">
                                {budgetSortedRows.map((row) => {
                                    const rate = consumptionRate(row);
                                    const rateClass = consumptionClass(rate);
                                    const remaining = toNumber(row.budgetAmount) - toNumber(row.actualAmount);

                                    return (
                                    <tr
                                        key={row.id}
                                        className="cursor-pointer hover:bg-slate-50"
                                        onClick={() => router.visit(showDetailHref(row.id, 'budget'))}
                                    >
                                        <td className="px-5 py-3.5 font-medium text-jpt-dark">
                                            <Link
                                                href={showDetailHref(row.id, 'budget')}
                                                className="hover:text-jpt-blue hover:underline"
                                            >
                                                {row.title}
                                            </Link>
                                            <div className="mt-0.5 flex items-center gap-2 text-xs font-normal text-jpt-muted">
                                                <span className="font-mono">{projectCode(row.id)}</span>
                                                <span>{row.department ?? '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-jpt-dark">
                                            {row.department}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-mono text-jpt-dark">
                                            {formatCurrency(row.budgetAmount)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-mono text-jpt-dark">
                                            {formatCurrency(row.actualAmount)}
                                        </td>
                                        <td className="px-4 py-3.5 text-jpt-dark">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 min-w-32 flex-1 overflow-hidden rounded-full bg-[#E9ECEF]">
                                                    <div
                                                        className={cn('h-full rounded-full', rateClass.split(' ')[0])}
                                                        style={{ width: `${Math.min(rate, 100)}%` }}
                                                    />
                                                </div>
                                                <span className={cn('w-14 text-right font-mono text-xs font-semibold', rateClass.split(' ')[1])}>
                                                    {rate.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className={cn('mt-1 text-[10px]', remaining < 0 ? 'text-jpt-red' : 'text-jpt-muted')}>
                                                残 {formatCurrency(remaining)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-jpt-muted">
                                            {formatDate(row.updatedAt)}
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="flex items-center justify-between border-t border-jpt-border px-5 py-3 text-sm">
                    <div className="text-jpt-muted">
                        {total}件中 {from}-{to}件を表示
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-jpt-border text-jpt-muted hover:bg-gray-50 disabled:opacity-50"
                            disabled={currentPage <= 1}
                            onClick={() => changePage(currentPage - 1)}
                        >
                            ‹
                        </button>
                        <button
                            type="button"
                            className="h-8 min-w-8 rounded-md bg-jpt-dark px-2 text-xs font-semibold text-white"
                        >
                            {currentPage}
                        </button>
                        <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-md border border-jpt-border text-jpt-muted hover:bg-gray-50 disabled:opacity-50"
                            disabled={currentPage >= lastPage}
                            onClick={() => changePage(currentPage + 1)}
                        >
                            ›
                        </button>
                    </div>
                </div>
            </section>


            {tab === 'approval' && (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-jpt-muted">
                    <StatusPill status="draft" />
                    <StatusPill status="pending_dept" />
                    <StatusPill status="pending_hq" />
                    <StatusPill status="approved" />
                    <StatusPill status="rejected" />
                    <span className="ml-auto">※ 承認済み案件は「開発タブ」で確認できます</span>
                </div>
            )}
            {tab === 'dev' && (
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-jpt-muted">
                    <span className="flex items-center gap-1.5">
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                            未着手
                        </span>
                        <span>進捗 0%</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            進行中
                        </span>
                        <span>進捗 1-89%</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-semibold text-[#5B21B6]">
                            完了間近
                        </span>
                        <span>進捗 90% 以上</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                            完了
                        </span>
                        <span>進捗 100%</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="font-semibold text-jpt-red">05/01</span>
                        <span>= 期限まで2週間以内</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="font-medium text-[#C2410C]">05/15</span>
                        <span>= 期限まで1ヶ月以内</span>
                    </span>
                    <span className="ml-auto">行クリックで詳細へ</span>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
