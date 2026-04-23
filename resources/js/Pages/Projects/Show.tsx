import { Head, Link } from '@inertiajs/react';
import { CalendarDays, FileCheck2, FolderSearch, ListChecks } from 'lucide-react';

import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ProjectShowData {
    id: number;
    title: string;
    status: string;
    department: string | null;
    applicant: string | null;
    primaryAssignee: string | null;
    estimatedAmount: number | null;
    budgetAmount: number | null;
    actualAmount: number | null;
}

interface Props {
    projectId: number;
    project: ProjectShowData;
    canEdit: boolean;
}

const formatCurrency = (value: number | null) =>
    value === null ? '—' : `¥${value.toLocaleString('ja-JP')}`;

export default function ProjectsShow({ projectId, project, canEdit }: Props) {
    return (
        <AuthenticatedLayout
            activeKey="projects-dev"
            breadcrumb={[
                { label: '申請・承認', icon: FileCheck2 },
                { label: '案件一覧', href: '/projects?tab=approval', icon: FolderSearch },
                { label: '案件詳細' },
            ]}
        >
            <Head title="案件詳細" />

            <div className="space-y-6">
                <section className="rounded-lg border border-brand-border bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h1 className="flex items-center text-2xl font-bold tracking-tight text-brand-dark">
                                <span className="mr-2.5 inline-block h-6 w-1 rounded-sm bg-brand-accent" />
                                {project.title}
                            </h1>
                            <p className="mt-2 text-sm text-brand-muted">
                                案件ID: {projectId} / ステータス: {project.status}
                            </p>
                        </div>
                        {canEdit && (
                            <Button asChild variant="outline" size="sm">
                                <Link href={route('projects.edit', project.id)}>編集</Link>
                            </Button>
                        )}
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
            </div>
        </AuthenticatedLayout>
    );
}
