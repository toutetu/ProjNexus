import { User as UserIcon } from 'lucide-react';

import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import type { PageProps, RoleName } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';

type GenderValue = 'male' | 'female' | 'other' | 'no_answer' | '';

const ROLE_LABEL: Record<RoleName, string> = {
    applicant: '申請者',
    dept_manager: '部門管理者',
    hq_manager: '本部管理者',
};

export default function Edit({ status }: PageProps<{ status?: string }>) {
    const user = usePage<PageProps>().props.auth.user;
    const departmentName = user.department?.name ?? '未所属';
    const roleName = user.roles.map((role) => ROLE_LABEL[role]).join(' / ') || '未設定';

    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm<{
        birthdate: string;
        gender: GenderValue;
    }>({
        birthdate: user.birthdate ?? '',
        gender: (user.gender as GenderValue) ?? '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        patch(route('profile.update'), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            activeKey="profile"
            breadcrumb={[
                { label: '共通', icon: UserIcon },
                { label: 'プロフィール' },
            ]}
        >
            <Head title="プロフィール" />

            <div className="space-y-6 py-6">
                <h1 className="flex items-center text-2xl font-bold tracking-tight text-brand-dark">
                    <span className="mr-2.5 inline-block h-6 w-1 rounded-sm bg-brand-accent" />
                    プロフィール
                </h1>

                <div className="rounded-lg border border-brand-border bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-brand-dark">アカウント情報（表示のみ）</h2>
                    <p className="mt-1 text-sm text-brand-muted">
                        氏名・部署・ロール・メールアドレスは参照用です（この画面では編集できません）。
                    </p>

                    <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="md:col-span-1">
                            <InputLabel htmlFor="profile_name" value="氏名" />
                            <Input
                                id="profile_name"
                                value={user.name ?? ''}
                                readOnly
                                className="mt-1.5 bg-brand-bg"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <InputLabel htmlFor="profile_department" value="部署" />
                            <Input
                                id="profile_department"
                                value={departmentName}
                                readOnly
                                className="mt-1.5 bg-brand-bg"
                            />
                        </div>
                        <div className="md:col-span-1">
                            <InputLabel htmlFor="profile_role" value="ロール" />
                            <Input
                                id="profile_role"
                                value={roleName}
                                readOnly
                                className="mt-1.5 bg-brand-bg"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <InputLabel htmlFor="profile_email" value="メールアドレス" />
                            <Input
                                id="profile_email"
                                value={user.email ?? ''}
                                readOnly
                                className="mt-1.5 bg-brand-bg"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-brand-border bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-brand-dark">本人入力</h2>
                    <p className="mt-1 text-sm text-brand-muted">
                        生年月日と性別は任意です。必要な場合のみ入力してください。
                    </p>

                    <form onSubmit={submit} className="mt-5 space-y-5">
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="birthdate" value="生年月日" />
                                <Input
                                    id="birthdate"
                                    type="date"
                                    value={data.birthdate}
                                    onChange={(e) => setData('birthdate', e.target.value)}
                                    className="mt-1.5"
                                />
                                <InputError className="mt-2" message={errors.birthdate} />
                            </div>
                            <div>
                                <InputLabel htmlFor="gender" value="性別" />
                                <select
                                    id="gender"
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value as GenderValue)}
                                    className="mt-1.5 w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                >
                                    <option value="">選択しない</option>
                                    <option value="male">男性</option>
                                    <option value="female">女性</option>
                                    <option value="other">その他</option>
                                    <option value="no_answer">回答しない</option>
                                </select>
                                <InputError className="mt-2" message={errors.gender} />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button type="submit" disabled={processing}>
                                保存
                            </Button>
                            {recentlySuccessful || status === 'profile-updated' ? (
                                <p className="text-sm text-brand-muted">保存しました。</p>
                            ) : null}
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
