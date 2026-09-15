import { Head, Link, usePage } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    ArrowRight,
    BookOpen,
    Building2,
    ClipboardList,
    Code2,
    Columns3,
    ExternalLink,
    FileSpreadsheet,
    FileText,
    History,
    LayoutDashboard,
    MoveRight,
    PenLine,
    Plus,
    Route as RouteIcon,
    ShieldCheck,
    UserRound,
    Users,
    Wallet,
} from 'lucide-react';
import type { ReactNode } from 'react';

import ApplicationLogo from '@/Components/ApplicationLogo';
import type { User } from '@/types';

interface AboutPageProps {
    portfolioUrl: string;
    /** プレゼン資料 PDF の URL。ファイルが無い環境では null になり、リンクを出さない */
    presentationUrl: string | null;
    onOpenManual: () => void;
}

interface AboutPageSharedProps {
    auth: {
        user: User | null;
    };
}

const GITHUB_URL = 'https://github.com/toutetu/ProjNexus';
const GITHUB_BLOB = `${GITHUB_URL}/blob/main`;

/** materials/manual/images 配下のキャプチャを ManualController::asset 経由で配信する */
const shot = (file: string): string => `/manual/assets/${file}`;

// ---------------------------------------------------------------------------
// ページ内ナビゲーション
// ---------------------------------------------------------------------------

const navItems = [
    { href: '#background', label: '背景' },
    { href: '#ideas', label: '工夫' },
    { href: '#challenges', label: '実装の課題' },
    { href: '#process', label: '進め方' },
    { href: '#demo', label: 'デモ' },
    { href: '#tech', label: '技術' },
] as const;

// ---------------------------------------------------------------------------
// 01 背景と課題
// ---------------------------------------------------------------------------

const fragmentedTools = [
    {
        icon: FileText,
        title: '申請システム',
        body: '案件の申請と承認だけを扱う。誰の判断待ちで止まっているのかが分かりにくく、承認後の進捗は別の場所で管理される。',
    },
    {
        icon: FileSpreadsheet,
        title: '部門別 Excel',
        body: '開発進捗の管理表が部門ごとに違うフォーマットで運用され、本部での集約は手作業。進捗を申請システムへ再入力する二重入力も発生する。',
    },
    {
        icon: Wallet,
        title: '予算管理 Excel',
        body: '予算額と実績額を進捗とは別の表で管理する。消費率をリアルタイムに把握できず、対策が後手に回る。',
    },
] as const;

const voices = [
    {
        role: '本部管理者',
        icon: Building2,
        quote: '全案件の進捗と予算リスクを、一覧で見たい。',
    },
    {
        role: '部門管理者',
        icon: Users,
        quote: 'Excel の転記を減らし、メンバーの状況を一目で把握したい。',
    },
    {
        role: '申請者',
        icon: UserRound,
        quote: '申請した案件が、今どの承認段階にあるか分かると安心。',
    },
] as const;

// ---------------------------------------------------------------------------
// 02 私なりの工夫
// ---------------------------------------------------------------------------

interface IdeaImage {
    file: string;
    alt: string;
    caption: string;
    /** 複数枚を並べるときの見出し（例: VIEW 1 ／ カンバン） */
    label?: string;
}

interface IdeaDoc {
    label: string;
    /** リポジトリ内パス。GitHub の blob URL に変換して表示する */
    path: string;
}

interface Idea {
    number: string;
    icon: LucideIcon;
    title: string;
    background: ReactNode;
    implementation: ReactNode;
    points: readonly string[];
    /** 1 枚なら本文の横、複数枚なら本文の下に横並びで表示する */
    images: readonly IdeaImage[];
    /** 工夫の経緯が残っている設計・開発ドキュメント */
    docs: readonly IdeaDoc[];
    /** 箇条書きの下に差し込む補足ブロック */
    extra?: ReactNode;
}

const statusSwatches = [
    { label: '下書き', className: 'bg-status-draft' },
    { label: '部門承認待ち', className: 'bg-status-pending-dept' },
    { label: '本部承認待ち', className: 'bg-status-pending-hq' },
    { label: '承認済', className: 'bg-status-approved' },
    { label: '却下', className: 'bg-status-rejected' },
] as const;

const keyColors = [
    { label: 'CTA・却下だけ', note: '#E60013 コーポレートレッド', className: 'bg-jpt-red' },
    {
        label: '承認の進行・ロゴ',
        note: 'シアン → ブルー → パープル',
        className: 'bg-gradient-to-r from-jpt-cyan via-jpt-blue to-jpt-purple',
    },
    { label: 'アクセント', note: '#EDB100 タイトル横の縦バー', className: 'bg-jpt-accent' },
    { label: '見出し・本文', note: '#212429', className: 'bg-jpt-dark' },
] as const;

/** 工夫 02 の補足：キーカラーの使い分けと、ボタンの押し心地の見本 */
function ColorGuide() {
    return (
        <div className="mt-5 rounded-lg border border-jpt-border bg-jpt-bg p-4">
            <p className="text-xs font-semibold tracking-wide text-jpt-muted">キーカラーの使い分け</p>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {keyColors.map((color) => (
                    <li key={color.label} className="min-w-0">
                        <span className={`block h-7 rounded-md ${color.className}`} aria-hidden />
                        <span className="mt-1.5 block text-xs font-semibold text-jpt-dark">{color.label}</span>
                        <span className="block break-words text-[11px] leading-4 text-jpt-muted">{color.note}</span>
                    </li>
                ))}
            </ul>

            <p className="mt-4 text-xs font-semibold tracking-wide text-jpt-muted">
                ステータス色：フローが進むほど色が深くなる
            </p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
                {statusSwatches.map((status) => (
                    <li
                        key={status.label}
                        className="inline-flex items-center gap-1.5 rounded-full border border-jpt-border bg-white px-2.5 py-1 text-xs font-semibold text-jpt-dark"
                    >
                        <span className={`h-2 w-2 rounded-full ${status.className}`} aria-hidden />
                        {status.label}
                    </li>
                ))}
            </ul>

            <p className="mt-4 text-xs font-semibold tracking-wide text-jpt-muted">
                ボタンの押し心地（アプリと同じ設定の見本）
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    className="inline-flex h-10 items-center gap-1.5 rounded-md bg-jpt-red px-4 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:shadow-md hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2 active:scale-95"
                >
                    <Plus className="h-4 w-4" aria-hidden />
                    新規申請
                </button>
                <button
                    type="button"
                    className="inline-flex h-10 items-center rounded-md border border-jpt-border bg-white px-4 text-sm font-medium text-jpt-dark shadow-sm transition-all duration-150 hover:bg-jpt-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2 active:scale-95"
                >
                    下書き保存
                </button>
                <span className="text-xs leading-5 text-jpt-muted">
                    ホバーで影が強まり、押すと少し縮む。押せる場所が指先で分かる
                </span>
            </div>
        </div>
    );
}

