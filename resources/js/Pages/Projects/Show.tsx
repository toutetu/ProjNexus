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
import StatusPill, { type ProjectStatus } from '@/Components/StatusPill';
import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ProjectShowData {
    id: number;
    title: string;
    status: ProjectStatus;
    department: string | null;
    applicant: string | null;
    primaryAssignee: string | null;
    estimatedAmount: number | null;
    budgetAmount: number | null;
    actualAmount: number | null;
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
}

const formatCurrency = (value: number | null) =>
    value === null ? '—' : `¥${value.toLocaleString('ja-JP')}`;

export default function ProjectsShow({
    projectId,
    project,
    canEdit,
    canApproveDept,
    canApproveHq,
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
                <section className="rounded-lg border border-brand-border bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="flex items-center text-2xl font-bold tracking-tight text-brand-dark">
                                <span className="mr-2.5 inline-block h-6 w-1 rounded-sm bg-brand-accent" />
                                {project.title}
                            </h1>
                            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-brand-muted">
                                <span>
                                    案件ID: {projectId}
                                    {project.revision > 1 && (
                                        <span className="text-brand-dark">
                                            {' '}
                                            / 改訂{project.revision}回目
                                        </span>
                                    )}
                                </span>
                                <span className="text-brand-muted">·</span>
                                <StatusPill status={project.status} />
                                {project.applicantSubmitsToHqDirect &&
                                    (project.status === 'pending_hq' ||
                                        project.status === 'approved' ||
                                        (project.status === 'rejected' &&
                                            project.rejectedAt === 'hq')) && (
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
                        {canEdit && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={route('projects.edit', project.id)}>編集</Link>
                            </Button>
                        )}
                    </div>
                    <div className="mt-6 rounded-md border border-brand-border bg-brand-bg/60 px-4 py-3">
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
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-brand-border bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                            部門
                        </p>
                        <p className="mt-2 text-sm text-brand-dark">{project.department ?? '—'}</p>
                    </div>
                    <div className="rounded-lg border border-brand-border bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                            申請者 / 主担当
                        </p>
                        <p className="mt-2 text-sm text-brand-dark">
                            {project.applicant ?? '—'} / {project.primaryAssignee ?? '未設定'}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-brand-muted">
                            <CalendarDays className="h-3.5 w-3.5" />
                            詳細画面の拡張は Phase 2 で継続
                        </p>
                    </div>
                    <div className="rounded-lg border border-brand-border bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                            金額情報
                        </p>
                        <ul className="mt-2 space-y-1 text-sm text-brand-dark">
                            <li>見積: {formatCurrency(project.estimatedAmount)}</li>
                            <li>予算: {formatCurrency(project.budgetAmount)}</li>
                            <li>実績: {formatCurrency(project.actualAmount)}</li>
                        </ul>
                    </div>
                </section>

                <section className="rounded-lg border border-brand-border bg-white p-4 shadow-sm">
                    <p className="flex items-center gap-1.5 text-sm text-brand-muted">
                        <ListChecks className="h-4 w-4 text-brand-muted" />
                        タスク・予算詳細タブは次フェーズで接続します。
                    </p>
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
