import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    CalendarDays,
    CheckCircle2,
    FileCheck2,
    FolderSearch,
    GitBranch,
    ListChecks,
    XCircle,
} from 'lucide-react';

import ApprovalStepperMini from '@/Components/Approval/ApprovalStepperMini';
import ApprovalDialog from '@/Components/Modals/ApprovalDialog';
import InputLabel from '@/Components/InputLabel';
import StatusPill, { type ProjectStatus } from '@/Components/StatusPill';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ProjectShowData {
    id: number;
    title: string;
    status: ProjectStatus;
    department: string | null;
    applicant: string | null;
    primaryAssignee: string | null;
    purpose: string | null;
    description: string | null;
    estimatedAmount: number | null;
    estimatedDays: number | null;
    budgetAmount: number | null;
    actualAmount: number | null;
    submittedAt: string | null;
    revision: number;
    parentProjectId: number | null;
    rejectedAt?: 'dept' | 'hq' | null;
    applicantSubmitsToHqDirect?: boolean;
}

interface Props {
    projectId: number;
    project: ProjectShowData;
    canEdit: boolean;
    canApproveDept: boolean;
    canApproveHq: boolean;
    canTakeBack: boolean;
}

const formatCurrency = (value: number | null) =>
    value === null ? '—' : `¥${value.toLocaleString('ja-JP')}`;

const formatAmountForDisplay = (value: number | null): string =>
    value === null ? '' : Math.trunc(value).toLocaleString('ja-JP');

