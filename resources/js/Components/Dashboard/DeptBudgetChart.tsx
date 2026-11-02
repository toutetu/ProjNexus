import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { BUDGET_COLORS, formatManYen } from './budgetChartStyle';

interface DepartmentBudgetItem {
    name: string;
    budget: number;
    actual: number;
}

interface DeptBudgetChartProps {
    data: DepartmentBudgetItem[];
}

export default function DeptBudgetChart({ data }: DeptBudgetChartProps) {
    return (
        <div className="rounded-lg border border-brand-border bg-white p-5 shadow-sm">
            <div className="mb-3">
                <h2 className="text-lg font-semibold text-brand-dark">部門別 予算と実績</h2>
                <p className="mt-0.5 text-xs text-brand-muted">承認済み案件の合計（万円）</p>
            </div>
            <div className="mb-2 flex flex-wrap gap-3 text-xs text-brand-muted">
                <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: BUDGET_COLORS.budget }} />
                    予算
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: BUDGET_COLORS.actual }} />
                    実績
                </span>
                <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: BUDGET_COLORS.over }} />
                    予算超過
                </span>
            </div>
            <div className="h-[236px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid stroke="#DEE2E6" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" interval={0} tick={{ fill: '#6C757D', fontSize: 11 }} />
                        <YAxis
                            width={40}
                            tickFormatter={(value: number) => formatManYen(value)}
                            tick={{ fill: '#6C757D', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#F8F9FA' }}
                            content={({ active, payload, label }) => {
                                if (!active || !payload || payload.length === 0) return null;
                                const item = payload[0]?.payload as DepartmentBudgetItem | undefined;
                                if (!item) return null;
                                const rate = item.budget > 0 ? (item.actual / item.budget) * 100 : 0;
                                return (
                                    <div className="rounded border border-brand-border bg-white px-3 py-2 text-sm shadow-sm">
                                        <p className="font-semibold text-brand-dark">{label}</p>
                                        <p className="mt-1">予算: {formatManYen(item.budget)}万円</p>
                                        <p>実績: {formatManYen(item.actual)}万円</p>
                                        <p className={rate > 100 ? 'text-brand-red' : 'text-brand-muted'}>
                                            消化率: {rate.toFixed(1)}%{rate > 100 ? '（予算超過）' : ''}
                                        </p>
                                    </div>
                                );
                            }}
                        />
                        <Bar dataKey="budget" fill={BUDGET_COLORS.budget} radius={[4, 4, 0, 0]} maxBarSize={24} />
                        <Bar dataKey="actual" radius={[4, 4, 0, 0]} maxBarSize={24}>
                            {data.map((item) => (
                                <Cell
                                    key={item.name}
                                    fill={item.actual > item.budget ? BUDGET_COLORS.over : BUDGET_COLORS.actual}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
