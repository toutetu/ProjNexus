import { Head } from '@inertiajs/react';
import { AlertTriangle, Clock3, FolderOpen, TrendingUp } from 'lucide-react';

import BudgetAlertTable from '@/Components/Dashboard/BudgetAlertTable';
import BudgetTrendChart from '@/Components/Dashboard/BudgetTrendChart';
import DeptProgressChart from '@/Components/Dashboard/DeptProgressChart';
import KpiCard from '@/Components/Dashboard/KpiCard';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface DashboardProps {
    kpi: {
        activeProjects: number;
        activeDelta: number;
        pendingApprovals: number;
        averageProgressRate: number;
        budgetConsumptionRate: number;
    };
    departmentProgress: Array<{
        name: string;
        rate: number;
        color: string;
    }>;
    budgetTrend: Array<{
        month: string;
        rate: number;
        amount: number;
    }>;
    budgetAlerts: Array<{
        id: number;
        title: string;
        department: string | null;
        budgetAmount: number;
        actualAmount: number;
        consumptionRate: number;
    }>;
    updatedAt: string;
}

export default function DashboardIndex({
    kpi,
    departmentProgress,
    budgetTrend,
    budgetAlerts,
    updatedAt,
}: DashboardProps) {
    return (
        <AuthenticatedLayout activeKey="dashboard">
            <Head title="ダッシュボード" />

            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-brand-dark">ダッシュボード</h1>
                    <p className="mt-1 text-sm text-brand-muted">全部門の状況</p>
                </div>
                <div className="text-xs text-brand-muted">最終更新: {updatedAt}</div>
            </div>

            <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
                <DeptProgressChart data={departmentProgress} />
                <BudgetTrendChart data={budgetTrend} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
                    <KpiCard
                        icon={FolderOpen}
                        label="進行中案件"
                        value={String(kpi.activeProjects)}
                        unit="件"
                        accent="cyan-blue"
                        badge={{ text: `+${kpi.activeDelta}`, tone: 'default' }}
                        footer="前週比"
                    />
                    <KpiCard
                        icon={Clock3}
                        label="承認待ち"
                        value={String(kpi.pendingApprovals)}
                        unit="件"
                        accent="yellow"
                        badge={{ text: '要対応', tone: 'warn' }}
                        footer="承認待ち一覧から対応可能"
                    />
                    <KpiCard
                        icon={TrendingUp}
                        label="平均進捗率"
                        value={kpi.averageProgressRate.toFixed(1)}
                        unit="%"
                        accent="blue-purple"
                        badge={{ text: '順調', tone: 'default' }}
                        progress={kpi.averageProgressRate}
                        footer={`目標まで残り ${(100 - kpi.averageProgressRate).toFixed(1)}%`}
                    />
                    <KpiCard
                        icon={AlertTriangle}
                        label="予算消費率"
                        value={kpi.budgetConsumptionRate.toFixed(1)}
                        unit="%"
                        accent="red"
                        badge={{
                            text: kpi.budgetConsumptionRate >= 70 ? '超過リスク' : '監視中',
                            tone: 'danger',
                        }}
                        progress={kpi.budgetConsumptionRate}
                        footer="警告ライン 70%"
                    />
                </div>
            </section>

            <BudgetAlertTable rows={budgetAlerts} />
        </AuthenticatedLayout>
    );
}
