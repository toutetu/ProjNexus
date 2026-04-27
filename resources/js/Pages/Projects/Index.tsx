import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    FileCheck2,
    FileText,
    FolderSearch,
    GitBranch,
    Inbox,
    Plus,
    Search,
    Wallet,
} from 'lucide-react';

import ApprovalStepperMini from '@/Components/Approval/ApprovalStepperMini';
import EmptyState from '@/Components/EmptyState';
import StatusPill, { type ProjectStatus } from '@/Components/StatusPill';
import Tabs, { type TabItem } from '@/Components/Tabs';
import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { ActiveKey } from '@/Components/Layout/Sidebar';
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
    projects?: {
        data: ProjectListItem[];
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

const projectCode = (id: number): string => `PRJ-${String(id).padStart(4, '0')}`;

const taskProgress = (project: ProjectListItem): number => {
    const total = project.taskCount ?? 0;
    if (total === 0) return 0;
    return Math.round(((project.closedTaskCount ?? 0) / total) * 100);
};

const consumptionRate = (project: ProjectListItem): number => {
    const budget = toNumber(project.budgetAmount);
    if (budget <= 0) return 0;
    return Math.round((toNumber(project.actualAmount) / budget) * 1000) / 10;
};

const consumptionClass = (rate: number): string => {
    if (rate > 100) return 'bg-brand-red text-brand-red';
    if (rate >= 86) return 'bg-[#F59E0B] text-[#92400E]';
    if (rate >= 60) return 'bg-brand-blue text-brand-blue';
    return 'bg-[#16A34A] text-[#166534]';
};

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

const TAB_ITEMS: TabItem<ProjectTab>[] = [
    { value: 'approval', label: '申請', icon: FileText, count: 8 },
    { value: 'dev', label: '開発', icon: GitBranch, count: 10 },
    { value: 'budget', label: '予算', icon: Wallet, count: 10 },
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
        owner: '高橋 朋子',
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
    projects,
}: Props) {
    const { flash } = usePage<PageProps>().props;
    const isPendingFilter = filter === 'pending';

    const activeKey: ActiveKey =
        isPendingFilter ? 'pending' : TAB_ACTIVE_KEY[tab];
    const visibleTabItems = isPendingFilter
        ? TAB_ITEMS.filter((item) => item.value === 'approval')
        : TAB_ITEMS;
    const projectRows = projects?.data ?? [];
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
    const titleCount = tab === 'approval' ? approvalRows.length : projectRows.length;

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

    const approvalRowHref = (row: ApprovalProjectRow): string =>
        row.status === 'draft'
            ? route('projects.edit', row.id)
            : route('projects.show', row.id);

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
                { label: '案件一覧', icon: FolderSearch },
            ]}
        >
            <Head title="案件一覧" />

            {flash?.error && (
                <div
                    role="alert"
                    className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                >
                    {flash.error}
                </div>
            )}

            <div className="mb-5 flex items-start justify-between">
                <div>
                    <h1 className="flex items-center text-2xl font-bold tracking-tight text-brand-dark">
                        <span className="mr-2.5 inline-block h-6 w-1 rounded-sm bg-brand-accent" />
                        案件一覧
                    </h1>
                    <p className="mt-1 text-sm text-brand-muted">
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
                <Button
                    size="default"
                    className="flex items-center gap-2"
                    onClick={() => router.visit(route('projects.create'))}
                >
                    <Plus className="h-4 w-4" />
                    新規申請
                </Button>
            </div>

            <section className="overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm">
                <div className="border-b border-brand-border px-5">
                    <Tabs value={tab} onChange={handleTabChange} items={visibleTabItems} />
                </div>
                {tab === 'approval' && (
                    <div className="border-b border-brand-border px-5 py-3">
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
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                                <input
                                    name="q"
                                    defaultValue={q ?? ''}
                                    placeholder="案件名・申請者で検索"
                                    className="w-full rounded-md border border-brand-border bg-white py-2 pl-9 pr-3 text-sm text-brand-dark placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                                />
                            </div>
                            <select
                                name="status"
                                defaultValue={status ?? ''}
                                className="min-w-[170px] rounded-md border border-brand-border bg-white px-3 py-2 pr-9 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
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
                                className="min-w-[150px] rounded-md border border-brand-border bg-white px-3 py-2 pr-9 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
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
                            {(q || status || department) && (
                                <button
                                    type="button"
                                    className="ml-auto text-sm text-brand-blue hover:underline"
                                    onClick={() =>
                                        submitApprovalFilters({
                                            keyword: '',
                                            nextStatus: '',
                                            nextDepartment: '',
                                        })
                                    }
                                >
                                    クリア
                                </button>
                            )}
                        </form>
                    </div>
                )}
                {tab === 'dev' && (
                    <div className="border-b border-brand-border px-5 py-3">
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
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                                <input
                                    name="q"
                                    defaultValue={q ?? ''}
                                    placeholder="案件名・主担当で検索"
                                    className="w-full rounded-md border border-brand-border bg-white py-2 pl-9 pr-3 text-sm text-brand-dark placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                                />
                            </div>
                            <select
                                name="department"
                                defaultValue={department ? String(department) : ''}
                                className="min-w-[150px] rounded-md border border-brand-border bg-white px-3 py-2 pr-9 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                            >
                                <option value="">部門：すべて</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="assignee"
                                defaultValue={assignee ? String(assignee) : ''}
                                className="min-w-[160px] rounded-md border border-brand-border bg-white px-3 py-2 pr-9 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                            >
                                <option value="">主担当：すべて</option>
                                {assignees.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="progress"
                                defaultValue={progress ?? ''}
                                className="min-w-[160px] rounded-md border border-brand-border bg-white px-3 py-2 pr-9 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                            >
                                <option value="">進捗：すべて</option>
                                <option value="not_started">未着手</option>
                                <option value="in_progress">進行中</option>
                                <option value="completing">完了間近</option>
                                <option value="completed">完了</option>
                            </select>
                            <Button type="submit" variant="secondary" size="sm">
                                検索
                            </Button>
                            {(q || department || assignee || progress) && (
                                <button
                                    type="button"
                                    className="ml-auto text-sm text-brand-blue hover:underline"
                                    onClick={() =>
                                        submitProjectFilters({
                                            nextTab: 'dev',
                                            keyword: '',
                                            nextDepartment: '',
                                            nextAssignee: '',
                                            nextProgress: '',
                                        })
                                    }
                                >
                                    クリア
                                </button>
                            )}
                        </form>
                    </div>
                )}
                {tab === 'budget' && (
                    <>
                        <div className="grid gap-3 border-b border-brand-border bg-brand-bg/40 px-5 py-4 md:grid-cols-4">
                            <div className="rounded-lg border border-brand-border bg-white p-3">
                                <p className="text-xs text-brand-muted">予算合計</p>
                                <p className="mt-1 font-mono text-lg font-bold">
                                    {formatCurrency(budgetSummary?.budgetTotal ?? 0)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-brand-border bg-white p-3">
                                <p className="text-xs text-brand-muted">実績合計</p>
                                <p className="mt-1 font-mono text-lg font-bold text-brand-blue">
                                    {formatCurrency(budgetSummary?.actualTotal ?? 0)}
                                </p>
                            </div>
                            <div className="rounded-lg border border-brand-border bg-white p-3">
                                <p className="text-xs text-brand-muted">平均消費率</p>
                                <p className="mt-1 font-mono text-lg font-bold">
                                    {(budgetSummary?.averageConsumptionRate ?? 0).toFixed(1)}%
                                </p>
                            </div>
                            <div className="rounded-lg border border-brand-border bg-white p-3">
                                <p className="text-xs text-brand-muted">要注意案件</p>
                                <p className="mt-1 font-mono text-lg font-bold text-[#92400E]">
                                    {budgetSummary?.warningCount ?? 0}件
                                </p>
                            </div>
                        </div>
                        <div className="border-b border-brand-border px-5 py-3">
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
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
                                    <input
                                        name="q"
                                        defaultValue={q ?? ''}
                                        placeholder="案件名で検索"
                                        className="w-full rounded-md border border-brand-border bg-white py-2 pl-9 pr-3 text-sm text-brand-dark placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                                    />
                                </div>
                                <select
                                    name="department"
                                    defaultValue={department ? String(department) : ''}
                                    className="min-w-[150px] rounded-md border border-brand-border bg-white px-3 py-2 pr-9 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
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
                                    className="min-w-[170px] rounded-md border border-brand-border bg-white px-3 py-2 pr-9 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
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
                                {(q || department || consumption) && (
                                    <button
                                        type="button"
                                        className="ml-auto text-sm text-brand-blue hover:underline"
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
                                    </button>
                                )}
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
                            <thead className="bg-brand-bg text-xs uppercase tracking-wider text-brand-muted">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold">タイトル</th>
                                    <th className="px-4 py-3 text-left font-semibold">ステータス</th>
                                    <th className="px-4 py-3 text-left font-semibold">承認ステップ</th>
                                    <th className="px-4 py-3 text-left font-semibold">申請日</th>
                                    <th className="px-4 py-3 text-left font-semibold">部門</th>
                                    <th className="px-4 py-3 text-left font-semibold">最終更新</th>
                                    <th className="px-4 py-3 text-left font-semibold" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {approvalRows.map((row, index) => (
                                    <tr
                                        key={row.id}
                                        className={cn(
                                            'cursor-pointer hover:bg-slate-50',
                                            index === 0 && 'bg-white',
                                        )}
                                        onClick={() => router.visit(approvalRowHref(row))}
                                    >
                                        <td className="px-5 py-3.5 font-medium text-brand-dark">
                                            <Link
                                                href={approvalRowHref(row)}
                                                className="hover:text-brand-blue hover:underline"
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
                                        <td className="px-4 py-3.5 text-brand-muted">
                                            {row.appliedAt}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {row.department}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-muted">
                                            {row.updatedAt}
                                        </td>
                                        <td className="px-4 py-3.5 text-right text-brand-muted">
                                            <ChevronRight className="ml-auto h-4 w-4" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : null}

                    {tab === 'dev' && (
                        <table className="min-w-full text-sm">
                            <thead className="bg-brand-bg text-xs uppercase tracking-wider text-brand-muted">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold">タイトル</th>
                                    <th className="px-4 py-3 text-left font-semibold">部門</th>
                                    <th className="px-4 py-3 text-left font-semibold">主担当</th>
                                    <th className="px-4 py-3 text-left font-semibold">タスク進捗</th>
                                    <th className="px-4 py-3 text-left font-semibold">期限</th>
                                    <th className="px-4 py-3 text-left font-semibold">最終更新</th>
                                    <th className="px-4 py-3 text-left font-semibold" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {projectRows.map((row) => {
                                    const progressRate = taskProgress(row);
                                    const total = row.taskCount ?? 0;

                                    return (
                                    <tr
                                        key={row.id}
                                        className="cursor-pointer hover:bg-slate-50"
                                        onClick={() => router.visit(route('projects.show', row.id))}
                                    >
                                        <td className="px-5 py-3.5 font-medium text-brand-dark">
                                            <Link
                                                href={route('projects.show', row.id)}
                                                className="hover:text-brand-blue hover:underline"
                                            >
                                                {row.title}
                                            </Link>
                                            <div className="mt-0.5 flex items-center gap-2 text-xs font-normal text-brand-muted">
                                                <span className="font-mono">{projectCode(row.id)}</span>
                                                {progressRate >= 90 && total > 0 && progressRate < 100 && (
                                                    <span className="rounded-full bg-[#EDE9FE] px-2 py-0.5 text-[10px] font-semibold text-[#5B21B6]">
                                                        完了間近
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {row.department}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {row.primaryAssignee ?? '未設定'}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 min-w-32 flex-1 overflow-hidden rounded-full bg-[#E9ECEF]">
                                                    <div
                                                        className={cn(
                                                            'h-full rounded-full',
                                                            progressRate >= 95 ? 'bg-[#16A34A]' : 'bg-brand-blue',
                                                        )}
                                                        style={{ width: `${progressRate}%` }}
                                                    />
                                                </div>
                                                <span className="w-11 text-right font-mono text-xs font-semibold">
                                                    {progressRate}%
                                                </span>
                                            </div>
                                            <div className="mt-1 text-[10px] text-brand-muted">
                                                {total}件中 {row.closedTaskCount ?? 0}件完了 / 進行中{' '}
                                                {row.inProgressTaskCount ?? 0} / 未着手 {row.openTaskCount ?? 0}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {formatDate(row.nearestTaskDueDate)}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-muted">
                                            {formatDate(row.updatedAt)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right text-brand-muted">
                                            <ChevronRight className="ml-auto h-4 w-4" />
                                        </td>
                                    </tr>
                                );
                                })}
                            </tbody>
                        </table>
                    )}

                    {tab === 'budget' && (
                        <table className="min-w-full text-sm">
                            <thead className="bg-brand-bg text-xs uppercase tracking-wider text-brand-muted">
                                <tr>
                                    <th className="px-5 py-3 text-left font-semibold">タイトル</th>
                                    <th className="px-4 py-3 text-left font-semibold">部門</th>
                                    <th className="px-4 py-3 text-left font-semibold">予算額</th>
                                    <th className="px-4 py-3 text-left font-semibold">実績額</th>
                                    <th className="px-4 py-3 text-left font-semibold">消費率</th>
                                    <th className="px-4 py-3 text-left font-semibold">更新日</th>
                                    <th className="px-4 py-3 text-left font-semibold" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {projectRows.map((row) => {
                                    const rate = consumptionRate(row);
                                    const rateClass = consumptionClass(rate);
                                    const remaining = toNumber(row.budgetAmount) - toNumber(row.actualAmount);

                                    return (
                                    <tr
                                        key={row.id}
                                        className="cursor-pointer hover:bg-slate-50"
                                        onClick={() => router.visit(route('projects.show', row.id))}
                                    >
                                        <td className="px-5 py-3.5 font-medium text-brand-dark">
                                            <Link
                                                href={route('projects.show', row.id)}
                                                className="hover:text-brand-blue hover:underline"
                                            >
                                                {row.title}
                                            </Link>
                                            <div className="mt-0.5 flex items-center gap-2 text-xs font-normal text-brand-muted">
                                                <span className="font-mono">{projectCode(row.id)}</span>
                                                <span>{row.department ?? '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {row.department}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-mono text-brand-dark">
                                            {formatCurrency(row.budgetAmount)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right font-mono text-brand-dark">
                                            {formatCurrency(row.actualAmount)}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
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
                                            <div className={cn('mt-1 text-[10px]', remaining < 0 ? 'text-brand-red' : 'text-brand-muted')}>
                                                残 {formatCurrency(remaining)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-muted">
                                            {formatDate(row.updatedAt)}
                                        </td>
                                        <td className="px-4 py-3.5 text-right text-brand-muted">
                                            <ChevronRight className="ml-auto h-4 w-4" />
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {tab === 'approval' && (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-brand-muted">
                    <StatusPill status="draft" />
                    <StatusPill status="pending_dept" />
                    <StatusPill status="pending_hq" />
                    <StatusPill status="approved" />
                    <StatusPill status="rejected" />
                    <span className="ml-auto">※ 承認済み案件は「開発タブ」で確認できます</span>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
