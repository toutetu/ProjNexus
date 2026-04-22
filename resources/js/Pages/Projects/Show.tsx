import { Head } from '@inertiajs/react';
import { CalendarDays, FileCheck2, FolderSearch, ListChecks } from 'lucide-react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function ProjectsShow() {
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
                    <h1 className="flex items-center text-2xl font-bold tracking-tight text-brand-dark">
                        <span className="mr-2.5 inline-block h-6 w-1 rounded-sm bg-brand-accent" />
                        案件詳細（骨組み）
                    </h1>
                    <p className="mt-2 text-sm text-brand-muted">
                        S-04 実装前のプレースホルダです。Phase 2 で承認ステッパー大型版・案件情報・タスク/予算タブを接続します。
                    </p>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-brand-border bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                            案件コード
                        </p>
                        <p className="mt-2 font-mono text-sm text-brand-dark">
                            PRJ-2026-0042
                        </p>
                    </div>
                    <div className="rounded-lg border border-brand-border bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                            最終更新
                        </p>
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-dark">
                            <CalendarDays className="h-4 w-4 text-brand-muted" />
                            2026-04-22 19:30
                        </p>
                    </div>
                    <div className="rounded-lg border border-brand-border bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">
                            タスク
                        </p>
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-brand-dark">
                            <ListChecks className="h-4 w-4 text-brand-muted" />
                            0 / 0（Phase 2で接続）
                        </p>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
