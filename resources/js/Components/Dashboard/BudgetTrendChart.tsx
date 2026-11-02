import type { ReactElement } from 'react';
import {
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import BudgetTooltipContent from './BudgetTooltipContent';
import { BUDGET_COLORS } from './budgetChartStyle';

interface BudgetTrendPoint {
    month: string;
    budget: number;
    actual: number;
}

interface BudgetTrendChartProps {
    data: BudgetTrendPoint[];
}

interface ChartRow {
    x: number;
    point: BudgetTrendPoint;
    budgetSolid: number | null;
    budgetDashed: number | null;
    actualSolid: number | null;
    actualDashed: number | null;
}

const Y_DOMAIN: [number, number] = [200, 650];
const Y_TICKS = [200, 300, 400, 500, 600];

const toMan = (yen: number): number => yen / 10000;

// 横軸は幅が狭いので「2026/04」を「4月」と表示する（ツールチップでは年月をそのまま出す）
const formatMonthLabel = (month: string | undefined): string =>
    month ? `${Number(month.split('/')[1])}月` : '';

// 最後の1か月（集計中）だけ点線にするため、実線と点線を別の系列に分ける
function buildRows(data: BudgetTrendPoint[]): ChartRow[] {
    const dashedFrom = data.length - 2;
    return data.map((point, x) => {
        const budget = toMan(point.budget);
        const actual = toMan(point.actual);
        return {
            x,
            point,
            budgetSolid: x <= dashedFrom ? budget : null,
            budgetDashed: x >= dashedFrom ? budget : null,
            actualSolid: x <= dashedFrom ? actual : null,
            actualDashed: x >= dashedFrom ? actual : null,
        };
    });
}

export default function BudgetTrendChart({ data }: BudgetTrendChartProps) {
    const rows = buildRows(data);
    const lastIndex = data.length - 1;

    const renderActualDot =
        (dashed: boolean) =>
        (props: { cx?: number; cy?: number; payload?: ChartRow }): ReactElement => {
            const { cx, cy, payload } = props;
            const key = `${dashed ? 'dashed' : 'solid'}-${payload?.x}`;
            const visible = payload && (dashed ? payload.x === lastIndex : payload.x < lastIndex);
            if (!visible || !payload || cx == null || cy == null) return <g key={key} />;
            return (
                <circle
                    key={key}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={payload.point.actual > payload.point.budget ? BUDGET_COLORS.actualDot : '#FFFFFF'}
                    stroke={BUDGET_COLORS.actualDot}
                    strokeWidth={1.5}
                />
            );
        };

    return (
        <div className="relative rounded-lg border border-brand-border bg-white p-5 shadow-sm">
            <div className="mb-3">
                <h2 className="text-lg font-semibold text-brand-dark">月次 予算と実績</h2>
                <p className="mt-0.5 text-xs text-brand-muted">点線は今月（集計中）（万円）</p>
            </div>
            <div className="mb-2 flex flex-wrap gap-3 text-xs text-brand-muted">
                <span className="flex items-center gap-1">
                    <svg width="22" height="10" aria-hidden="true">
                        <line x1="0" y1="5" x2="22" y2="5" stroke={BUDGET_COLORS.budget} strokeWidth="2.5" />
                    </svg>
                    予算
                </span>
                <span className="flex items-center gap-1">
                    <svg width="22" height="10" aria-hidden="true">
                        <line x1="0" y1="5" x2="22" y2="5" stroke={BUDGET_COLORS.actual} strokeWidth="2.5" />
                        <circle
                            cx="11"
                            cy="5"
                            r="3.5"
                            fill="#FFFFFF"
                            stroke={BUDGET_COLORS.actualDot}
                            strokeWidth="1.5"
                        />
                    </svg>
                    実績
                </span>
                <span className="flex items-center gap-1">
                    <svg width="10" height="10" aria-hidden="true">
                        <circle cx="5" cy="5" r="4" fill={BUDGET_COLORS.actualDot} />
                    </svg>
                    予算超過
                </span>
            </div>
            <div className="h-[236px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={rows}>
                        <CartesianGrid stroke="#DEE2E6" vertical={false} />
                        <XAxis
                            dataKey="x"
                            type="number"
                            domain={[0, lastIndex]}
                            ticks={data.map((_, index) => index)}
                            tickFormatter={(value: number) => formatMonthLabel(data[value]?.month)}
                            interval={0}
                            padding={{ left: 12, right: 12 }}
                            tick={{ fill: '#6C757D', fontSize: 11 }}
                        />
                        <YAxis
                            width={36}
                            domain={Y_DOMAIN}
                            ticks={Y_TICKS}
                            tickFormatter={(value: number) => value.toLocaleString('ja-JP')}
                            tick={{ fill: '#6C757D', fontSize: 12 }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload || payload.length === 0) return null;
                                const point = (payload[0]?.payload as ChartRow | undefined)?.point;
                                if (!point) return null;
                                return <BudgetTooltipContent title={point.month} budget={point.budget} actual={point.actual} />;
                            }}
                        />
                        <Line
                            dataKey="budgetSolid"
                            stroke={BUDGET_COLORS.budget}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={false}
                            isAnimationActive={false}
                        />
                        <Line
                            dataKey="budgetDashed"
                            stroke={BUDGET_COLORS.budget}
                            strokeWidth={2.5}
                            strokeDasharray="5 4"
                            dot={false}
                            activeDot={false}
                            isAnimationActive={false}
                        />
                        <Line
                            dataKey="actualSolid"
                            stroke={BUDGET_COLORS.actual}
                            strokeWidth={2.5}
                            dot={renderActualDot(false)}
                            activeDot={false}
                            isAnimationActive={false}
                        />
                        <Line
                            dataKey="actualDashed"
                            stroke={BUDGET_COLORS.actual}
                            strokeWidth={2.5}
                            strokeDasharray="5 4"
                            dot={renderActualDot(true)}
                            activeDot={false}
                            isAnimationActive={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
