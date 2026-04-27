import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ChevronRight,
    FileCheck2,
    FileText,
    FolderSearch,
    GitBranch,
    Inbox,
    Plus,
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
    projects?: {
        data: ProjectListItem[];
    };
}

interface ProjectListItem {
    id: number;
    title: string;
    department: string | null;
    status: ProjectStatus;
    submittedAt: string | null;
    updatedAt: string;
    canEdit?: boolean;
    rejectedAt?: 'dept' | 'hq' | null;
    applicantSubmitsToHqDirect?: boolean;
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

export default function ProjectsIndex({ tab, filter, projects }: Props) {
    const { flash } = usePage<PageProps>().props;

    const activeKey: ActiveKey =
        filter === 'pending' ? 'pending' : TAB_ACTIVE_KEY[tab];
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
    const titleCount =
        tab === 'approval'
            ? approvalRows.length
            : tab === 'dev'
              ? DEV_ROWS.length
              : BUDGET_ROWS.length;

    const handleTabChange = (nextTab: ProjectTab) => {
        if (nextTab === tab) return;
        router.visit(route('projects.index'), {
            data: {
                tab: nextTab,
                ...(filter ? { filter } : {}),
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
                { label: '申請・承認', icon: FileCheck2 },
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
                    <Tabs value={tab} onChange={handleTabChange} items={TAB_ITEMS} />
                </div>
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {DEV_ROWS.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="px-5 py-3.5 font-medium text-brand-dark">
                                            {row.title}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {row.department}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {row.owner}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {row.progress}%
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {row.dueDate}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-muted">
                                            {row.updatedAt}
                                        </td>
                                    </tr>
                                ))}
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border">
                                {BUDGET_ROWS.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="px-5 py-3.5 font-medium text-brand-dark">
                                            {row.title}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {row.department}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {row.budgetAmount}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {row.actualAmount}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-dark">
                                            {row.consumptionRate}
                                        </td>
                                        <td className="px-4 py-3.5 text-brand-muted">
                                            {row.updatedAt}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

        </AuthenticatedLayout>
    );
}
