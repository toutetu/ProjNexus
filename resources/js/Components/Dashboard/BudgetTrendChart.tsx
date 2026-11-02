import type { ReactElement } from 'react';
import {
    Area,
    CartesianGrid,
    ComposedChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { BUDGET_COLORS, formatManYen } from './budgetChartStyle';

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
    point: BudgetTrendPoint | null;
    budgetSolid: number | null;
    budgetDashed: number | null;
    actualSolid: number | null;
    actualDashed: number | null;
    over: [number, number] | null;
}

const Y_DOMAIN: [number, number] = [200, 650];
const Y_TICKS = [200, 300, 400, 500, 600];

const toMan = (yen: number): number => yen / 10000;

// 横軸は幅が狭いので「2026/04」を「4月」と表示する（ツールチップでは年月をそのまま出す）
const formatMonthLabel = (month: string | undefined): string =>
    month ? `${Number(month.split('/')[1])}月` : '';

// 最後の1か月（集計中）だけ点線にするため、実線と点線を別の系列に分ける。
// 予算超過の塗りが線の交点から始まるよう、予算と実績が交差する位置に点を足す。
function buildRows(data: BudgetTrendPoint[]): ChartRow[] {
    const dashedFrom = data.length - 2;
    const toRow = (x: number, budget: number, actual: number, point: BudgetTrendPoint | null): ChartRow => ({
        x,
        point,
        budgetSolid: x <= dashedFrom ? budget : null,
        budgetDashed: x >= dashedFrom ? budget : null,
        actualSolid: x <= dashedFrom ? actual : null,
        actualDashed: x >= dashedFrom ? actual : null,
        over: actual >= budget ? [budget, actual] : null,
    });

    const rows: ChartRow[] = [];
    data.forEach((point, index) => {
        const budget = toMan(point.budget);
        const actual = toMan(point.actual);
        rows.push(toRow(index, budget, actual, point));

        const next = data[index + 1];
        if (!next) return;
        const diff = actual - budget;
        const nextDiff = toMan(next.actual) - toMan(next.budget);
        if (diff * nextDiff >= 0) return;
        const t = diff / (diff - nextDiff);
        const crossValue = budget + t * (toMan(next.budget) - budget);
        rows.push(toRow(index + t, crossValue, crossValue, null));
    });
    return rows;
}

export default function BudgetTrendChart({ data }: BudgetTrendChartProps) {
    const rows = buildRows(data);
    const lastIndex = data.length - 1;

    const renderActualDot =
        (dashed: boolean) =>
        (props: { cx?: number; cy?: number; payload?: ChartRow }): ReactElement => {
            const { cx, cy, payload } = props;
            const key = `${dashed ? 'dashed' : 'solid'}-${payload?.x}`;
            const visible = payload?.point && (dashed ? payload.x === lastIndex : payload.x < lastIndex);
            if (!visible || cx == null || cy == null) return <g key={key} />;
            return (
                <circle
                    key={key}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="#FFFFFF"
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
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: BUDGET_COLORS.over }} />
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
                                const rate = point.budget > 0 ? (point.actual / point.budget) * 100 : 0;
                                return (
                                    <div className="rounded border border-brand-border bg-white px-3 py-2 text-sm shadow-sm">
                                        <p className="font-semibold text-brand-dark">{point.month}</p>
                                        <p className="mt-1">予算: {formatManYen(point.budget)}万円</p>
                                        <p>実績: {formatManYen(point.actual)}万円</p>
                                        <p className={rate > 100 ? 'text-brand-red' : 'text-brand-muted'}>
                                            消化率: {rate.toFixed(1)}%{rate > 100 ? '（予算超過）' : ''}
                                        </p>
                                    </div>
                                );
                            }}
                        />
                        <Area
                            dataKey="over"
                            fill={BUDGET_COLORS.over}
                            fillOpacity={0.85}
                            stroke="none"
                            activeDot={false}
                            isAnimationActive={false}
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