export default function ProjectsShow({
    projectId,
    project,
    canEdit,
    canApproveDept,
    canApproveHq,
    canTakeBack,
}: Props) {
    const skipsDeptStep =
        !!project.applicantSubmitsToHqDirect &&
        (project.status === 'pending_hq' ||
            project.status === 'approved' ||
            (project.status === 'rejected' && project.rejectedAt === 'hq'));
    const [approvalDialog, setApprovalDialog] = useState<{
        open: boolean;
        mode: 'approve' | 'reject';
    }>({
        open: false,
        mode: 'approve',
    });
    const approvalLevel: 'dept' | 'hq' = canApproveDept ? 'dept' : 'hq';

    return (
        <AuthenticatedLayout
            activeKey="projects-dev"
            breadcrumb={[
                { label: '申請・承認', icon: FileCheck2 },
                { label: '案件一覧', href: '/projects?tab=approval', icon: FolderSearch },
                { label: '承認画面' },
            ]}
        >
            <Head title="承認画面" />

            <div className="space-y-6">
                <section className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-brand-dark">承認画面</h1>
                        <p className="mt-1 text-sm text-brand-muted">
                            申請内容を確認し、承認または却下を行います
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {canTakeBack && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    router.post(route('projects.takeBack', project.id), {}, {
                                        preserveScroll: true,
                                    });
                                }}
                            >
                                取り戻して下書きに戻す
                            </Button>
                        )}
                        {canEdit && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={route('projects.edit', project.id)}>編集</Link>
                            </Button>
                        )}
                    </div>
                </section>

                <section className="rounded-lg border border-brand-border bg-white shadow-sm">
                    <div className="border-b border-brand-border px-6 py-5">
                        <h2 className="flex items-center gap-2 text-base font-semibold">
                            <FileCheck2 className="h-4 w-4 text-brand-blue" />
                            申請情報
                        </h2>
                        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
                            <span>
                                案件ID: {projectId}
                                {project.revision > 1 && (
                                    <span className="text-brand-dark"> / 改訂{project.revision}回目</span>
                                )}
                            </span>
                            <span className="text-brand-muted">·</span>
                            <StatusPill status={project.status} />
                            {project.applicantSubmitsToHqDirect &&
                                (project.status === 'pending_hq' ||
                                    project.status === 'approved' ||
                                    (project.status === 'rejected' && project.rejectedAt === 'hq')) && (
                                    <span className="rounded-full bg-[#E0F2FE] px-2 py-0.5 text-[10px] font-semibold text-[#0369A1]">
                                        本部直行
                                    </span>
                                )}
                        </p>
                        {project.parentProjectId != null && (
                            <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-muted">
                                <GitBranch className="h-4 w-4 shrink-0" />
                                再申請チェイン:
                                <Link
                                    href={route('projects.show', project.parentProjectId)}
                                    className="font-medium text-brand-blue hover:underline"
                                >
                                    元案件 #{project.parentProjectId}
                                </Link>
                            </p>
                        )}
                    </div>

                    <div className="space-y-6 p-6">
                        <div className="rounded-md border border-brand-border bg-brand-bg/60 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                                承認ステップ
                            </p>
                            <div className="mt-2">
                                <ApprovalStepperMini
                                    status={project.status}
                                    rejectedAt={project.rejectedAt ?? undefined}
                                    skipsDeptStep={skipsDeptStep}
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="title" value="案件名" />
                            <Input id="title" value={project.title} readOnly className="mt-1.5 bg-brand-bg" />
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="department" value="担当部門" />
                                <Input
                                    id="department"
                                    value={project.department ?? '—'}
                                    readOnly
                                    className="mt-1.5 bg-brand-bg"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="submittedAt" value="申請日" />
                                <Input
                                    id="submittedAt"
                                    value={project.submittedAt ?? '—'}
                                    readOnly
                                    className="mt-1.5 bg-brand-bg"
                                />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="purpose" value="目的" />
                            <textarea
                                id="purpose"
                                value={project.purpose ?? ''}
                                readOnly
                                rows={4}
                                className="mt-1.5 w-full rounded-md border border-brand-border bg-brand-bg px-3 py-2 text-sm focus:outline-none"
                            />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="概要・説明" />
                            <textarea
                                id="description"
                                value={project.description ?? ''}
                                readOnly
                                rows={7}
                                className="mt-1.5 w-full rounded-md border border-brand-border bg-brand-bg px-3 py-2 text-sm focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="estimatedAmount" value="概算予算（円）" />
                                <Input
                                    id="estimatedAmount"
                                    value={formatAmountForDisplay(project.estimatedAmount)}
                                    readOnly
                                    className="mt-1.5 bg-brand-bg text-right font-mono"
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="estimatedDays" value="概算工数（人日）" />
                                <Input
                                    id="estimatedDays"
                                    value={
                                        project.estimatedDays !== null
                                            ? String(project.estimatedDays)
                                            : ''
                                    }
                                    readOnly
                                    className="mt-1.5 bg-brand-bg text-right font-mono"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-lg border border-brand-border bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                                    申請者 / 主担当
                                </p>
                                <p className="mt-2 text-sm text-brand-dark">
                                    {project.applicant ?? '—'} / {project.primaryAssignee ?? '未設定'}
                                </p>
                                <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-muted">
                                    <CalendarDays className="h-3.5 w-3.5" />
                                    申請時の情報
                                </p>
                            </div>
                            <div className="rounded-lg border border-brand-border bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                                    予算情報
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-brand-dark">
                                    <li>見積: {formatCurrency(project.estimatedAmount)}</li>
                                    <li>予算: {formatCurrency(project.budgetAmount)}</li>
                                    <li>実績: {formatCurrency(project.actualAmount)}</li>
                                </ul>
                            </div>
                            <div className="rounded-lg border border-brand-border bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                                    補足
                                </p>
                                <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-muted">
                                    <ListChecks className="h-4 w-4 text-brand-muted" />
                                    タスク・予算詳細は次フェーズで接続
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {(canApproveDept || canApproveHq) && (
                    <section className="rounded-lg border border-brand-border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex items-center gap-1.5"
                                onClick={() => setApprovalDialog({ open: true, mode: 'reject' })}
                            >
                                <XCircle className="h-4 w-4" />
                                却下
                            </Button>
                            <Button
                                type="button"
                                className="flex items-center gap-1.5"
                                onClick={() => setApprovalDialog({ open: true, mode: 'approve' })}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                                承認
                            </Button>
                        </div>
                    </section>
                )}
            </div>

            <ApprovalDialog
                mode={approvalDialog.mode}
                open={approvalDialog.open}
                onClose={() => setApprovalDialog((prev) => ({ ...prev, open: false }))}
                approvalLevel={approvalLevel}
                project={{
                    id: project.id,
                    title: project.title,
                    department: project.department ?? '—',
                }}
                onSubmit={(comment) => {
                    const routeName =
                        approvalDialog.mode === 'approve' ? 'projects.approve' : 'projects.reject';
                    router.post(
                        route(routeName, project.id),
                        { level: approvalLevel, comment },
                        {
                            preserveScroll: true,
                            onSuccess: () =>
                                setApprovalDialog((prev) => ({ ...prev, open: false })),
                        },
                    );
                }}
            />
        </AuthenticatedLayout>
    );
}
