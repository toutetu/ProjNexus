import { formatManYen } from './budgetChartStyle';

interface BudgetTooltipContentProps {
    title: string;
    budget: number;
    actual: number;
}

// 予算と実績のグラフで共通のマウスオーバー表示（予算・実績・差額・消化率）
export default function BudgetTooltipContent({ title, budget, actual }: BudgetTooltipContentProps) {
    const diff = actual - budget;
    const isOver = diff > 0;
    const rate = budget > 0 ? (actual / budget) * 100 : 0;
    const diffText = `${diff > 0 ? '+' : diff < 0 ? '−' : ''}${formatManYen(Math.abs(diff))}万円`;

    return (
        <div className="rounded border border-brand-border bg-white px-3 py-2 text-sm shadow-sm">
            <p className="font-semibold text-brand-dark">{title}</p>
            <p className="mt-1">予算: {formatManYen(budget)}万円</p>
            <p>実績: {formatManYen(actual)}万円</p>
            <p className={isOver ? 'text-brand-red' : 'text-brand-muted'}>
                差額: {diffText}
                {isOver ? '（超過）' : ''}
            </p>
            <p className={isOver ? 'text-brand-red' : 'text-brand-muted'}>消化率: {rate.toFixed(1)}%</p>
        </div>
    );
}
