import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Coins, Wallet } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface BudgetInputProject {
    id: number;
    title: string;
    projectCode: string | null;
    department: string | null;
    primaryAssignee: string | null;
    budgetAmount: number | null;
    actualAmount: number | null;
}

interface Props {
    project: BudgetInputProject;
}

const formatCurrency = (value: number | null): string =>
    `¥${Math.trunc(value ?? 0).toLocaleString('ja-JP')}`;

const normalizeAmount = (value: string): number =>
    Number(value.replaceAll(',', '').replace(/[^\d]/g, '') || 0);

const consumptionRate = (actual: number, budget: number): number =>
    budget > 0 ? Math.round((actual / budget) * 1000) / 10 : 0;

export default function ProjectBudgetInput({ project }: Props) {
    const form = useForm({
        actual_amount: Math.trunc(project.actualAmount ?? 0),
        source: 'budget-input',
    });

    const budget = project.budgetAmount ?? 0;
    const currentActual = project.actualAmount ?? 0;
    const nextActual = Number(form.data.actual_amount || 0);
    const maxAmount = useMemo(() => Math.trunc(budget * 2), [budget]);

    const currentRate = consumptionRate(currentActual, budget);
    const nextRate = consumptionRate(nextActual, budget);
    const remaining = budget - nextActual;
    const projectCode = project.projectCode ?? `PRJ-${String(project.id).padStart(4, '0')}`;

    const submit = () => {
        form.put(route('projects.budget.update', project.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            activeKey="budget-input"
            breadcrumb={[
                { label: '予算管理', icon: Wallet },
                {
                    label: '予算状況一覧',
                    href: route('projects.index', { tab: 'budget' }),
                    icon: Wallet,
                },
                {
                    label: `案件詳細：${project.title}`,
                    href: route('projects.show', { project: project.id, detailTab: 'budget' }),
                },
                { label: '予算実績入力' },
            ]}
        >
            <Head title="予算実績入力" />
            <div className="mx-auto max-w-3xl space-y-5">
                <section className="rounded-lg border border-brand-border bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs text-brand-muted">{projectCode}</p>
                            <h1 className="mt-1 flex items-center gap-2 text-xl font-bold text-brand-dark">
                                <Coins className="h-5 w-5 text-brand-blue" />
                                予算実績入力
                            </h1>
                            <p className="mt-1 text-sm text-brand-muted">{project.title}</p>
                        </div>
                        <Button asChild type="button" variant="outline" size="sm">
                            <Link href={route('projects.show', { project: project.id, detailTab: 'budget' })}>
                                <ArrowLeft className="h-4 w-4" />
                                案件詳細へ戻る
                            </Link>
                        </Button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-md border border-brand-border bg-brand-bg px-3 py-2 text-sm">
                            <p className="text-xs text-brand-muted">担当部門</p>
                            <p className="mt-0.5 font-medium text-brand-dark">{project.department ?? '—'}</p>
                        </div>
                        <div className="rounded-md border border-brand-border bg-brand-bg px-3 py-2 text-sm">
                            <p className="text-xs text-brand-muted">主担当</p>
                            <p className="mt-0.5 font-medium text-brand-dark">{project.primaryAssignee ?? '未設定'}</p>
                        </div>
                    </div>
                </section>

                <section className="space-y-4 rounded-lg border border-brand-border bg-white p-5 shadow-sm">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <StatCard label="確定予算" value={formatCurrency(budget)} />
                        <StatCard label="現在実績" value={formatCurrency(currentActual)} />
                        <StatCard label="現在消費率" value={`${currentRate.toFixed(1)}%`} />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-semibold text-brand-dark">
                            実績額（円）
                        </label>
                        <input
                            value={Math.max(0, Number(form.data.actual_amount || 0)).toLocaleString('ja-JP')}
                            onChange={(event) =>
                                form.setData('actual_amount', normalizeAmount(event.target.value))
                            }
                            className="w-full rounded-md border border-brand-border px-3 py-2 text-right font-mono text-base font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                            inputMode="numeric"
                        />
                        <p className="mt-1 text-xs text-brand-muted">
                            0 以上、確定予算の2倍以下で入力してください。
                        </p>
                        {form.errors.actual_amount && (
                            <p className="mt-1 text-xs text-brand-red">{form.errors.actual_amount}</p>
                        )}
                    </div>

                    <div className="rounded-lg border border-brand-border bg-brand-bg px-4 py-3 text-sm">
                        <p className="font-semibold text-brand-dark">更新プレビュー</p>
                        <div className="mt-2 grid gap-2 sm:grid-cols-3">
                            <p>新 実績: <span className="font-mono">{formatCurrency(nextActual)}</span></p>
                            <p>新 残額: <span className="font-mono">{formatCurrency(remaining)}</span></p>
                            <p>新 消費率: <span className="font-mono">{nextRate.toFixed(1)}%</span></p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button asChild type="button" variant="secondary">
                            <Link href={route('projects.show', { project: project.id, detailTab: 'budget' })}>
                                キャンセル
                            </Link>
                        </Button>
                        <Button
                            type="button"
                            onClick={submit}
                            disabled={form.processing || nextActual < 0 || nextActual > maxAmount}
                        >
                            保存
                        </Button>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border border-brand-border bg-brand-bg px-3 py-2">
            <p className="text-xs text-brand-muted">{label}</p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-brand-dark">{value}</p>
        </div>
    );
}
