import { Link } from '@inertiajs/react';

interface BudgetAlertRow {
    id: number;
    title: string;
    department: string | null;
    budgetAmount: number;
    actualAmount: number;
    consumptionRate: number;
}

interface BudgetAlertTableProps {
    rows: BudgetAlertRow[];
}

const formatCurrency = (value: number): string => `¥${Math.trunc(value).toLocaleString('ja-JP')}`;

const progressBandClass = (rate: number): string => {
    if (rate > 100) return 'bg-brand-red';
    if (rate >= 86) return 'bg-brand-accent';
    if (rate >= 61) return 'bg-brand-blue';
    return 'bg-green-600';
};

export default function BudgetAlertTable({ rows }: BudgetAlertTableProps) {
    return (
        <section className="rounded-lg border border-brand-border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-brand-dark">予算消費 70% 超の案件</h2>
                    <p className="mt-0.5 text-xs text-brand-muted">早期対応が必要な案件を抽出</p>
                </div>
                <Link
                    href="/projects?tab=budget&consumption=warn"
                    className="text-sm font-medium text-brand-blue hover:underline"
                >
                    全件を見る →
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-brand-border text-left text-xs uppercase tracking-wider text-brand-muted">
                            <th className="px-2 py-2 font-medium">案件名</th>
                            <th className="px-2 py-2 font-medium">部門</th>
                            <th className="px-2 py-2 text-right font-medium">予算</th>
                            <th className="px-2 py-2 text-right font-medium">実績</th>
                            <th className="w-48 px-2 py-2 font-medium">消費率</th>
                            <th className="px-2 py-2 text-right font-medium">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                        {rows.map((row) => (
                            <tr key={row.id} className="transition-colors hover:bg-brand-bg/60">
                                <td className="px-2 py-3 font-medium text-brand-dark">{row.title}</td>
                                <td className="px-2 py-3 text-brand-muted">
                                    {row.department ?? '未設定'}
                                </td>
                                <td className="px-2 py-3 text-right font-mono">
                                    {formatCurrency(row.budgetAmount)}
                                </td>
                                <td className="px-2 py-3 text-right font-mono">
                                    {formatCurrency(row.actualAmount)}
                                </td>
                                <td className="px-2 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-brand-border">
                                            <div
                                                className={progressBandClass(row.consumptionRate)}
                                                style={{
                                                    width: `${Math.max(
                                                        0,
                                                        Math.min(100, row.consumptionRate),
                                                    )}%`,
                                                    height: '100%',
                                                }}
                                            />
                                        </div>
                                        <span className="w-10 text-right font-mono text-xs font-semibold text-brand-dark">
                                            {row.consumptionRate.toFixed(0)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="px-2 py-3 text-right">
                                    <Link
                                        href={`/projects/${row.id}?detailTab=budget`}
                                        className="text-xs text-brand-blue hover:underline"
                                    >
                                        詳細 →
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-2 py-8 text-center text-sm text-brand-muted"
                                >
                                    70%超の案件はありません
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
