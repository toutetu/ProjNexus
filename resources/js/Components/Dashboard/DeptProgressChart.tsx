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

interface DepartmentProgressItem {
    name: string;
    rate: number;
    color: string;
}

interface DeptProgressChartProps {
    data: DepartmentProgressItem[];
}

export default function DeptProgressChart({ data }: DeptProgressChartProps) {
    return (
        <div className="rounded-lg border border-brand-border bg-white p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-brand-dark">部門別 進捗状況</h2>
                <p className="mt-0.5 text-xs text-brand-muted">平均進捗率を部門別に表示</p>
            </div>
            <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid stroke="#DEE2E6" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#6C757D', fontSize: 12 }} />
                        <YAxis
                            domain={[0, 100]}
                            tickFormatter={(value: number) => `${value}%`}
                            tick={{ fill: '#6C757D', fontSize: 12 }}
                        />
                        <Tooltip
                            formatter={(value) => [
                                `${Number(value ?? 0).toFixed(1)}%`,
                                '進捗率',
                            ]}
                        />
                        <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={48}>
                            {data.map((item) => (
                                <Cell key={item.name} fill={item.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
