import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout breadcrumb={[{ label: 'ダッシュボード' }]}>
            <Head title="ダッシュボード" />

            <div className="py-6">
                <div className="overflow-hidden rounded-lg border border-brand-border bg-white shadow-sm">
                    <div className="p-6 text-brand-dark">
                        ログイン済みです。通常はこの画面を経由せず{' '}
                        <code className="font-mono text-brand-blue">
                            /projects?tab=approval
                        </code>{' '}
                        に遷移します。
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
