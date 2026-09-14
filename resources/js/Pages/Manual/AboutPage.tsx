import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpen, ExternalLink } from 'lucide-react';

import ApplicationLogo from '@/Components/ApplicationLogo';
import type { User } from '@/types';

interface AboutPageProps {
    portfolioUrl: string;
    onOpenManual: () => void;
}

interface AboutPageSharedProps {
    auth: {
        user: User | null;
    };
}

const designDecisions = [
    {
        number: '01',
        title: '役割と案件の関係から認可する',
        body: (
            <>
                ロールだけでなく、案件の申請者・主担当・所属部門との関係も
                Laravel Policy で判定します。画面上でボタンを隠すだけではなく、
                サーバー側でも操作範囲を制限する設計です。
            </>
        ),
    },
    {
        number: '02',
        title: '承認履歴と再申請の経緯を残す',
        body: (
            <>
                承認・却下の段階と日時を履歴として保存します。却下された案件を
                上書きせず、再申請を元案件へ関連付けることで、判断の経緯を後から
                追えるようにしました。
            </>
        ),
    },
    {
        number: '03',
        title: '完了報告と確認完了を分ける',
        body: (
            <>
                タスクの「確認待ち」と「完了」を分離しました。
                実装者の完了報告と確認者の確認を、別の責任として
                表現します。
            </>
        ),
    },
    {
        number: '04',
        title: '予算の現在値・履歴・算出値を分ける',
        body: (
            <>
                予算と実績の現在値、変更履歴を別に保持し、消費率は現在値から算出します。
                同じ意味の値を重複保存しないことで不整合を避ける、DB正規化を意識した構造です。
            </>
        ),
    },
] as const;

const demoRoles = [
    {
        role: '申請者',
        experience: '案件の起案、担当タスクの進捗更新、担当案件の予算確認',
        scope: '自分・担当案件を中心に操作',
    },
    {
        role: '部門管理者',
        experience: '自部門案件の一次承認、タスクと予算の運用',
        scope: '自部門の案件を管理',
    },
    {
        role: '本部管理者',
        experience: '全社案件の最終承認、部門横断の進捗・予算確認',
        scope: '全社を閲覧。タスクは閲覧のみ',
    },
] as const;

const technologies = [
    { term: 'バックエンド', description: 'Laravel 12 / PHP 8.2+' },
    { term: 'フロントエンド', description: 'React 18 / TypeScript / Inertia.js 2' },
    { term: 'データベース', description: 'MySQLを前提に設計 / テストではSQLiteを使用' },
    { term: '認証・認可', description: 'セッション認証 / Spatie Permission / Laravel Policy' },
    { term: 'テスト', description: 'PHPUnit / Laravel Feature tests' },
    { term: '公開環境', description: 'Laravel Cloud' },
] as const;

