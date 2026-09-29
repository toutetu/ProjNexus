import {
    Area,
    ComposedChart,
    Line,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface BudgetTrendPoint {
    month: string;
    rate: number;
    amount: number;
}

interface BudgetTrendChartProps {
    data: BudgetTrendPoint[];
}

export default function BudgetTrendChart({ data }: BudgetTrendChartProps) {
    const formatYen = (value: number): string => `¥${Math.round(value).toLocaleString('ja-JP')}`;

    return (
        <div className="relative rounded-lg border border-jpt-border bg-white p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-jpt-dark">月次 予算消費推移</h2>
                <p className="mt-0.5 text-xs text-jpt-muted">70%ラインで警告</p>
            </div>
            <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data}>
                        <XAxis dataKey="month" tick={{ fill: '#6C757D', fontSize: 12 }} />
                        <YAxis
                            domain={[0, 100]}
                            tickFormatter={(value: number) => `${value}%`}
                            tick={{ fill: '#6C757D', fontSize: 12 }}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (!active || !payload || payload.length === 0) return null;
                                const point = payload[0]?.payload as BudgetTrendPoint | undefined;
                                if (!point) return null;
                                return (
                                    <div className="rounded border border-jpt-border bg-white px-3 py-2 text-sm shadow-sm">
                                        <p className="font-semibold text-jpt-dark">{label}</p>
                                        <p className="mt-1 text-jpt-red">消費率: {point.rate.toFixed(1)}%</p>
                                        <p className="text-jpt-red">消費額: {formatYen(point.amount)}</p>
                                    </div>
                                );
                            }}
                        />
                        <ReferenceLine
                            y={70}
                            stroke="#E60013"
                            strokeDasharray="5 5"
                            label={{ value: '警告ライン 70%', fill: '#E60013', fontSize: 11 }}
                        />
                        <Area dataKey="rate" fill="#E60013" fillOpacity={0.08} stroke="none" />
                        <Line
                            type="monotone"
                            dataKey="rate"
                            stroke="#E60013"
                            strokeWidth={3}
                            dot={{ r: 4, fill: '#E60013' }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
