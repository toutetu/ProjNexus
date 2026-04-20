import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps, RoleName } from '@/types';
import { Head, usePage } from '@inertiajs/react';

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

const ROLE_LABEL: Record<RoleName, string> = {
    applicant: '申請者',
    dept_manager: '部門管理者',
    hq_manager: '本部管理者',
};

export default function ProjectsIndex({ tab, filter }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const roleLabels = user.roles.map((r) => ROLE_LABEL[r] ?? r);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    案件一覧（Phase 0 動作確認用）
                </h2>
            }
        >
            <Head title="案件一覧" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="space-y-4 p-6 text-gray-900">
                            <p className="text-sm text-gray-600">
                                これは Phase 0 完了検証のための暫定画面です。
                                Phase 1 以降で S-03a / S-03b / S-03c の正式な一覧 UI に置き換えます。
                            </p>

                            <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
                                <dt className="font-semibold text-gray-700">ログインユーザー</dt>
                                <dd>
                                    {user.name}（{user.email}）
                                </dd>

                                <dt className="font-semibold text-gray-700">所属部門</dt>
                                <dd>
                                    {user.department?.name ?? '（未設定）'}
                                    {user.department?.type === 'headquarters' && '（本部）'}
                                </dd>

                                <dt className="font-semibold text-gray-700">ロール</dt>
                                <dd>{roleLabels.join(' / ') || '（未設定）'}</dd>

                                <dt className="font-semibold text-gray-700">選択中のタブ</dt>
                                <dd>
                                    <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-800">
                                        {TAB_LABEL[tab]}（?tab={tab}）
                                    </span>
                                </dd>

                                <dt className="font-semibold text-gray-700">filter クエリ</dt>
                                <dd>{filter ? filter : '（なし）'}</dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