const ideas: readonly Idea[] = [
    {
        number: '01',
        icon: RouteIcon,
        title: '画面を横断せず、1 案件も全案件も「通し」で見られる導線',
        background: (
            <>
                経営管理の仕事では、課題を見つけて仮説を立てるために、申請書・進捗表・予算表と
                複数の画面を横断して情報を集めることが多くありました。行き来する時間そのものが
                判断を遅らせるコストだと感じていました。
            </>
        ),
        implementation: (
            <>
                案件詳細は「申請 / 開発 / 予算 / 履歴」をタブで切り替え、1 つの案件の
                ライフサイクルを 1 画面で追えるようにしました。案件一覧も同じ画面のタブで
                表示列だけを切り替え、全案件を通しで俯瞰できます。一覧には検索バー・フィルタ・
                列ソート・ページネーションを置き、件数が増えても同じ画面で探し切れるようにしました。
            </>
        ),
        points: [
            '案件詳細：申請 / 開発 / 予算 / 履歴 を 1 画面でタブ切替',
            '案件一覧：申請 / 開発 / 予算 のタブで、同じ一覧の表示列だけを切替',
            '検索バー・フィルタ：案件名や主担当で部分一致検索し、部門・ステータス・進捗・消費率で絞り込む。条件は URL に保持され、ブラウザバックやブックマークで復元できる',
            'ページネーション：「全 N 件」はページをまたいだ総件数。ページ番号で行き来し、列見出しのクリックで並べ替える',
            'サイドバー：業務フェーズ軸（申請・承認 / 開発管理 / 予算管理）の 3 セクション',
        ],
        images: [
            {
                file: '09_projects_dev.png',
                alt: '開発進捗一覧。検索バーとフィルタの下に、申請・開発・予算のタブを持つ同じ一覧画面があり、タスク進捗・期限・主担当の列とページネーションが表示されている',
                caption: '開発進捗一覧。検索バーとフィルタの下に、タブで切り替わる列とページネーションを置く。',
            },
        ],
        docs: [
            { label: '案件一覧（申請タブ）の画面方針：検索・フィルタ・ページネーション・タブ', path: 'mockups/s03a_policy.md' },
            { label: '案件詳細の画面方針：タブ構成と設計上のこだわり', path: 'mockups/s04_policy.md' },
            { label: '画面遷移・URL 設計', path: 'materials/Design/screen_flow.md' },
        ],
    },
    {
        number: '02',
        icon: PenLine,
        title: '申請する人の立場を想像した UI と、企業の色を借りたデザイン',
        background: (
            <>
                申請は、たまにしか使わない人も行います。マニュアルを見なくても
                「これから何が起こるか」「今どこにいるか」が画面から分かることを目標に置きました。
                配色は、課題を出した企業の HP とロゴを参考にしました。見慣れた色で作られた画面のほうが、
                社内システムとして受け入れられやすいと考えたからです。
            </>
        ),
        implementation: (
            <>
                承認ステッパーで申請 → 部門承認 → 本部承認 → 承認済の 4 段階と、誰が・いつ
                判断したかを見せます。新規申請の画面にもステッパーを置き、これから進む手順を
                最初に示します。各入力項目には注釈を添え、説明文で画面を埋めずに要点だけ
                確認できるようにしました。色は「赤は最重要アクションだけ」と決め、
                ロゴのグラデーションを承認の進行表現に転用しています。
            </>
        ),
        points: [
            '承認ステッパー：申請画面・案件詳細・一覧のミニ版の 3 か所で現在地を表示。進行中のノードはパルスで「次は誰の番か」を示す',
            '注釈：申請フォームの各項目に ⓘ で要点を添え、説明文を画面に詰め込まない。「承認後は編集ロック」は 2 か所で伝える',
            'キーカラー：企業 HP のコーポレートレッドは CTA と却下だけに限定。ロゴのシアン → ブルー → パープルを承認の進行とサイドバーの配色に転用し、アンバーはタイトル横のアクセントに留める',
            'ステータス色：下書き → 部門承認待ち → 本部承認待ち → 承認済と、進むほど色が深くなる。色 + アイコン + テキストの 3 点セットで色覚特性にも配慮',
            'ボタンの押し心地：影を付け、ホバーで影を強め、押下で 95% に縮む 150ms のトランジション。カードはホバーで少し浮き、フォーカスリングは全要素で統一',
        ],
        extra: <ColorGuide />,
        images: [
            {
                file: '03_projects_create.png',
                alt: '新規案件申請画面。上部に承認フローのステッパー、各入力項目の横に注釈アイコンが並ぶ',
                caption: '新規申請。承認フローを先に見せ、各項目の ⓘ に注釈を添える。',
            },
        ],
        docs: [
            { label: 'デザインシステム：カラートークン・ステータス色・インタラクション', path: 'materials/Design/design_system.md' },
            { label: '新規申請画面の方針：注釈（Infotip）の置き方', path: 'mockups/s05_policy.md' },
            { label: '共通コンポーネント仕様：Infotip・承認ステッパー・Button', path: 'materials/Design/components_spec.md' },
            { label: 'サイドバー配色の変更指示書：フローが進むほど色が深くなる', path: 'materials/daily_reports/log/cursor_sidebar_redesign.md' },
        ],
    },
    {
        number: '03',
        icon: Columns3,
        title: '立場ごとに違う「見たい画面」を用意し、選べるようにする',
        background: (
            <>
                担当者は自分の手持ちタスク、部門管理者はメンバーの負荷の偏り、本部は全社の
                進捗と予算リスク。見たい単位が違うのに 1 つの画面へ押し込むと、誰にとっても
                使いにくくなります。
            </>
        ),
        implementation: (
            <>
                タスク一覧は、同じ URL の中でカンバン / メンバー別 / 一覧の 3 ビューを
                ピル型のトグルで切り替えます。タブではなくトグルにしたのは「同じデータを違う視点で見る」
                意味をはっきりさせるためで、カンバン単独案・マトリクス案と比較したうえで採用しました。
                ダッシュボードでは KPI と部門別の進捗、予算消費 70% 超の案件を抽出します。
                同じ案件一覧でも、ロールによって見える範囲（自分・自部門・全社）を
                サーバー側で切り替えます。
            </>
        ),
        points: [
            'タスク一覧：カンバン / メンバー別 / 一覧 の 3 ビュー。表示中のビューは URL に残り、ブックマークで復元できる',
            '4 値のステータス：未着手 / 進行中 / 確認待ち / 完了。どのビューでも同じ 4 値で揃え、部門ごとの管理手法の違いを吸収',
            'ダッシュボード：稼働案件・承認待ち・平均進捗・予算消費率の KPI と要注意案件',
            '閲覧範囲：申請者は自分、部門管理者は自部門、本部管理者は全社。本部のタスク操作は閲覧のみ',
        ],
        images: [
            {
                label: 'VIEW 1 ／ カンバン',
                file: '24_member_tasks_board.png',
                alt: 'タスク一覧のカンバンビュー。未着手・進行中・確認待ち・完了の 4 列にタスクカードが並び、期限超過のカードは赤枠で強調されている',
                caption: '4 列で手持ちタスクの流れを把握する。期限超過は赤枠、確認待ちは確認者の名前を添える。',
            },
            {
                label: 'VIEW 2 ／ メンバー別',
                file: '25_member_tasks_members.png',
                alt: 'タスク一覧のメンバー別ビュー。行がメンバー、列がステータスで、メンバーごとに期限超過件数と負荷バーが表示されている',
                caption: '行がメンバー、列がステータス。誰が何件抱え、負荷がどこに偏っているかを一望する。',
            },
            {
                label: 'VIEW 3 ／ 一覧',
                file: '26_member_tasks_list.png',
                alt: 'タスク一覧の一覧ビュー。タイトル・種類・優先度・ステータスの進捗バー・担当・確認者・期日が表形式で並ぶ',
                caption: '期限・優先度・確認者を列で並べる。表形式の網羅性で取りこぼしを防ぐ。',
            },
        ],
        docs: [
            { label: 'タスク一覧の画面方針：3 案の比較とビュートグル採用の理由', path: 'mockups/s14_policy.md' },
            { label: 'ダッシュボードの画面方針', path: 'mockups/s02_policy.md' },
            { label: 'ロール別機能マトリクス：誰が何を見られるか', path: 'materials/Design/role_feature_matrix_.md' },
        ],
    },
    {
        number: '04',
        icon: History,
        title: '監査証跡とログを、後から検証できる形で残す',
        background: (
            <>
                経理や監査対応の経験では、「誰が・いつ・何を・なぜ」を後から説明できることが
                前提でした。結果だけが上書きされたデータは、検証の材料になりません。
            </>
        ),
        implementation: (
            <>
                承認は独立したテーブルに、承認者・段階・日時・コメントをレコード単位で
                保存します。却下された案件は削除せず、再申請を新しい案件として親案件に紐づけて
                「改訂◯回目」を追跡します。タスクの変更と予算実績の更新も、変更前後の値と
                更新者を自動で記録します。
            </>
        ),
        points: [
            '承認履歴：承認者・段階・日時・コメントを 1 判断 1 レコードで保存',
            '再申請チェーン：元案件を残し、親案件 ID と改訂番号で経緯を追跡',
            'タスク変更履歴・予算実績履歴：担当・期日・進捗・金額の before / after を自動記録',
        ],
        images: [
            {
                file: '05_projects_show_history.png',
                alt: '案件詳細の履歴タブ。申請、部門承認、本部承認が人名と時刻つきで時系列に並ぶ',
                caption: '履歴タブ。申請 → 部門承認 → 本部承認を、人と時刻つきで時系列に表示する。',
            },
        ],
        docs: [
            { label: '設計思想：承認フローで監査証跡を残す理由、テーブル分離の比較', path: 'materials/Design/design-philosophy.md' },
            { label: 'ER 図：approvals・task_histories・project_budget_histories', path: 'materials/Design/er_diagram.md' },
        ],
    },
];

