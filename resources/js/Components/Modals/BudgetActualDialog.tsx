import { router } from '@inertiajs/react';
import { Check, Coins } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { cn } from '@/lib/utils';

interface BudgetProject {
    id: number;
    title: string;
    primaryAssignee: string | null;
    budgetAmount: number | null;
    actualAmount: number | null;
}

interface BudgetActualDialogProps {
    open: boolean;
    onClose: () => void;
    project: BudgetProject;
}

const formatCurrency = (value: number): string =>
    `¥${Math.trunc(value).toLocaleString('ja-JP')}`;

const normalizeAmount = (value: string): number =>
    Number(value.replaceAll(',', '').replace(/[^\d]/g, '') || 0);

const consumptionRate = (actual: number, budget: number): number =>
    budget > 0 ? Math.round((actual / budget) * 1000) / 10 : 0;

const rateColor = (rate: number): string => {
    if (rate > 100) return 'bg-brand-red text-brand-red';
    if (rate >= 86) return 'bg-[#F59E0B] text-[#92400E]';
    if (rate >= 60) return 'bg-brand-blue text-brand-blue';
    return 'bg-[#16A34A] text-[#166534]';
};

export default function BudgetActualDialog({
    open,
    onClose,
    project,
}: BudgetActualDialogProps) {
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open) {
            setAmount(Math.trunc(project.actualAmount ?? 0).toLocaleString('ja-JP'));
            setProcessing(false);
        }
    }, [open, project.actualAmount]);

    const budget = project.budgetAmount ?? 0;
    const currentActual = project.actualAmount ?? 0;
    const nextActual = normalizeAmount(amount);
    const currentRate = consumptionRate(currentActual, budget);
    const nextRate = consumptionRate(nextActual, budget);
    const remaining = budget - nextActual;
    const currentClass = rateColor(currentRate);
    const nextClass = rateColor(nextRate);

    const maxAmount = useMemo(() => Math.trunc(budget * 2), [budget]);

    const submit = () => {
        setProcessing(true);
        router.put(
            route('projects.budget.update', project.id),
            { actual_amount: nextActual },
            {
                preserveScroll: true,
                onSuccess: onClose,
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogDescription>PRJ-{String(project.id).padStart(4, '0')} / {project.title}</DialogDescription>
                    <DialogTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5 text-brand-blue" />
                        予算実績入力
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
                        主担当: {project.primaryAssignee ?? '未設定'} が入力可能です
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
                            現状
                        </p>
                        <div className="grid gap-2 md:grid-cols-4">
                            <StatCard label="確定予算" value={formatCurrency(budget)} />
                            <StatCard
                                label="現在実績"
                                value={formatCurrency(currentActual)}
                                className="text-brand-blue"
                            />
                            <StatCard label="残額" value={formatCurrency(budget - currentActual)} />
                            <StatCard
                                label="消費率"
                                value={`${currentRate.toFixed(1)}%`}
                                className={currentClass.split(' ')[1]}
                            />
                        </div>
                        <ProgressBar rate={currentRate} className={currentClass.split(' ')[0]} />
                    </div>

                    <div className="border-t border-brand-border pt-5">
                        <label className="mb-1.5 block text-xs font-semibold text-brand-dark">
                            実績額（円） <span className="text-brand-red">*</span>
                        </label>
                        <input
                            value={amount}
                            onChange={(event) =>
                                setAmount(normalizeAmount(event.target.value).toLocaleString('ja-JP'))
                            }
                            className="w-full rounded-md border border-brand-border px-3 py-2 text-right font-mono text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                            inputMode="numeric"
                        />
                        <p className="mt-1 text-[10px] text-brand-muted">
                            0 以上、確定予算の2倍以下で入力してください。
                        </p>
                    </div>

                    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-muted">
                            更新プレビュー
                        </p>
                        <div className="grid gap-3 md:grid-cols-3">
                            <StatCard
                                label="新 実績"
                                value={formatCurrency(nextActual)}
                                className="text-brand-blue"
                            />
                            <StatCard
                                label="新 残額"
                                value={formatCurrency(remaining)}
                                className={remaining < 0 ? 'text-brand-red' : undefined}
                            />
                            <StatCard
                                label="消費率"
                                value={`${nextRate.toFixed(1)}%`}
                                className={nextClass.split(' ')[1]}
                            />
                        </div>
                        <div className="mt-4 space-y-2">
                            <RateRow label="Before" rate={currentRate} color={currentClass.split(' ')[0]} />
                            <RateRow label="After" rate={nextRate} color={nextClass.split(' ')[0]} strong />
                        </div>
                        <p className="mt-3 text-[11px] text-brand-muted">
                            86% 以上で注意、100% 超で超過として色分けします。
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={onClose}>
                        キャンセル
                    </Button>
                    <Button
                        type="button"
                        className="gap-1.5"
                        onClick={submit}
                        disabled={processing || nextActual < 0 || nextActual > maxAmount}
                    >
                        <Check className="h-4 w-4" />
                        保存
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function StatCard({
    label,
    value,
    className,
}: {
    label: string;
    value: string;
    className?: string;
}) {
    return (
        <div className="rounded-lg border border-brand-border bg-white p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-muted">{label}</p>
            <p className={cn('mt-1 font-mono text-base font-bold text-brand-dark', className)}>
                {value}
            </p>
        </div>
    );
}

function ProgressBar({ rate, className }: { rate: number; className: string }) {
    return (
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#E9ECEF]">
            <div className={cn('h-full rounded-full', className)} style={{ width: `${Math.min(rate, 100)}%` }} />
        </div>
    );
}

function RateRow({
    label,
    rate,
    color,
    strong = false,
}: {
    label: string;
    rate: number;
    color: string;
    strong?: boolean;
}) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-[10px] text-brand-muted">
                <span className={strong ? 'font-semibold text-brand-dark' : undefined}>{label}</span>
                <span className="font-mono">{rate.toFixed(1)}%</span>
            </div>
            <ProgressBar rate={rate} className={color} />
        </div>
    );
}
