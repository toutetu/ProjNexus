import ApplicationLogo from '@/Components/ApplicationLogo';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { Head, useForm } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    BookOpen,
    Building2,
    ChevronDown,
    ChevronUp,
    Code2,
    ExternalLink,
    FileText,
    UserRound,
    Users,
} from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';

// ログイン画面 S-01（B 案：左にアプリ紹介、右にログイン）。
// A 案（1 カラム）は改善候補として mockups/s01_policy.md に残している。

const GITHUB_URL = 'https://github.com/toutetu/ProjNexus';
const NOTION_URL =
    'https://lean-fifth-9ca.notion.site/ProjNexus-352421fa099e80138774cc647cc76b57';

/** デモアカウント共通のパスワード（UserSeeder と同じ値） */
const DEMO_PASSWORD = 'password';

const roleIcons: Record<string, LucideIcon> = {
    申請者: UserRound,
    部門管理者: Users,
    本部管理者: Building2,
};

type TestAccountRow = {
    roleLabel: string;
    email: string;
    department: string;
    representative: boolean;
};

export default function Login({
    status,
    testAccounts,
}: {
    status?: string;
    testAccounts: TestAccountRow[];
}) {
    const [showAllUsers, setShowAllUsers] = useState(false);
    const representatives = useMemo(
        () => testAccounts.filter((row) => row.representative),
        [testAccounts],
    );
    const { data, setData, post, processing, errors, reset } = useForm({
        email: 'dept@example.com',
        password: '',
        remember: false as boolean,
    });

    /** デモアカウントを選ぶと、メールアドレスと共通パスワードを入力する */
    const selectAccount = (email: string) => {
        setData((prev) => ({ ...prev, email, password: DEMO_PASSWORD }));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-jpt-bg px-4 py-10">
            <Head title="ログイン" />

            <div className="grid w-full max-w-4xl overflow-hidden rounded-xl border border-jpt-border bg-white shadow-sm md:grid-cols-2">
                {/* アプリ紹介（スマホではログインの下に回す） */}
                <section className="order-2 flex flex-col border-t border-jpt-border bg-[#EAF3FB] px-6 py-8 md:order-1 md:border-t-0 md:px-8 md:py-10">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-jpt-cyan via-jpt-blue to-jpt-purple">
                            <ApplicationLogo className="h-6 w-6 fill-white text-white" />
                        </span>
                        <span className="leading-tight">
                            <span className="block text-[11px] font-medium text-jpt-muted">
                                開発管理アプリ
                            </span>
                            <span className="block text-lg font-bold tracking-wide text-jpt-dark">
                                ProjNexus
                            </span>
                        </span>
                    </div>

                    <p className="mt-6 text-lg font-bold leading-relaxed text-jpt-dark md:text-xl">
                        申請・承認・開発進捗・予算を、案件を軸にひとつの流れで。
                    </p>
                    <p className="mt-3 text-sm leading-7 text-gray-600">
                        個人開発のポートフォリオです。役割ごとのデモアカウントで操作を試せます。
                    </p>

                    <a
                        href={route('manual.show', { view: 'about' })}
                        target="_blank"
                        rel="noopener"
                        className="mt-6 flex items-center justify-between rounded-md border border-jpt-blue bg-white px-4 py-3 text-sm font-semibold text-jpt-blue transition-colors hover:bg-[#D6E8F7] focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2"
                    >
                        このアプリについて
                        <ExternalLink className="h-4 w-4" />
                    </a>

                    <div className="mt-4 flex gap-5 text-sm font-medium">
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-jpt-blue hover:underline"
                        >
                            <Code2 className="h-4 w-4" />
                            GitHub
                        </a>
                        <a
                            href={NOTION_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-jpt-blue hover:underline"
                        >
                            <FileText className="h-4 w-4" />
                            Notion
                        </a>
                    </div>

                    <a
                        href={route('manual.show')}
                        target="_blank"
                        rel="noopener"
                        className="mt-8 inline-flex items-center gap-1.5 self-start text-xs text-gray-500 transition-colors hover:text-gray-800 hover:underline md:mt-auto md:pt-8"
                    >
                        <BookOpen className="h-3.5 w-3.5" />
                        操作マニュアル
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </section>

                {/* ログイン */}
                <section className="order-1 px-6 py-8 md:order-2 md:px-8 md:py-10">
                    <h1 className="text-xl font-bold text-jpt-dark">ログイン</h1>

                    {status && (
                        <div className="mt-4 text-sm font-medium text-green-600">
                            {status}
                        </div>
                    )}

                    <p className="mt-5 text-xs font-medium text-jpt-muted">
                        デモアカウントを選ぶ
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                        {representatives.map((row) => {
                            const Icon = roleIcons[row.roleLabel] ?? UserRound;
                            const selected = data.email === row.email;
                            return (
                                <button
                                    key={row.email}
                                    type="button"
                                    onClick={() => selectAccount(row.email)}
                                    aria-pressed={selected}
                                    className={cn(
                                        'flex flex-col items-center gap-1 rounded-md border px-2 py-2.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue',
                                        selected
                                            ? 'border-jpt-blue bg-[#EAF3FB] text-jpt-blue'
                                            : 'border-jpt-border bg-white text-gray-600 hover:bg-jpt-bg',
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {row.roleLabel}
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={submit} className="mt-5">
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
                            <InputLabel htmlFor="password">
                                パスワード
                                <span className="text-xs">：{DEMO_PASSWORD}</span>
                            </InputLabel>

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

                        <Button
                            type="submit"
                            size="lg"
                            className="mt-6 w-full text-base"
                            disabled={processing}
                        >
                            ログイン
                        </Button>
                    </form>

                    <div className="mt-5 text-center">
                        <button
                            type="button"
                            onClick={() => setShowAllUsers((prev) => !prev)}
                            aria-expanded={showAllUsers}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-800"
                        >
                            {showAllUsers
                                ? 'テストユーザー一覧を閉じる'
                                : 'ほかのテストユーザーを見る'}
                            {showAllUsers ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                            )}
                        </button>
                    </div>

                    {showAllUsers && (
                        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left text-xs text-gray-700">
                                    <thead className="border-b border-gray-200 text-gray-600">
                                        <tr>
                                            <th className="px-2 py-2 font-semibold">ロール</th>
                                            <th className="px-2 py-2 font-semibold">メール</th>
                                            <th className="px-2 py-2 font-semibold">所属部門</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {testAccounts.map((row, index) => (
                                            <tr
                                                key={row.email}
                                                className={cn(
                                                    index < testAccounts.length - 1 &&
                                                        'border-b border-gray-100',
                                                )}
                                            >
                                                <td className="px-2 py-2">{row.roleLabel}</td>
                                                <td className="px-2 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => selectAccount(row.email)}
                                                        className="text-jpt-blue hover:underline"
                                                    >
                                                        {row.email}
                                                    </button>
                                                </td>
                                                <td className="px-2 py-2">{row.department}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <p className="mt-2 text-xs font-semibold text-gray-700">
                                パスワード：{DEMO_PASSWORD}
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
