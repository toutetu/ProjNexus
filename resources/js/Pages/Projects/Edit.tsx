import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    Check,
    ChevronRight,
    FileCheck2,
    FilePenLine,
    Info,
    Save,
    Send,
} from 'lucide-react';

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, RoleName } from '@/types';

interface ProjectEditData {
    id: number;
    title: string;
    departmentId: number;
    purpose: string | null;
    description: string | null;
    estimatedAmount: number | null;
    estimatedDays: number | null;
}

interface Props {
    departments: Array<{
        id: number;
        name: string;
    }>;
    project: ProjectEditData;
}

interface EditProjectForm {
    title: string;
    department_id: string;
    purpose: string;
    description: string;
    estimated_amount: string;
    estimated_days: string;
    submit_action: 'draft' | 'submit';
}

const toIntegerAmountString = (value: string): string =>
    value
        .replace(/,/g, '')
        .split('.')[0]
        .replace(/\D/g, '');

const formatAmountForDisplay = (value: string): string => {
    const integerValue = toIntegerAmountString(value);
    return integerValue === '' ? '' : integerValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function ProjectsEdit({ departments, project }: Props) {
    const { auth } = usePage<PageProps>().props;
    const roles = auth.user.roles ?? [];
    const submitsToHqDirect = roles.includes('dept_manager' as RoleName);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { data, setData, processing, errors } = useForm<EditProjectForm>({
        title: project.title ?? '',
        department_id: String(project.departmentId ?? ''),
        purpose: project.purpose ?? '',
        description: project.description ?? '',
        estimated_amount:
            project.estimatedAmount !== null
                ? String(Math.trunc(project.estimatedAmount))
                : '',
        estimated_days:
            project.estimatedDays !== null
                ? String(Math.trunc(project.estimatedDays))
                : '',
        submit_action: 'draft',
    });

    const submitWithAction = (action: 'draft' | 'submit') => {
        router.put(
            route('projects.update', project.id),
            { ...data, submit_action: action },
            { preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            activeKey="projects-approval"
            breadcrumb={[
                { label: '申請・承認', icon: FileCheck2 },
                { label: '案件一覧', href: route('projects.index', { tab: 'approval' }) },
                { label: '案件編集', icon: FilePenLine },
            ]}
        >
            <Head title="案件編集" />

            <div className="mx-auto max-w-3xl space-y-6">
                <section className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
                            案件編集
                        </h1>
                        <p className="mt-1 text-sm text-brand-muted">
                            新規申請と同じ入力項目で内容を更新し、そのまま申請できます
                        </p>
                    </div>
                    <Link
                        href={route('projects.index', { tab: 'approval' })}
                        className="flex items-center gap-1 pt-1 text-sm text-brand-muted hover:text-brand-dark"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        一覧に戻る
                    </Link>
                </section>

                <section className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-[#106EBE33] bg-[linear-gradient(135deg,rgba(1,207,255,0.08),rgba(109,40,217,0.06))] px-5 py-4">
                    <div className="flex items-center gap-2 text-xs">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-dark text-[11px] font-semibold text-white">
                            1
                        </span>
                        <span className="font-semibold">あなたが編集・申請</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-brand-muted" />
                    {!submitsToHqDirect && (
                        <>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#01CFFF] text-[11px] font-semibold text-[#062A40]">
                                    2
                                </span>
                                <span>部門管理者が承認</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-brand-muted" />
                        </>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-[11px] font-semibold text-white">
                            {submitsToHqDirect ? '2' : '3'}
                        </span>
                        <span>本部管理者が承認</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-brand-muted" />
                    <div className="flex items-center gap-2 text-xs">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-green-600 bg-green-100 text-green-700">
                            <Check className="h-3 w-3" />
                        </span>
                        <span>承認・開発フェーズへ</span>
                    </div>
                </section>

                <form
                    onSubmit={(event) => event.preventDefault()}
                    className="rounded-lg border border-brand-border bg-white shadow-sm"
                >
                    <div className="border-b border-brand-border px-6 py-5">
                        <h2 className="flex items-center gap-2 text-base font-semibold">
                            <FilePenLine className="h-4 w-4 text-brand-blue" />
                            案件情報
                        </h2>
                    </div>

                    <div className="space-y-6 p-6">
                        <div>
                            <InputLabel htmlFor="title" value="案件名 *" />
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(event) => setData('title', event.target.value)}
                                maxLength={80}
                                placeholder="例：次世代EAMシステム開発"
                                className="mt-1.5"
                                required
                            />
                            <div className="mt-1 flex justify-between text-xs text-brand-muted">
                                <span>一覧で識別しやすい名称を推奨（80文字まで）</span>
                                <span className="font-mono">{data.title.length} / 80</span>
                            </div>
                            <InputError className="mt-2" message={errors.title} />
                        </div>

                        <div>
                            <InputLabel htmlFor="department_id" value="担当部門 *" />
                            <select
                                id="department_id"
                                value={data.department_id}
                                onChange={(event) => setData('department_id', event.target.value)}
                                className="mt-1.5 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                required
                            >
                                <option value="">選択してください</option>
                                {departments.map((department) => (
                                    <option key={department.id} value={String(department.id)}>
                                        {department.name}
                                    </option>
                                ))}
                            </select>
                            <InputError className="mt-2" message={errors.department_id} />
                        </div>

                        <div>
                            <InputLabel htmlFor="purpose" value="目的 *" />
                            <textarea
                                id="purpose"
                                value={data.purpose}
                                onChange={(event) => setData('purpose', event.target.value)}
                                maxLength={2000}
                                rows={4}
                                className="mt-1.5 w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                required
                            />
                            <InputError className="mt-2" message={errors.purpose} />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="概要・説明" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                maxLength={5000}
                                rows={7}
                                className="mt-1.5 w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            />
                            <InputError className="mt-2" message={errors.description} />
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="estimated_amount" value="概算予算 *" />
                                <div className="relative mt-1.5">
                                    <Input
                                        id="estimated_amount"
                                        type="text"
                                        inputMode="numeric"
                                        value={formatAmountForDisplay(data.estimated_amount)}
                                        onChange={(event) =>
                                            setData(
                                                'estimated_amount',
                                                toIntegerAmountString(event.target.value),
                                            )
                                        }
                                        className="pr-10 text-right font-mono"
                                        required
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-muted">
                                        円
                                    </span>
                                </div>
                                <InputError className="mt-2" message={errors.estimated_amount} />
                            </div>
                            <div>
                                <InputLabel htmlFor="estimated_days" value="概算工数" />
                                <div className="relative mt-1.5">
                                    <Input
                                        id="estimated_days"
                                        type="text"
                                        inputMode="numeric"
                                        value={formatAmountForDisplay(data.estimated_days)}
                                        onChange={(event) =>
                                            setData(
                                                'estimated_days',
                                                toIntegerAmountString(event.target.value),
                                            )
                                        }
                                        className="pr-12 text-right font-mono"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-muted">
                                        人日
                                    </span>
                                </div>
                                <InputError className="mt-2" message={errors.estimated_days} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-b-lg border-t border-brand-border bg-brand-bg px-6 py-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => submitWithAction('draft')}
                            disabled={processing}
                            className="flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            更新を保存
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => history.back()}
                                disabled={processing}
                                className="text-brand-muted hover:text-brand-dark"
                            >
                                キャンセル
                            </Button>
                            <Button
                                type="button"
                                onClick={() => setConfirmOpen(true)}
                                disabled={processing}
                                className="flex items-center gap-2"
                            >
                                <Send className="h-4 w-4" />
                                更新して申請
                            </Button>
                        </div>
                    </div>
                </form>

                <div className="flex items-start gap-2 text-xs text-brand-muted">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <p className="mt-2 text-sm text-brand-muted">
                        「更新を保存」は案件内容のみ保存します。「更新して申請」は保存後に承認待ちへ遷移します。
                    </p>
                </div>
            </div>

            {confirmOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
                    onClick={() => setConfirmOpen(false)}
                >
                    <div
                        className="w-full max-w-[480px] rounded-xl bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E0F7FE]">
                                    <Send className="h-5 w-5 text-brand-blue" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">更新して申請しますか？</h3>
                                    <p className="mt-1.5 text-sm text-brand-muted">
                                        保存後に承認待ちへ遷移します。申請後は編集できません。
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 rounded-lg bg-brand-bg p-4 text-sm">
                                次ステータス:
                                {' '}
                                {submitsToHqDirect ? '本部承認待ち' : '部門承認待ち'}
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 rounded-b-xl bg-brand-bg px-6 py-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setConfirmOpen(false)}
                                disabled={processing}
                            >
                                キャンセル
                            </Button>
                            <Button
                                type="button"
                                onClick={() => submitWithAction('submit')}
                                disabled={processing}
                                className="flex items-center gap-2"
                            >
                                <Send className="h-4 w-4" />
                                更新して申請
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
