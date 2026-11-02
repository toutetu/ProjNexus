import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Rectangle,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import BudgetTooltipContent from './BudgetTooltipContent';
import { BUDGET_COLORS, formatManYen } from './budgetChartStyle';

interface DepartmentBudgetItem {
    name: string;
    budget: number;
    actual: number;
}

interface DeptBudgetChartProps {
    data: DepartmentBudgetItem[];
}

const BAR_GAP = 4;

interface ActualBarShapeProps {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    payload?: DepartmentBudgetItem;
}

// 予算の棒の頂点から実績の棒の上まで横線を引き、同じ部門の予算と実績の高さを比べやすくする。
// 実績の棒より前面に出すため、実績の棒の描画で線も描く（縦軸は 0 始まりなので高さの比で予算の位置を出す）
function ActualBarWithCap({ x = 0, y = 0, width = 0, height = 0, fill, payload }: ActualBarShapeProps) {
    const baseline = y + height;
    const budgetY =
        payload && payload.actual > 0 ? baseline - (height * payload.budget) / payload.actual : null;
    return (
        <g>
            <Rectangle x={x} y={y} width={width} height={height} radius={[4, 4, 0, 0]} fill={fill} />
            {budgetY !== null && (
                <line
                    x1={x - BAR_GAP - width}
                    y1={budgetY}
                    x2={x + width + 4}
                    y2={budgetY}
                    stroke={BUDGET_COLORS.capLine}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                />
            )}
        </g>
    );
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
                    <BarChart data={data} barGap={BAR_GAP}>
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
                                return <BudgetTooltipContent title={String(label)} budget={item.budget} actual={item.actual} />;
                            }}
                        />
                        <Bar dataKey="budget" fill={BUDGET_COLORS.budget} radius={[4, 4, 0, 0]} maxBarSize={24} />
                        <Bar
                            dataKey="actual"
                            maxBarSize={24}
                            shape={(props: ActualBarShapeProps) => <ActualBarWithCap {...props} />}
                        >
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
