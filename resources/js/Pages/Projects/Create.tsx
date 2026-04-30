import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    Check,
    ChevronRight,
    FileCheck2,
    FilePlus2,
    FolderPlus,
    Info,
    Lightbulb,
    Save,
    Send,
} from 'lucide-react';

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Challenge2Badge from '@/Components/Badge/Challenge2Badge';
import StatusPill from '@/Components/StatusPill';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, RoleName } from '@/types';

interface CreateProjectForm {
    title: string;
    department_id: string;
    purpose: string;
    description: string;
    estimated_amount: string;
    estimated_days: string;
    submit_action: 'draft' | 'submit';
}

interface Props {
    departments: Array<{
        id: number;
        name: string;
    }>;
    defaultDepartmentId?: number | null;
    draftCount?: number;
}

const toIntegerAmountString = (value: string): string => {
    const normalized = value.replace(/,/g, '');
    const integerPart = normalized.split('.')[0] ?? '';
    return integerPart.replace(/\D/g, '');
};

const formatAmountForDisplay = (value: string): string => {
    const integerValue = toIntegerAmountString(value);
    if (integerValue === '') {
        return '';
    }

    return integerValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function ProjectsCreate({
    departments,
    defaultDepartmentId = null,
    draftCount = 0,
}: Props) {
    const { auth } = usePage<PageProps>().props;
    const roles = auth.user.roles ?? [];
    const submitsToHqDirect = roles.includes('dept_manager' as RoleName);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const { data, setData, post, processing, errors, transform } = useForm<CreateProjectForm>({
        title: '',
        department_id: defaultDepartmentId ? String(defaultDepartmentId) : '',
        purpose: '',
        description: '',
        estimated_amount: '',
        estimated_days: '',
        submit_action: 'draft',
    });

    const submitWithAction = (action: 'draft' | 'submit') => {
        transform((form) => ({ ...form, submit_action: action }));
        post(route('projects.store'), {
            onError: () => {
                if (action === 'draft') {
                    window.alert('保存できませんでした！\n入力内容を確認してください。');
                    return;
                }

                window.alert('申請できませんでした！\n入力内容を確認してください。');
            },
            onFinish: () => {
                transform((form) => ({ ...form, submit_action: 'draft' }));
                if (action === 'submit') {
                    setConfirmOpen(false);
                }
            },
        });
    };

    return (
        <AuthenticatedLayout
            activeKey="new"
            breadcrumb={[
                { label: '申請・承認', icon: FileCheck2 },
                { label: '新規申請', icon: FolderPlus },
            ]}
        >
            <Head title="新規申請" />

            <div className="mx-auto max-w-3xl space-y-6">
                <section className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">
                            新規案件申請
                        </h1>
                        <p className="mt-1 text-sm text-brand-muted">
                            開発案件を起案し、部門管理者・本部管理者の承認を受けます
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
                        <span className="font-semibold">あなたが申請</span>
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
                            <FilePlus2 className="h-4 w-4 text-brand-blue" />
                            案件情報
                        </h2>
                    </div>

                    <div className="space-y-6 p-6">
                        <p className="text-xs text-brand-muted">
                            下書き保存は「案件名」のみ必須です。申請時は
                            <span className="mx-1 font-semibold text-brand-red">*</span>
                            項目の入力が必要です。
                        </p>
                        <div>
                            <InputLabel htmlFor="title">
                                案件名 <span className="text-brand-red">*</span>
                            </InputLabel>
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
                            <InputLabel htmlFor="department_id">
                                担当部門 <span className="text-brand-red">*</span>
                            </InputLabel>
                            <select
                                id="department_id"
                                value={data.department_id}
                                onChange={(event) =>
                                    setData('department_id', event.target.value)
                                }
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
                            <p className="mt-1 text-xs text-brand-muted">
                                案件の主担当となる部門を選択。部門管理者がこの部門の承認者として割り当てられます
                            </p>
                            <InputError className="mt-2" message={errors.department_id} />
                        </div>

                        <div>
                            <InputLabel htmlFor="purpose">
                                目的 <span className="text-brand-red">*</span>
                            </InputLabel>
                            <textarea
                                id="purpose"
                                value={data.purpose}
                                onChange={(event) => setData('purpose', event.target.value)}
                                maxLength={2000}
                                rows={4}
                                placeholder="この案件で達成したいビジネス成果や解決したい課題を記述"
                                className="mt-1.5 w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                required
                            />
                            <p className="mt-1 text-xs text-brand-muted">
                                承認者が投資判断をする際の最重要項目。定量的な目標があれば含めてください
                            </p>
                            <InputError className="mt-2" message={errors.purpose} />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="概要・説明" />
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(event) =>
                                    setData('description', event.target.value)
                                }
                                maxLength={5000}
                                rows={7}
                                placeholder="対象システム・主要機能・スコープ・想定ユーザー・技術的な前提条件などを記述"
                                className="mt-1.5 w-full rounded-md border border-brand-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            />
                            <p className="mt-1 text-xs text-brand-muted">
                                任意。承認後は編集ロックされるため、可能な範囲で詳細に
                            </p>
                            <InputError className="mt-2" message={errors.description} />
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="estimated_amount">
                                    概算予算 <span className="text-brand-red">*</span>
                                </InputLabel>
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
                                        placeholder="10,000,000"
                                        className="pr-10 text-right font-mono"
                                        required
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-muted">
                                        円
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-brand-muted">
                                    承認時に「確定予算」として確定し、以降は変更不可
                                </p>
                                <InputError
                                    className="mt-2"
                                    message={errors.estimated_amount}
                                />
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
                                        placeholder="120"
                                        className="pr-12 text-right font-mono"
                                    />
                                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-muted">
                                        人日
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-brand-muted">
                                    任意。タスクの合計見積と比較する参考値
                                </p>
                                <InputError className="mt-2" message={errors.estimated_days} />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2">
                                <InputLabel htmlFor="attachments" value="ファイル添付" />
                                <Challenge2Badge />
                            </div>
                            <Input
                                id="attachments"
                                type="file"
                                className="mt-1.5 cursor-not-allowed bg-brand-bg"
                                disabled
                            />
                            <p className="mt-1 text-xs text-brand-muted">
                                課題2で実装予定のため、現在は準備中です。
                            </p>
                        </div>

                        {draftCount > 0 && (
                            <div className="flex items-start gap-3 rounded-lg border border-dashed border-[#EDB100] bg-[#FFF9E6] px-4 py-3">
                                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[#B8860B]" />
                                <div className="text-sm">
                                    <p className="font-medium text-[#7A5400]">
                                        下書きから復元できます
                                    </p>
                                    <p className="mt-0.5 text-brand-muted">
                                        過去に保存した下書きが <b>{draftCount}件</b>{' '}
                                        あります。
                                        <Link
                                            href={route('projects.index', {
                                                tab: 'approval',
                                                status: 'draft',
                                            })}
                                            className="ml-1 font-medium text-brand-blue hover:underline"
                                        >
                                            案件一覧から再編集できます。
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between rounded-b-lg border-t border-brand-border bg-brand-bg px-6 py-4">
                        <div className="flex flex-col gap-1">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => submitWithAction('draft')}
                                disabled={processing}
                                className="flex items-center gap-2"
                            >
                                <Save className="h-4 w-4" />
                                下書き保存
                            </Button>
                            <p className="text-xs text-brand-muted">
                                下書き保存: 案件名のみで保存できます
                            </p>
                        </div>
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
                                申請する
                            </Button>
                        </div>
                    </div>
                    <div className="border-t border-brand-border bg-brand-bg px-6 py-2 text-right text-xs text-brand-muted">
                        申請する: 必須項目（*）をすべて入力してください
                    </div>
                </form>

                <div className="flex items-start gap-2 text-xs text-brand-muted">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <p className="mt-2 text-sm text-brand-muted">
                        申請後は編集できません。承認・却下の結果は通知で届きます。却下された場合は「再申請」から内容を引き継いで作成できます。
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
                                    <h3 className="text-lg font-semibold">申請しますか？</h3>
                                    <p className="mt-1.5 text-sm text-brand-muted">
                                        {submitsToHqDirect
                                            ? '申請後は内容を編集できません。承認・却下を待つステータスになります。'
                                            : '申請後、部門承認が完了するまでは申請を取り下げできます。'}
                                    </p>
                                    <p className="mt-1 text-xs text-brand-muted">
                                        申請時は「*」項目の入力が必要です。
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 space-y-1.5 rounded-lg bg-brand-bg p-4 text-sm">
                                <div className="flex">
                                    <span className="w-24 text-brand-muted">ステータス</span>
                                    <div className="flex items-center gap-2">
                                        <StatusPill
                                            status={
                                                submitsToHqDirect
                                                    ? 'pending_hq'
                                                    : 'pending_dept'
                                            }
                                        />
                                        <span>へ</span>
                                    </div>
                                </div>
                                <div className="flex">
                                    <span className="w-24 text-brand-muted">次の承認者</span>
                                    <span>
                                        {submitsToHqDirect
                                            ? '本部管理者'
                                            : '選択部門の部門管理者'}
                                    </span>
                                </div>
                                <div className="flex">
                                    <span className="w-24 text-brand-muted">通知</span>
                                    <span className="flex flex-wrap items-center gap-1">
                                        承認/却下時にアプリ内通知（＋メール
                                        <Challenge2Badge className="text-[8px]" />
                                        ）
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 rounded-b-xl bg-brand-bg px-6 py-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setConfirmOpen(false)}
                                disabled={processing}
                                className="text-brand-muted hover:text-brand-dark"
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
                                申請する
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