/** 工夫カードの箇条書き・補足・設計ドキュメントへのリンク */
function IdeaDetails({ idea, className }: { idea: Idea; className?: string }) {
    return (
        <div className={className}>
            <ul className="space-y-2">
                {idea.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-sm leading-6 text-jpt-dark">
                        <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-jpt-blue" aria-hidden />
                        <span>{point}</span>
                    </li>
                ))}
            </ul>

            {idea.extra}

            <div className="mt-5 rounded-lg border border-dashed border-jpt-border p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-jpt-muted">
                    <FileText className="h-3.5 w-3.5" aria-hidden />
                    この工夫の記録（設計・開発ドキュメント）
                </p>
                <ul className="mt-2.5 space-y-2">
                    {idea.docs.map((doc) => (
                        <li key={doc.path} className="min-w-0">
                            <a
                                href={`${GITHUB_BLOB}/${doc.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-start gap-1.5 text-sm leading-6 text-jpt-blue underline decoration-jpt-border underline-offset-4 hover:decoration-jpt-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue"
                            >
                                <span>{doc.label}</span>
                                <ExternalLink className="mt-1.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                            </a>
                            <span className="block break-all font-mono text-[11px] leading-4 text-jpt-muted">{doc.path}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

// ---------------------------------------------------------------------------
// 03 実装上の課題と解決
// ---------------------------------------------------------------------------

const challenges = [
    {
        problem: '部門管理者が自分で案件を申請すると、自分の申請を自分で承認できてしまう。',
        solution:
            '部門管理者の申請は部門承認をスキップして本部承認へ直行させる。ステッパーには「スキップ」、案件には「本部直行」バッジを出し、経緯が画面から分かるようにした。',
    },
    {
        problem: '承認の記録を案件テーブルの日時カラムで持つと、却下コメントや承認者の置き場がなく、再申請すると前回の記録が消える。',
        solution:
            '承認レコードを独立したテーブルに分けた。却下 → 再申請は新しい案件として複製し、親案件 ID と改訂番号でチェーンを追えるようにした。',
    },
    {
        problem: '予算の消費率を DB に保存すると、実績を更新したときに値がずれる。',
        solution:
            '入力値（予算額・実績額）だけを保持し、消費率は表示のたびに算出する。同じ意味の値を二重に持たない。',
    },
    {
        problem: '画面でボタンを隠しても、URL の直打ちや他部門の ID 指定で操作できてしまう。',
        solution:
            'ロール・部門・案件状態・担当関係を Laravel Policy でサーバー側でも判定する。権限境界は Feature テストで固定し、他部門の案件が見えないことをテストで確かめている。',
    },
    {
        problem: '担当者が自己判断で「完了」にすると、誰にも確認されないまま閉じてしまう。',
        solution:
            'ステータスを未着手 / 進行中 / 確認待ち / 完了の 4 値にし、確認待ち → 完了は確認者だけが操作できる。確認待ちへ変えるときは確認者の指定を必須にした。',
    },
    {
        problem: 'ローカルでは通るのに、本番（MySQL）だけ本部承認で 500 エラーになる。',
        solution:
            '通知種別カラムの ENUM 定義と PHP 側の Enum のずれが原因だった。MySQL 上で VARCHAR へ変更するマイグレーションを追加し、ネストしたトランザクションも見直して、本部承認の結合テストを足した。',
    },
    {
        problem: 'タスク更新後に元の一覧へ戻す URL が、オープンリダイレクト対策で拒否され、案件詳細へ飛んでしまう。',
        solution:
            '戻り先を相対パスだけで組み立て、サーバー側は許可するパス配下と同一ホストだけを通す検証に統一した。外部 URL・プロトコル相対 URL を含む 4 ケースをテスト化した。',
    },
    {
        problem: 'カンバンのドラッグ & ドロップで権限エラー（403）になると、画面上はカードが移動したまま残る。',
        solution:
            '先に画面を更新する楽観更新をやめ、サーバーの結果を受けてから反映する方式に統一した。',
    },
    {
        problem: '部門ごとに管理したい観点（種類・工程・優先度）が違い、1 つのフォーマットに押し込むと Excel に戻ってしまう。',
        solution:
            '統一したデータ構造の上に「種類・優先度・カテゴリ」の分類軸を持たせ、部門が自分に合う軸で運用できるようにした。フォーマットは共通なので、本部の集約は自動化できる。',
    },
    {
        problem: '承認された直後、次に何をすればよいかが分からず、開発フェーズへの移行が止まる。',
        solution:
            '本部承認と同時に初期タスク「実装計画作成」を自動投入し、担当者に申請者をプリセットする。通知は担当割当・期限・完了報告・確認 OK に絞り、通知過多を避けた。',
    },
] as const;

// ---------------------------------------------------------------------------
// 04 進め方
// ---------------------------------------------------------------------------

const processCards = [
    {
        title: '設計を先に、解像度を上げる',
        body: '100 時間のうち約 3 分の 1 を設計と環境構築に投資。ER 図、9 画面の HTML モック、システム仕様、デザイントークンを実装前に揃え、AI への指示回数と手戻りを減らした。',
    },
    {
        title: '判断は自分、実装は AI と分担',
        body: 'スコープ・要件・受け入れの最終判断は自分が持つ。Claude には設計整理と仕様の言語化、Cursor には実装と差分修正を任せ、生成コードはレビュー前提で取り込んだ。',
    },
    {
        title: '日次で「やらないこと」まで記録する',
        body: '設計の正本・日報・次セッションへの引継ぎの 3 層でドキュメントを更新。必須 / MVP / 後回しの 3 層でスコープを判断し、AI セッションをまたいでも文脈を失わないようにした。',
    },
] as const;

// ---------------------------------------------------------------------------
// 05 デモ
// ---------------------------------------------------------------------------

const demoRoles = [
    {
        role: '申請者',
        icon: UserRound,
        email: 'applicant@example.com',
        experience: '案件の起案、担当タスクの進捗更新、担当案件の予算実績入力',
    },
    {
        role: '部門管理者',
        icon: Users,
        email: 'dept@example.com',
        experience: '自部門案件の一次承認、タスクと予算の運用、メンバー別ビュー',
    },
    {
        role: '本部管理者',
        icon: Building2,
        email: 'hq@example.com',
        experience: '全社案件の最終承認、部門横断の進捗・予算確認。タスクは閲覧のみ',
    },
] as const;

const highlights = [
    '申請者で案件詳細を開き、申請 / 開発 / 予算 / 履歴 のタブを切り替える。1 案件の流れが 1 画面で追える',
    '部門管理者でタスク一覧を開き、カンバン / メンバー別 / 一覧 を切り替える。同じデータでも見え方が変わる',
    '「再申請：」で始まる案件を開く。案件 ID の横に「改訂 2 回目」、上部に元案件へのリンクが出る',
    '部門管理者で新規申請する。部門承認がスキップされ、ステッパーに「スキップ」、案件に「本部直行」が付く',
    '本部管理者でダッシュボードを開き、予算消費 70% 超の案件を確認する。タスクは閲覧だけで編集できない',
] as const;

// ---------------------------------------------------------------------------
// 06 技術
// ---------------------------------------------------------------------------

const technologies = [
    { term: 'バックエンド', description: 'Laravel 12 / PHP 8.2' },
    { term: 'フロントエンド', description: 'React 18 / TypeScript / Inertia.js 2 / Tailwind CSS' },
    { term: 'データベース', description: 'MySQL（テストは SQLite）。承認・タスク・予算の履歴を現在値と分けて保持' },
    { term: '認証・認可', description: 'Laravel Breeze / spatie/laravel-permission / Laravel Policy' },
    { term: 'グラフ', description: 'Recharts（ダッシュボードの KPI・部門別進捗）' },
    { term: 'テスト', description: 'PHPUnit Feature テスト。承認フロー・権限境界・再申請チェーン・変更履歴を検証' },
    { term: '公開環境', description: 'Laravel Cloud' },
] as const;

const documents = [
    {
        title: 'ソースコード',
        description: 'GitHub リポジトリ。README に業務フロー・ロール別権限・設計で重視したことをまとめている',
        href: GITHUB_URL,
    },
    {
        title: 'システム仕様',
        description: 'スコープ・DB・URL・ロール・承認・通知の正本',
        href: `${GITHUB_BLOB}/materials/Design/system_spec.md`,
    },
    {
        title: 'ER 図',
        description: 'テーブル・Enum・外部キー方針。将来拡張用のカラムも明示',
        href: `${GITHUB_BLOB}/materials/Design/er_diagram.md`,
    },
    {
        title: '設計思想',
        description: '承認フロー・ロール・タスク・予算それぞれで、なぜその構造にしたか',
        href: `${GITHUB_BLOB}/materials/Design/design-philosophy.md`,
    },
    {
        title: '画面遷移',
        description: '画面一覧・URL・ロール別の導線',
        href: `${GITHUB_BLOB}/materials/Design/screen_flow.md`,
    },
] as const;

// ---------------------------------------------------------------------------
// 部品
// ---------------------------------------------------------------------------

function SectionHeading({
    number,
    label,
    title,
    lead,
    id,
}: {
    number: string;
    label: string;
    title: ReactNode;
    lead?: ReactNode;
    id: string;
}) {
    return (
        <div className="max-w-3xl">
            <p className="font-mono text-xs font-semibold tracking-[0.2em] text-jpt-blue">
                {number}
                <span className="mx-2 text-jpt-border" aria-hidden>
                    ／
                </span>
                {label}
            </p>
            <h2 id={id} className="mt-3 text-[26px] font-bold leading-[1.4] tracking-tight text-jpt-dark sm:text-3xl">
                {title}
            </h2>
            {lead ? <div className="mt-4 text-base leading-8 text-jpt-muted">{lead}</div> : null}
        </div>
    );
}

function Screenshot({
    file,
    alt,
    caption,
    label,
    priority = false,
}: {
    file: string;
    alt: string;
    caption?: string;
    label?: string;
    priority?: boolean;
}) {
    return (
        <figure className="min-w-0">
            {label ? (
                <p className="mb-2 font-mono text-xs font-semibold tracking-[0.15em] text-jpt-blue">{label}</p>
            ) : null}
            <div className="overflow-hidden rounded-xl border border-jpt-border bg-white shadow-[0_18px_40px_-24px_rgba(33,36,41,0.35)]">
                <div className="flex items-center gap-1.5 border-b border-jpt-border bg-jpt-bg px-3 py-2" aria-hidden>
                    <span className="h-2.5 w-2.5 rounded-full bg-jpt-border" />
                    <span className="h-2.5 w-2.5 rounded-full bg-jpt-border" />
                    <span className="h-2.5 w-2.5 rounded-full bg-jpt-border" />
                </div>
                <img
                    src={shot(file)}
                    alt={alt}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    className="block w-full"
                />
            </div>
            {caption ? (
                <figcaption className="mt-3 text-sm leading-6 text-jpt-muted">{caption}</figcaption>
            ) : null}
        </figure>
    );
}

/** ページ内リンクのスクロールを滑らかにする（OS の「視差効果を減らす」設定は尊重） */
const ABOUT_STYLES = `
@media (prefers-reduced-motion: no-preference) {
    html { scroll-behavior: smooth; }
}
`;

const primaryButton =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-jpt-red px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#C4000F] focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2';

const secondaryButton =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-jpt-border bg-white px-4 py-2.5 text-sm font-semibold text-jpt-dark transition-colors hover:bg-jpt-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2';

// ---------------------------------------------------------------------------
// ページ本体
// ---------------------------------------------------------------------------

export default function AboutPage({ portfolioUrl, presentationUrl, onOpenManual }: AboutPageProps) {
    // 公開ページでは未ログイン時に auth.user が null になる。
    const { auth }: AboutPageSharedProps = usePage().props;
    const isAuthenticated = auth.user !== null;
    const appHref = isAuthenticated ? '/dashboard' : '/login';
    const appLabel = isAuthenticated ? 'アプリを開く' : 'デモにログイン';

    return (
        <>
            <Head title="このアプリについて" />
            <style>{ABOUT_STYLES}</style>

            <div className="min-h-screen overflow-x-hidden bg-white text-jpt-dark">
                <a
                    href="#about-main"
                    className="sr-only fixed left-4 top-4 z-50 rounded-md bg-white px-4 py-2 font-semibold text-jpt-dark shadow focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-jpt-blue"
                >
                    本文へ移動
                </a>

                {/* ヘッダー */}
                <header className="sticky top-0 z-30 border-b border-jpt-border bg-white/95 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
                        <Link
                            href="/manual?view=about"
                            className="flex min-w-0 items-center gap-2.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue focus-visible:ring-offset-2"
                            aria-label="ProjNexus このアプリについて"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-jpt-red">
                                <ApplicationLogo className="h-5 w-5 fill-white text-white" aria-hidden />
                            </span>
                            <span className="min-w-0 leading-tight">
                                <span className="block truncate text-base font-bold tracking-wide">ProjNexus</span>
                                <span className="hidden text-[11px] text-jpt-muted sm:block">開発管理アプリ</span>
                            </span>
                        </Link>

                        <nav className="hidden md:block" aria-label="ページ内リンク">
                            <ul className="flex items-center gap-1">
                                {navItems.map((item) => (
                                    <li key={item.href}>
                                        <a
                                            href={item.href}
                                            className="rounded-md px-3 py-2 text-sm font-medium text-jpt-dark transition-colors hover:bg-jpt-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue"
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <Link href={appHref} className={`${primaryButton} shrink-0 px-4`}>
                            {appLabel}
                            <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </div>
                </header>

                <main id="about-main">
                    {/* ヒーロー */}
                    <section
                        className="border-b border-jpt-border bg-[radial-gradient(ellipse_at_top_left,#EAF3FB_0%,#F8F9FA_55%,#FFFFFF_100%)]"
                        aria-labelledby="about-title"
                    >
                        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14 lg:pb-24">
                            <div className="max-w-2xl">
                                <p className="text-sm font-semibold leading-6 text-jpt-blue">
                                    開発管理プロセス一元化アプリ
                                    <span className="mx-2 text-jpt-border" aria-hidden>
                                        ／
                                    </span>
                                    個人開発ポートフォリオ
                                </p>
                                <h1
                                    id="about-title"
                                    className="mt-4 text-[30px] font-bold leading-[1.4] tracking-tight text-jpt-dark sm:text-[38px] sm:leading-[1.35]"
                                >
                                    申請・承認・開発進捗・予算を、案件を軸にひとつの流れで扱う。
                                </h1>
                                <div className="mt-7 space-y-4 text-base leading-8 text-jpt-muted">
                                    <p>
                                        架空企業の「申請システム・部門別 Excel・予算管理 Excel」に分かれた開発管理を、
                                        案件を中心に 1 つの Web アプリへまとめました。申請者・部門管理者・本部管理者の
                                        3 つの役割が、同じデータから次の行動を判断できる構造を目指しています。
                                    </p>
                                    <p>
                                        経理・管理会計・事業推進の経験をもとに、必要なデータ・操作できる人・見たい画面を
                                        先に言語化し、データ設計から認可・画面・テスト・公開までを一人で設計・実装しました。
                                    </p>
                                </div>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    <Link href={appHref} className={primaryButton}>
                                        {appLabel}
                                        <ArrowRight className="h-4 w-4" aria-hidden />
                                    </Link>
                                    <button type="button" onClick={onOpenManual} className={secondaryButton}>
                                        <BookOpen className="h-4 w-4" aria-hidden />
                                        操作マニュアル
                                    </button>
                                    <a
                                        href={GITHUB_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={secondaryButton}
                                    >
                                        <Code2 className="h-4 w-4" aria-hidden />
                                        ソースコード
                                    </a>
                                </div>
                            </div>

                            <Screenshot
                                file="04_projects_show_approved_apply.png"
                                alt="案件詳細画面。申請・開発・予算・履歴のタブと、申請から承認済までの 4 段階が完了した承認ステッパーが表示されている"
                                caption="案件詳細。承認ステッパーで現在地を示し、申請 / 開発 / 予算 / 履歴 を 1 画面で切り替える。"
                                priority
                            />
                        </div>
                    </section>

                    {/* 01 背景と課題 */}
                    <section id="background" className="scroll-mt-20 py-20 sm:py-24" aria-labelledby="background-title">
                        <div className="mx-auto max-w-6xl px-5 sm:px-6">
                            <SectionHeading
                                number="01"
                                label="背景と課題"
                                id="background-title"
                                title="課題でもらった要件と、そこから立てた仮説"
                                lead={
                                    <p>
                                        課題として提示された架空企業では、開発管理が 3 つのツールに分かれていました。
                                        必須要件は「案件の申請・承認」「承認済み案件の開発進捗管理」「予算消費状況の管理」の
                                        3 つ、役割は申請者・部門管理者・本部管理者の 3 つです。
                                    </p>
                                }
                            />

                            <div className="mt-10 grid gap-4 md:grid-cols-3">
                                {fragmentedTools.map((tool) => (
                                    <article key={tool.title} className="rounded-xl border border-jpt-border bg-white p-6">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-jpt-bg text-jpt-blue">
                                                <tool.icon className="h-5 w-5" aria-hidden />
                                            </span>
                                            <h3 className="text-base font-bold text-jpt-dark">{tool.title}</h3>
                                        </div>
                                        <p className="mt-4 text-sm leading-7 text-jpt-muted">{tool.body}</p>
                                    </article>
                                ))}
                            </div>

                            <div className="mt-12">
                                <h3 className="text-lg font-bold text-jpt-dark">ヒアリングで聞いた 3 つの役割の声</h3>
                                <ul className="mt-5 grid gap-4 md:grid-cols-3">
                                    {voices.map((voice) => (
                                        <li
                                            key={voice.role}
                                            className="flex gap-4 rounded-xl border border-jpt-border bg-jpt-bg px-5 py-5"
                                        >
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-jpt-blue ring-1 ring-jpt-border">
                                                <voice.icon className="h-4 w-4" aria-hidden />
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-jpt-muted">{voice.role}</p>
                                                <p className="mt-1 text-sm font-semibold leading-6 text-jpt-dark">
                                                    「{voice.quote}」
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-12 rounded-2xl border border-jpt-blue/30 bg-[#EAF3FB] p-6 sm:p-8">
                                <p className="font-mono text-xs font-semibold tracking-[0.2em] text-jpt-blue">
                                    私が立てた仮説
                                </p>
                                <h3 className="mt-3 text-xl font-bold leading-relaxed text-jpt-dark sm:text-2xl">
                                    部署ごとに Excel がバラバラなのは、現場の権限が強いから。
                                    <br className="hidden sm:block" />
                                    単機能の置き換えでは、結局 Excel に戻る。
                                </h3>
                                <div className="mt-5 grid gap-6 text-sm leading-7 text-jpt-dark md:grid-cols-2">
                                    <p>
                                        本社は業績管理のためにシステムを入れたい。一方、開発部門は自分たちの運用に合わせて
                                        作り込んだ Excel を手放したくない。管理項目や運用ルールは部門ごとに違い、
                                        統一フォーマットを 1 つ押しつけても定着しないと考えました。
                                    </p>
                                    <p>
                                        そこで PoC の目標を「Excel に戻らない設計」に置き、管理項目・運用ルールの違いを
                                        <strong className="font-bold">機能の選択肢で吸収する</strong>
                                        方針にしました。分類軸を複数持つタスク、3 つの表示ビュー、役割ごとの画面は、
                                        この仮説から出てきた実装です。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 02 私なりの工夫 */}
                    <section
                        id="ideas"
                        className="scroll-mt-20 border-y border-jpt-border bg-jpt-bg py-20 sm:py-24"
                        aria-labelledby="ideas-title"
                    >
                        <div className="mx-auto max-w-6xl px-5 sm:px-6">
                            <SectionHeading
                                number="02"
                                label="私なりの工夫"
                                id="ideas-title"
                                title="要件を、業務経験から膨らませた 4 つの工夫"
                                lead={
                                    <p>
                                        経営管理・経理・事業推進の仕事で「こういう画面があれば判断が速かった」と感じたことを、
                                        要件の外側から足しました。それぞれ、背景にある経験と、実装した形を並べています。
                                        検討の経緯は、各カードの末尾にある設計・開発ドキュメントから辿れます。
                                    </p>
                                }
                            />

                            <div className="mt-12 space-y-10">
                                {ideas.map((idea, index) => {
                                    // 複数枚のときは本文を 2 カラムに分け、画像は下段に横並びで置く
                                    const wide = idea.images.length > 1;
                                    const reverse = !wide && index % 2 === 1;
                                    return (
                                        <article
                                            key={idea.number}
                                            className="overflow-hidden rounded-2xl border border-jpt-border bg-white"
                                            aria-labelledby={`idea-${idea.number}`}
                                        >
                                            <div
                                                className={`grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10 ${
                                                    reverse ? 'lg:[&>figure]:order-first' : ''
                                                }`}
                                            >
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-sm font-semibold tracking-[0.2em] text-jpt-blue">
                                                            工夫 {idea.number}
                                                        </span>
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-jpt-bg text-jpt-blue">
                                                            <idea.icon className="h-4 w-4" aria-hidden />
                                                        </span>
                                                    </div>
                                                    <h3
                                                        id={`idea-${idea.number}`}
                                                        className="mt-3 text-xl font-bold leading-relaxed text-jpt-dark"
                                                    >
                                                        {idea.title}
                                                    </h3>

                                                    <dl className="mt-5 space-y-5">
                                                        <div>
                                                            <dt className="text-xs font-semibold tracking-wide text-jpt-muted">
                                                                背景にある経験
                                                            </dt>
                                                            <dd className="mt-1.5 text-sm leading-7 text-jpt-dark">
                                                                {idea.background}
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-xs font-semibold tracking-wide text-jpt-blue">
                                                                実装した形
                                                            </dt>
                                                            <dd className="mt-1.5 text-sm leading-7 text-jpt-dark">
                                                                {idea.implementation}
                                                            </dd>
                                                        </div>
                                                    </dl>

                                                    {!wide ? (
                                                        <IdeaDetails
                                                            idea={idea}
                                                            className="mt-5 border-t border-jpt-border pt-5"
                                                        />
                                                    ) : null}
                                                </div>

                                                {wide ? (
                                                    <IdeaDetails
                                                        idea={idea}
                                                        className="min-w-0 border-t border-jpt-border pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
                                                    />
                                                ) : (
                                                    <Screenshot
                                                        file={idea.images[0].file}
                                                        alt={idea.images[0].alt}
                                                        caption={idea.images[0].caption}
                                                    />
                                                )}

                                                {wide ? (
                                                    <div className="grid gap-6 border-t border-jpt-border pt-8 md:grid-cols-3 lg:col-span-2">
                                                        {idea.images.map((image) => (
                                                            <Screenshot
                                                                key={image.file}
                                                                file={image.file}
                                                                alt={image.alt}
                                                                caption={image.caption}
                                                                label={image.label}
                                                            />
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* 03 実装上の課題と解決 */}
                    <section id="challenges" className="scroll-mt-20 py-20 sm:py-24" aria-labelledby="challenges-title">
                        <div className="mx-auto max-w-6xl px-5 sm:px-6">
                            <SectionHeading
                                number="03"
                                label="実装上の課題"
                                id="challenges-title"
                                title="つまずいた課題と、その解決"
                                lead={
                                    <p>
                                        設計の段階で気づいたものと、動かしてから分かったものの両方です。
                                        「なぜその実装にしたか」を残すことを優先しました。
                                    </p>
                                }
                            />

                            <ol className="mt-10 space-y-3">
                                {challenges.map((item, index) => {
                                    const n = index + 1;
                                    return (
                                        <li
                                            key={n}
                                            className="grid gap-4 rounded-xl border border-jpt-border bg-white p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_2rem_minmax(0,1.15fr)] md:items-start md:gap-5"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold tracking-wide text-jpt-muted">課題 {n}</p>
                                                <p className="mt-1.5 text-sm leading-7 text-jpt-dark">{item.problem}</p>
                                            </div>
                                            <div className="hidden justify-center pt-6 text-jpt-border md:flex" aria-hidden>
                                                <MoveRight className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 border-t border-jpt-border pt-4 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                                                <p className="text-xs font-semibold tracking-wide text-jpt-blue">解決</p>
                                                <p className="mt-1.5 text-sm leading-7 text-jpt-dark">{item.solution}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>

                            <div className="mt-12 grid gap-8 lg:grid-cols-2">
                                <Screenshot
                                    file="31_hq_direct_badge.png"
                                    alt="部門管理者が申請した案件の承認画面。本部直行バッジが付き、ステッパーの部門承認がスキップ表示になっている"
                                    caption="課題 1 の解決。部門管理者の申請は「本部直行」となり、ステッパーの部門承認は「スキップ」で表示される。"
                                />
                                <Screenshot
                                    file="32_resubmission_chain.png"
                                    alt="再申請された案件の詳細。案件 ID の横に改訂 2 回目、上部に元案件へのリンクが表示されている"
                                    caption="課題 2 の解決。再申請は新しい案件として作られ、「改訂 2 回目」と元案件へのリンクで経緯を追える。"
                                />
                            </div>
                        </div>
                    </section>

                    {/* 04 進め方 */}
                    <section
                        id="process"
                        className="scroll-mt-20 border-y border-jpt-border bg-jpt-bg py-20 sm:py-24"
                        aria-labelledby="process-title"
                    >
                        <div className="mx-auto max-w-6xl px-5 sm:px-6">
                            <SectionHeading
                                number="04"
                                label="進め方"
                                id="process-title"
                                title="100 時間の PoC を、設計先行と AI 協働で進めた"
                                lead={
                                    <p>
                                        インターン課題として 5 週間・100 時間の枠で開発しました。実装を急ぐより、
                                        AI が迷わないための前提・制約・正本資料を先に整えることに時間を使っています。
                                    </p>
                                }
                            />

                            <div className="mt-10 grid gap-4 md:grid-cols-3">
                                {processCards.map((card, index) => (
                                    <article key={card.title} className="rounded-xl border border-jpt-border bg-white p-6">
                                        <p className="font-mono text-xs font-semibold tracking-[0.2em] text-jpt-blue">
                                            0{index + 1}
                                        </p>
                                        <h3 className="mt-3 text-base font-bold leading-7 text-jpt-dark">{card.title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-jpt-muted">{card.body}</p>
                                    </article>
                                ))}
                            </div>

                            <div className="mt-6 rounded-xl border border-jpt-border bg-white p-6">
                                <p className="text-xs font-semibold tracking-wide text-jpt-muted">想定外だったこと</p>
                                <p className="mt-2 text-sm leading-7 text-jpt-dark">
                                    画面モックの生成でトークン消費が想定より大きくなりました。画面数を絞り、
                                    同じデザインを流用する運用ルールに途中で切り替えています。
                                    AI のコストも設計の対象になることを学びました。
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* 05 デモ */}
                    <section id="demo" className="scroll-mt-20 py-20 sm:py-24" aria-labelledby="demo-title">
                        <div className="mx-auto max-w-6xl px-5 sm:px-6">
                            <SectionHeading
                                number="05"
                                label="デモ"
                                id="demo-title"
                                title="役割を選んで、動いているものを見る"
                                lead={
                                    <p>
                                        架空の部門・案件・タスク・通知のデータが入っています。役割によって見えるもの、
                                        操作できるものが変わるため、役割ごとにアカウントを用意しました。
                                    </p>
                                }
                            />

                            <ul className="mt-10 grid gap-4 md:grid-cols-3">
                                {demoRoles.map((item) => (
                                    <li key={item.role} className="rounded-xl border border-jpt-border bg-white p-6">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-jpt-bg text-jpt-blue">
                                                <item.icon className="h-5 w-5" aria-hidden />
                                            </span>
                                            <h3 className="text-base font-bold text-jpt-dark">{item.role}</h3>
                                        </div>
                                        <p className="mt-4 text-sm leading-7 text-jpt-dark">{item.experience}</p>
                                        <p className="mt-4 break-all font-mono text-xs text-jpt-muted">{item.email}</p>
                                    </li>
                                ))}
                            </ul>

                            <p className="mt-5 text-sm leading-7 text-jpt-muted">
                                パスワードはいずれも <code className="rounded bg-jpt-bg px-1.5 py-0.5 font-mono text-xs text-jpt-dark">password</code>{' '}
                                です。表示される部門・氏名・案件・金額はすべて架空のもので、実在の企業や人物とは関係ありません。
                            </p>

                            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
                                <div className="rounded-2xl border border-jpt-border bg-jpt-bg p-6 sm:p-8">
                                    <h3 className="flex items-center gap-2 text-lg font-bold text-jpt-dark">
                                        <ClipboardList className="h-5 w-5 text-jpt-blue" aria-hidden />
                                        見どころ
                                    </h3>
                                    <ol className="mt-5 space-y-4">
                                        {highlights.map((text, index) => (
                                            <li key={text} className="flex gap-3 text-sm leading-7 text-jpt-dark">
                                                <span
                                                    className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-jpt-blue ring-1 ring-jpt-border"
                                                    aria-hidden
                                                >
                                                    {index + 1}
                                                </span>
                                                <span>{text}</span>
                                            </li>
                                        ))}
                                    </ol>
                                    <Link href={appHref} className={`${primaryButton} mt-7 w-full sm:w-auto`}>
                                        {appLabel}
                                        <ArrowRight className="h-4 w-4" aria-hidden />
                                    </Link>
                                </div>

                                <Screenshot
                                    file="13_hq_manager_projects_index.png"
                                    alt="本部管理者の申請状況一覧。全部門の案件が並び、承認ステップ列に 4 つのドットのミニステッパーが表示されている"
                                    caption="本部管理者の申請状況一覧。全部門の案件が見え、承認ステップ列のミニステッパーで各案件の現在地が分かる。"
                                />
                            </div>
                        </div>
                    </section>

                    {/* 06 技術 */}
                    <section
                        id="tech"
                        className="scroll-mt-20 border-t border-jpt-border bg-jpt-bg py-20 sm:py-24"
                        aria-labelledby="tech-title"
                    >
                        <div className="mx-auto max-w-6xl px-5 sm:px-6">
                            <SectionHeading number="06" label="技術" id="tech-title" title="技術構成とドキュメント" />

                            <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-10">
                                <div className="rounded-2xl border border-jpt-border bg-white p-6 sm:p-8">
                                    <h3 className="flex items-center gap-2 text-lg font-bold text-jpt-dark">
                                        <LayoutDashboard className="h-5 w-5 text-jpt-blue" aria-hidden />
                                        技術構成
                                    </h3>
                                    <dl className="mt-5 divide-y divide-jpt-border">
                                        {technologies.map((technology) => (
                                            <div
                                                key={technology.term}
                                                className="grid gap-1 py-3.5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4"
                                            >
                                                <dt className="text-sm font-semibold text-jpt-dark">{technology.term}</dt>
                                                <dd className="min-w-0 break-words text-sm leading-6 text-jpt-muted">
                                                    {technology.description}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                    <p className="mt-5 flex gap-2.5 border-t border-jpt-border pt-5 text-sm leading-6 text-jpt-muted">
                                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-jpt-blue" aria-hidden />
                                        <span>
                                            独立した REST API は設けず、ルーティング → Form Request → Controller / Policy →
                                            Eloquent → Inertia の流れで処理しています。画面の表示・非表示だけに頼らず、
                                            サーバー側で操作可否を判定します。
                                        </span>
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-jpt-border bg-white p-6 sm:p-8">
                                    <h3 className="flex items-center gap-2 text-lg font-bold text-jpt-dark">
                                        <BookOpen className="h-5 w-5 text-jpt-blue" aria-hidden />
                                        ドキュメント
                                    </h3>
                                    <ul className="mt-5 divide-y divide-jpt-border">
                                        {documents.map((doc) => (
                                            <li key={doc.href}>
                                                <a
                                                    href={doc.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex items-start justify-between gap-4 py-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue"
                                                >
                                                    <span className="min-w-0">
                                                        <span className="block text-sm font-semibold text-jpt-dark group-hover:text-jpt-blue">
                                                            {doc.title}
                                                        </span>
                                                        <span className="mt-0.5 block text-sm leading-6 text-jpt-muted">
                                                            {doc.description}
                                                        </span>
                                                    </span>
                                                    <ExternalLink
                                                        className="mt-1 h-4 w-4 shrink-0 text-jpt-muted group-hover:text-jpt-blue"
                                                        aria-hidden
                                                    />
                                                </a>
                                            </li>
                                        ))}
                                        <li>
                                            <button
                                                type="button"
                                                onClick={onOpenManual}
                                                className="group flex w-full items-start justify-between gap-4 py-3.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue"
                                            >
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-semibold text-jpt-dark group-hover:text-jpt-blue">
                                                        操作マニュアル
                                                    </span>
                                                    <span className="mt-0.5 block text-sm leading-6 text-jpt-muted">
                                                        役割ごとの簡易版と、画面キャプチャ付きの詳細版
                                                    </span>
                                                </span>
                                                <ArrowRight
                                                    className="mt-1 h-4 w-4 shrink-0 text-jpt-muted group-hover:text-jpt-blue"
                                                    aria-hidden
                                                />
                                            </button>
                                        </li>
                                        <li>
                                            <a
                                                href={portfolioUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-start justify-between gap-4 py-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue"
                                            >
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-semibold text-jpt-dark group-hover:text-jpt-blue">
                                                        詳しい資料（印刷用）
                                                    </span>
                                                    <span className="mt-0.5 block text-sm leading-6 text-jpt-muted">
                                                        ケーススタディ形式のポートフォリオ資料
                                                    </span>
                                                </span>
                                                <ExternalLink
                                                    className="mt-1 h-4 w-4 shrink-0 text-jpt-muted group-hover:text-jpt-blue"
                                                    aria-hidden
                                                />
                                            </a>
                                        </li>
                                        {presentationUrl ? (
                                            <li>
                                                <a
                                                    href={presentationUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group flex items-start justify-between gap-4 py-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-jpt-blue"
                                                >
                                                    <span className="min-w-0">
                                                        <span className="block text-sm font-semibold text-jpt-dark group-hover:text-jpt-blue">
                                                            プレゼンテーション資料（PDF）
                                                        </span>
                                                        <span className="mt-0.5 block text-sm leading-6 text-jpt-muted">
                                                            課題の理解と仮説、実装した内容、UI の作り込み、今後の拡張、開発の進め方と振り返りをまとめた発表資料
                                                        </span>
                                                    </span>
                                                    <ExternalLink
                                                        className="mt-1 h-4 w-4 shrink-0 text-jpt-muted group-hover:text-jpt-blue"
                                                        aria-hidden
                                                    />
                                                </a>
                                            </li>
                                        ) : null}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-jpt-border bg-white">
                    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-8 text-sm leading-6 text-jpt-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p>個人開発のポートフォリオです。デモは架空の業務データを使用しています。</p>
                        <p className="font-semibold text-jpt-dark">ProjNexus — Project + Nexus（すべてが繋がる中心点）</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