export default function AboutPage({ portfolioUrl, onOpenManual }: AboutPageProps) {
    // 公開ページでは未ログイン時に auth.user が null になる。
    const { auth }: AboutPageSharedProps = usePage().props;
    const isAuthenticated = auth.user !== null;
    const appHref = isAuthenticated ? '/dashboard' : '/login';
    const appLabel = isAuthenticated ? 'アプリを開く' : 'デモにログイン';

    return (
        <>
            <Head title="このアプリについて" />

            <div className="min-h-screen overflow-x-hidden bg-white text-jpt-dark">
                <a
                    href="#about-main"
                    className="sr-only fixed left-4 top-4 z-50 rounded-md bg-white px-4 py-2 font-semibold text-jpt-dark shadow focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-jpt-blue"
                >
                    本文へ移動
                </a>

                <header className="border-b border-jpt-border bg-white">
                    <div className="mx-auto flex min-h-16 max-w-3xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
                        <Link
                            href="/manual?view=about"
                            className="flex min-w-0 items-center gap-2.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2"
                            aria-label="ProjNexus このアプリについて"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-jpt-red">
                                <ApplicationLogo className="h-5 w-5 fill-white text-white" aria-hidden />
                            </span>
                            <span className="min-w-0 leading-tight">
                                <span className="block truncate text-base font-bold tracking-wide">
                                    ProjNexus
                                </span>
                                <span className="hidden text-[11px] text-jpt-muted sm:block">
                                    開発管理アプリ
                                </span>
                            </span>
                        </Link>

                        <Link
                            href={appHref}
                            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-md bg-jpt-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2"
                        >
                            {appLabel}
                            <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </div>
                </header>

                <main id="about-main" className="mx-auto max-w-3xl px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
                    <section aria-labelledby="about-title">
                        <p className="mb-4 text-sm font-semibold tracking-wide text-jpt-blue">
                            このアプリについて
                        </p>
                        <h1
                            id="about-title"
                            className="max-w-2xl text-[28px] font-bold leading-[1.45] tracking-tight text-jpt-dark sm:text-[32px]"
                        >
                            申請・承認・開発進捗・予算をつなぐ業務支援アプリ
                        </h1>
                        <div className="mt-7 space-y-4 text-base leading-8 text-jpt-muted">
                            <p>
                                ProjNexusは、開発案件の起案から二段階承認、承認後のタスク進捗と
                                予算実績までを、案件を軸に一つの流れで扱う個人開発のWebアプリです。
                            </p>
                            <p>
                                申請書・進捗表・予算表に情報が分かれる業務を題材に、状態遷移、
                                部門をまたぐ閲覧範囲、履歴を残すデータ構造を実装しました。
                                Laravel・React・TypeScriptを使い、データ設計から認可、画面、テストまでを構築しています。
                            </p>
                        </div>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <button
                                type="button"
                                onClick={onOpenManual}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-jpt-border bg-white px-4 py-2.5 text-sm font-semibold text-jpt-dark transition-colors hover:bg-jpt-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2"
                            >
                                <BookOpen className="h-4 w-4" aria-hidden />
                                操作マニュアルを見る
                            </button>
                            <a
                                href={portfolioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-jpt-blue underline decoration-jpt-border underline-offset-4 hover:decoration-jpt-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2"
                            >
                                詳しい資料を見る・印刷
                                <ExternalLink className="h-4 w-4" aria-hidden />
                            </a>
                        </div>
                    </section>

                    <section className="mt-20" aria-labelledby="design-title">
                        <h2 id="design-title" className="text-2xl font-bold tracking-tight text-jpt-dark">
                            設計で考えたこと
                        </h2>
                        <p className="mt-3 text-base leading-7 text-jpt-muted">
                            業務上の責任とデータの意味を、画面だけでなく認可・状態・テーブル構造へ落とし込みました。
                        </p>

                        <div className="mt-7 space-y-4">
                            {designDecisions.map((decision) => (
                                <article
                                    key={decision.number}
                                    className="rounded-lg border border-jpt-border bg-jpt-bg px-5 py-5 sm:px-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <span
                                            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-jpt-border bg-white text-xs font-bold text-jpt-blue"
                                            aria-hidden
                                        >
                                            {decision.number}
                                        </span>
                                        <div className="min-w-0">
                                            <h3 className="text-base font-bold leading-7 text-jpt-dark">
                                                {decision.title}
                                            </h3>
                                            <p className="mt-2 text-sm leading-7 text-gray-600">
                                                {decision.body}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="mt-20" aria-labelledby="demo-title">
                        <h2 id="demo-title" className="text-2xl font-bold tracking-tight text-jpt-dark">
                            デモ用のログイン
                        </h2>
                        <p className="mt-3 text-base leading-7 text-jpt-muted">
                            3つの役割で、同じ案件がどのように見え、誰が操作できるかを確認できます。
                        </p>

                        <div className="mt-7 overflow-hidden rounded-lg border border-jpt-border">
                            <table className="w-full table-fixed border-collapse text-left text-sm">
                                <caption className="sr-only">デモで体験できるロールと操作範囲</caption>
                                <thead className="bg-jpt-bg text-jpt-dark">
                                    <tr>
                                        <th scope="col" className="w-[26%] px-3 py-3 font-semibold sm:px-4">
                                            役割
                                        </th>
                                        <th scope="col" className="px-3 py-3 font-semibold sm:px-4">
                                            体験できること
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-jpt-border">
                                    {demoRoles.map((item) => (
                                        <tr key={item.role} className="align-top">
                                            <th
                                                scope="row"
                                                className="break-words px-3 py-4 font-semibold text-jpt-dark sm:px-4"
                                            >
                                                {item.role}
                                            </th>
                                            <td className="break-words px-3 py-4 leading-6 text-jpt-muted sm:px-4">
                                                <span className="block text-jpt-dark">{item.experience}</span>
                                                <span className="mt-1 block text-xs">{item.scope}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 rounded-lg border border-jpt-border bg-jpt-bg p-5">
                            <p className="text-sm leading-6 text-jpt-muted">
                                デモアカウントはログイン画面に掲載しています。個人情報ではなく、
                                架空の業務データを使用しています。
                            </p>
                            <Link
                                href={appHref}
                                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md bg-jpt-dark px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2 sm:w-auto"
                            >
                                {appLabel}
                                <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>
                        </div>
                    </section>

                    <section className="mt-20" aria-labelledby="technology-title">
                        <h2 id="technology-title" className="text-2xl font-bold tracking-tight text-jpt-dark">
                            技術構成
                        </h2>
                        <dl className="mt-7 divide-y divide-jpt-border border-y border-jpt-border">
                            {technologies.map((technology) => (
                                <div
                                    key={technology.term}
                                    className="grid gap-1 py-4 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-5"
                                >
                                    <dt className="text-sm font-semibold text-jpt-dark">
                                        {technology.term}
                                    </dt>
                                    <dd className="min-w-0 break-words text-sm leading-6 text-jpt-muted">
                                        {technology.description}
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        <nav className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap" aria-label="開発資料">
                            <a
                                href="https://github.com/toutetu/ProjNexus"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-jpt-border px-4 py-2.5 text-sm font-semibold text-jpt-dark hover:bg-jpt-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2"
                            >
                                GitHubを見る
                                <ExternalLink className="h-4 w-4" aria-hidden />
                            </a>
                            <a
                                href="https://github.com/toutetu/ProjNexus/blob/main/materials/Design/system_spec.md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-jpt-border px-4 py-2.5 text-sm font-semibold text-jpt-dark hover:bg-jpt-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2"
                            >
                                システム仕様を見る
                                <ExternalLink className="h-4 w-4" aria-hidden />
                            </a>
                        </nav>
                    </section>
                </main>

                <footer className="border-t border-jpt-border bg-jpt-bg">
                    <div className="mx-auto max-w-3xl px-5 py-8 text-sm leading-6 text-jpt-muted sm:px-6">
                        個人開発のポートフォリオです。デモは架空の業務データを使用しています。
                    </div>
                </footer>
            </div>
        </>
    );
}
