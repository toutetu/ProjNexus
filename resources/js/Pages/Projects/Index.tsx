import { Head, usePage } from '@inertiajs/react';
import { FileCheck2, FolderSearch, Plus } from 'lucide-react';

import StatusPill, {
    type ProjectStatus,
} from '@/Components/StatusPill';
import { Button } from '@/Components/ui/button';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { ActiveKey } from '@/Components/Layout/Sidebar';
import type { PageProps, RoleName } from '@/types';

type ProjectTab = 'approval' | 'dev' | 'budget';

interface Props {
    tab: ProjectTab;
    filter?: string | null;
}

const TAB_LABEL: Record<ProjectTab, string> = {
    approval: '申請',
    dev: '開発',
    budget: '予算',
};

const TAB_SUBTITLE: Record<ProjectTab, string> = {
    approval: '申請フェーズ',
    dev: '開発フェーズ',
    budget: '予算フェーズ',
};

const ROLE_LABEL: Record<RoleName, string> = {
    applicant: '申請者',
    dept_manager: '部門管理者',
    hq_manager: '本部管理者',
};

const TAB_ACTIVE_KEY: Record<ProjectTab, ActiveKey> = {
    approval: 'projects-approval',
    dev: 'projects-dev',
    budget: 'projects-budget',
};

const ALL_STATUSES: ProjectStatus[] = [
    'draft',
    'pending_dept',
    'pending_hq',
    'approved',
    'rejected',
];

export default function ProjectsIndex({ tab, filter }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const roleLabels = user.roles.map((r) => ROLE_LABEL[r] ?? r);
    const activeKey: ActiveKey =
        filter === 'pending' ? 'pending' : TAB_ACTIVE_KEY[tab];

    return (
        <AuthenticatedLayout
            activeKey={activeKey}
            breadcrumb={[
                { label: '申請・承認', icon: FileCheck2 },
                { label: '案件一覧', icon: FolderSearch },
            ]}
        >
            <Head title="案件一覧" />

            <div className="mb-5 flex items-start justify-between">
                <div>
                    <h1 className="flex items-center text-2xl font-bold tracking-tight text-brand-dark">
                        <span className="mr-2.5 inline-block h-6 w-1 rounded-sm bg-brand-accent" />
                        案件一覧
                    </h1>
                    <p className="mt-1 text-sm text-brand-muted">
                        {TAB_SUBTITLE[tab]}
                        <span className="mx-1.5">·</span>
                        Phase 1 骨組み（ダミー表示）
                    </p>
                </div>
                <Button size="default" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    新規申請
                </Button>
            </div>

            <section className="space-y-4 rounded-lg border border-brand-border bg-white p-6 shadow-sm">
                <div>
                    <h2 className="text-lg font-semibold text-brand-dark">
                        Phase 1 動作確認
                    </h2>
                    <p className="mt-1 text-sm text-brand-muted">
                        レイアウト・ロール別メニュー・StatusPill の色表示を確認するための暫定画面です。
                        Phase 2 以降でこのセクションは実際のテーブルに置き換わります。
                    </p>
                </div>

                <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
                    <dt className="font-semibold text-brand-dark">
                        ログインユーザー
                    </dt>
                    <dd className="text-brand-dark">
                        {user.name}（{user.email}）
                    </dd>

                    <dt className="font-semibold text-brand-dark">所属部門</dt>
                    <dd className="text-brand-dark">
                        {user.department?.name ?? '（未設定）'}
                        {user.department?.type === 'headquarters' && '（本部）'}
                    </dd>

                    <dt className="font-semibold text-brand-dark">ロール</dt>
                    <dd className="text-brand-dark">
                        {roleLabels.join(' / ') || '（未設定）'}
                    </dd>

                    <dt className="font-semibold text-brand-dark">
                        選択中のタブ
                    </dt>
                    <dd>
                        <span className="rounded bg-[#FEE2E2] px-2 py-0.5 text-xs font-semibold text-[#991B1B]">
                            {TAB_LABEL[tab]}（?tab={tab}）
                        </span>
                    </dd>

                    <dt className="font-semibold text-brand-dark">
                        filter クエリ
                    </dt>
                    <dd className="text-brand-dark">{filter ?? '（なし）'}</dd>
                </dl>
            </section>

            <section className="mt-6 rounded-lg border border-brand-border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-brand-dark">
                    StatusPill（案件ステータス 5 種）
                </h2>
                <p className="mt-1 text-sm text-brand-muted">
                    design_system.md / components_spec.md の色マッピングに準拠。
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    {ALL_STATUSES.map((status) => (
                        <StatusPill key={status} status={status} />
                    ))}
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
