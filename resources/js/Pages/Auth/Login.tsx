import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { BookOpen, ExternalLink } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showAllUsers, setShowAllUsers] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: 'dept@example.com',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="ログイン" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="メールアドレス" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="パスワード" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            ログイン状態を保持する
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            パスワードを忘れた場合
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        ログイン
                    </PrimaryButton>
                </div>
            </form>

            <a
                href={route('manual.show')}
                target="_blank"
                rel="noopener"
                className="mt-4 flex items-center justify-between rounded-lg border border-[#EDB100] bg-[#FFF9E6] px-4 py-3 text-sm transition-colors hover:bg-[#FBE99A]"
            >
                <span className="flex items-center gap-2 text-[#7A5400]">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-semibold">操作手順は利用マニュアルへ</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#7A5400]">
                    開く
                    <ExternalLink className="h-3 w-3" />
                </span>
            </a>

            <section className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">テストユーザー</p>
                    <button
                        type="button"
                        onClick={() => setShowAllUsers((prev) => !prev)}
                        className="rounded border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-100"
                    >
                        {showAllUsers ? '− 代表のみ表示' : '＋ 全ユーザーを表示'}
                    </button>
                </div>
                <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full text-left text-xs text-gray-700">
                        <thead className="border-b border-gray-200 text-gray-600">
                            <tr>
                                <th className="px-2 py-2 font-semibold">ロール</th>
                                <th className="px-2 py-2 font-semibold">メール</th>
                                <th className="px-2 py-2 font-semibold">所属部門</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-100">
                                <td className="px-2 py-2">申請者</td>
                                <td className="px-2 py-2">applicant@example.com</td>
                                <td className="px-2 py-2">開発1部</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                                <td className="px-2 py-2">部門管理者</td>
                                <td className="px-2 py-2">dept@example.com</td>
                                <td className="px-2 py-2">開発1部</td>
                            </tr>
                            <tr>
                                <td className="px-2 py-2">本部管理者</td>
                                <td className="px-2 py-2">hq@example.com</td>
                                <td className="px-2 py-2">本部</td>
                            </tr>
                            {showAllUsers && (
                                <>
                                    <tr className="border-b border-gray-100 bg-white/70">
                                        <td className="px-2 py-2">申請者</td>
                                        <td className="px-2 py-2">applicant2@example.com</td>
                                        <td className="px-2 py-2">開発2部</td>
                                    </tr>
                                    <tr className="border-b border-gray-100 bg-white/70">
                                        <td className="px-2 py-2">部門管理者</td>
                                        <td className="px-2 py-2">dept2@example.com</td>
                                        <td className="px-2 py-2">開発2部</td>
                                    </tr>
                                    <tr className="bg-white/70">
                                        <td className="px-2 py-2">申請者</td>
                                        <td className="px-2 py-2">applicant3@example.com</td>
                                        <td className="px-2 py-2">開発3部</td>
                                    </tr>
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-xs font-semibold text-gray-700"> パスワード：password</p>
            </section>
        </GuestLayout>
    );
}
