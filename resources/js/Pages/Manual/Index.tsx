import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { ArrowLeft, BookOpen, Menu, X } from 'lucide-react';

import ApplicationLogo from '@/Components/ApplicationLogo';
import { Infotip } from '@/Components/ui/infotip';

interface Props {
    markdown: string;
    updatedAt: string | null;
}

interface TocItem {
    id: string;
    label: string;
    level: 1 | 2;
}

const ACCENT = '#EDB100';
const ACCENT_BG = '#FFF9E6';
const ACCENT_TEXT = '#7A5400';

/** quick_manual に残っている場合のみ除去（本文では H1 横の Infotip に表示） */
const QUICK_MANUAL_OPTIONAL_BLOCKQUOTE =
    /^# 利用マニュアル（簡易版）\n\n> 各ロールが「最低限の業務を一周」できるクイックリファレンスです。\n\n/m;

const extractHeadingText = (children: ReactNode): string => {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) {
        return children.map(extractHeadingText).join('');
    }
    if (children && typeof children === 'object' && 'props' in (children as object)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return extractHeadingText((children as any).props?.children);
    }
    return '';
};

const headingAnchorId = (text: string): string | undefined => {
    if (text.includes('（簡易版）')) return 'top';
    if (text.includes('（詳細版）')) return 'detailed';
    return undefined;
};

const PRINT_STYLES = `
@media print {
    @page { size: A4; margin: 12mm 14mm; }

    body { background: #fff !important; }

    header,
    aside,
    .manual-print-hide,
    #detailed,
    #detailed ~ * {
        display: none !important;
    }

    .manual-body {
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        font-size: 10.5pt;
        line-height: 1.5;
    }

    .manual-body h1 {
        font-size: 18pt;
        margin-bottom: 8pt;
        padding-bottom: 4pt;
    }

    .manual-body h2 {
        font-size: 13pt;
        margin-top: 10pt;
        margin-bottom: 6pt;
        page-break-after: avoid;
    }

    .manual-body h3 {
        font-size: 11.5pt;
        margin-top: 8pt;
        page-break-after: avoid;
    }

    .manual-body table { font-size: 9.5pt; page-break-inside: avoid; }
    .manual-body img { max-width: 100%; page-break-inside: avoid; }
    .manual-body blockquote { page-break-inside: avoid; }

    .manual-body pre.manual-ascii-pre {
        background: #f4f6f9 !important;
        color: #1a1a1a !important;
        border: 1px solid #ccc !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        page-break-inside: avoid;
        white-space: pre !important;
        overflow-x: auto !important;
        font-size: 7.5pt;
        line-height: 1.35;
    }

    .manual-body pre.manual-ascii-pre code {
        background: transparent !important;
        color: inherit !important;
        white-space: pre !important;
    }

    .manual-body .page-break { page-break-before: always; display: block; height: 0; }

    .manual-quick-intro-tooltip {
        visibility: visible !important;
        opacity: 1 !important;
        position: static !important;
        pointer-events: auto !important;
        margin-top: 0.5rem !important;
        width: 100% !important;
        max-width: none !important;
    }
}
`;

const formatUpdatedAt = (iso: string | null): string => {
    if (!iso) return '—';
    const dt = new Date(iso);
    if (Number.isNaN(dt.getTime())) return iso;
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
};

export default function ManualIndex({ markdown, updatedAt }: Props) {
    const [tocItems, setTocItems] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);

    const { manualMarkdown, showQuickManualIntroInfotip } = useMemo(() => {
        const stripped = markdown.replace(QUICK_MANUAL_OPTIONAL_BLOCKQUOTE, '# 利用マニュアル（簡易版）\n\n');
        const startsQuick = /^\s*# 利用マニュアル（簡易版）/.test(markdown);
        return {
            manualMarkdown: stripped,
            showQuickManualIntroInfotip: startsQuick,
        };
    }, [markdown]);

    const scrollToHeading = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', `#${id}`);
        setActiveId(id);
        setMobileTocOpen(false);
    };

    useEffect(() => {
        const article = document.querySelector('article#manual-body');
        if (!article) return;
        const headings = Array.from(
            article.querySelectorAll<HTMLHeadingElement>('h1[id], h2[id]'),
        );
        setTocItems(
            headings.map((h) => ({
                id: h.id,
                label: h.textContent?.trim() ?? '',
                level: h.tagName === 'H1' ? 1 : 2,
            })),
        );

        if (headings.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
                if (visible[0]) {
                    setActiveId(visible[0].target.id);
                }
            },
            { rootMargin: '-80px 0px -65% 0px', threshold: [0, 1] },
        );
        headings.forEach((h) => observer.observe(h));
        return () => observer.disconnect();
    }, [manualMarkdown]);

    const transformImageUri = useMemo(
        () =>
            (src?: string) => {
                if (!src) return '';
                if (src.startsWith('images/')) {
                    return `/manual/assets/${src.slice('images/'.length)}`;
                }
                return src;
            },
        [],
    );

    return (
        <>
            <Head title="利用マニュアル" />
            <style>{PRINT_STYLES}</style>
            <div className="min-h-screen bg-brand-bg text-brand-dark">
                <header className="sticky top-0 z-20 border-b border-brand-border bg-brand-dark text-white">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-brand-cyan via-brand-blue to-brand-purple">
                                <ApplicationLogo className="h-5 w-5 fill-white text-white" />
                            </span>
                            <span className="flex flex-col leading-tight">
                                <span className="text-[10px] font-medium text-white/80">
                                    開発管理アプリ
                                </span>
                                <span className="text-base font-bold tracking-wide text-white">
                                    ProjNexus
                                </span>
                            </span>
                            <span
                                className="ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                                style={{ backgroundColor: ACCENT_BG, color: ACCENT_TEXT }}
                            >
                                <BookOpen className="h-3 w-3" />
                                利用マニュアル
                            </span>
                        </Link>
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            アプリへ戻る
                        </Link>
                    </div>
                </header>

                <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6 md:py-12">
                    <aside className="hidden w-64 shrink-0 lg:block">
                        <nav className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
                            <p
                                className="mb-3 text-xs font-semibold uppercase tracking-wider"
                                style={{ color: ACCENT_TEXT }}
                            >
                                目次
                            </p>
                            <ul className="space-y-1 text-sm">
                                {tocItems.map((item) => {
                                    const isActive = item.id === activeId;
                                    const isGroup = item.level === 1;
                                    const baseStyle: CSSProperties = isGroup
                                        ? {
                                              color: ACCENT_TEXT,
                                              fontWeight: 700,
                                              fontSize: '0.78rem',
                                              letterSpacing: '0.02em',
                                              textTransform: 'uppercase',
                                          }
                                        : {};
                                    const activeStyle: CSSProperties = isActive
                                        ? {
                                              backgroundColor: ACCENT_BG,
                                              color: ACCENT_TEXT,
                                              fontWeight: 600,
                                              borderLeft: `3px solid ${ACCENT}`,
                                              paddingLeft: '9px',
                                          }
                                        : {};
                                    return (
                                        <li
                                            key={item.id}
                                            className={isGroup ? 'mt-3 first:mt-0' : ''}
                                        >
                                            <a
                                                href={`#${item.id}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    scrollToHeading(item.id);
                                                }}
                                                className={`block rounded-md px-3 py-1.5 leading-snug transition-colors hover:bg-[#FFF9E6] hover:text-[#7A5400] ${
                                                    isGroup ? '' : 'pl-5'
                                                }`}
                                                style={{ ...baseStyle, ...activeStyle }}
                                            >
                                                {item.label}
                                            </a>
                                        </li>
                                    );
                                })}
                            </ul>
                        </nav>
                    </aside>

                    <main className="min-w-0 flex-1">
                        <div className="mb-6 lg:hidden">
                            <button
                                type="button"
                                onClick={() => setMobileTocOpen((prev) => !prev)}
                                className="inline-flex items-center gap-2 rounded-md border border-brand-border bg-white px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-bg"
                                aria-expanded={mobileTocOpen}
                                aria-controls="mobile-manual-toc"
                            >
                                {mobileTocOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                                目次
                            </button>

                            {mobileTocOpen && (
                                <div
                                    id="mobile-manual-toc"
                                    className="mt-3 rounded-lg border border-brand-border bg-white p-3 text-sm shadow-sm"
                                >
                                    <ul className="space-y-1">
                                        {tocItems.map((item) => (
                                            <li key={item.id}>
                                                <a
                                                    href={`#${item.id}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        scrollToHeading(item.id);
                                                    }}
                                                    className="block rounded px-2 py-1 hover:bg-[#FFF9E6]"
                                                    style={{ color: ACCENT_TEXT }}
                                                >
                                                    {item.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <article
                            id="manual-body"
                            className="manual-body rounded-xl border border-brand-border bg-white px-6 py-8 shadow-sm sm:px-10"
                        >
                            <p className="mb-6 text-xs text-brand-muted">
                                最終更新日：{formatUpdatedAt(updatedAt)}
                            </p>
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeSlug]}
                                urlTransform={transformImageUri}
                                components={{
                                    h1: ({ node, ...props }) => {
                                        const text = extractHeadingText(props.children);
                                        const anchorId = headingAnchorId(text);
                                        if (anchorId === 'top' && showQuickManualIntroInfotip) {
                                            return (
                                                <>
                                                    <div className="mb-6 scroll-mt-20 border-b border-brand-border pb-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h1
                                                                {...props}
                                                                id={
                                                                    anchorId ??
                                                                    (props as { id?: string }).id
                                                                }
                                                                className="mb-0 shrink-0 border-0 pb-0 text-3xl font-bold tracking-tight text-brand-dark"
                                                            />
                                                            <div className="flex shrink-0 items-center gap-1.5">
                                                                <Infotip
                                                                    ariaLabel="簡易版マニュアルについて"
                                                                    align="left"
                                                                    tooltipClassName="manual-quick-intro-tooltip"
                                                                >
                                                                    <p className="m-0">
                                                                        各ロールが「最低限の業務を一周」できるクイックリファレンスです。
                                                                    </p>
                                                                </Infotip>
                                                                <Infotip
                                                                    ariaLabel="印刷レイアウトと詳細版マニュアルについて"
                                                                    align="left"
                                                                    tooltipClassName="manual-quick-intro-tooltip"
                                                                >
                                                                    <p className="m-0">
                                                                        印刷すると{' '}
                                                                        <strong>
                                                                            ロールごとに A4 1 枚 × 3 ページ
                                                                        </strong>{' '}
                                                                        に分かれます。
                                                                    </p>
                                                                    <p className="mt-2 m-0">
                                                                        詳しい操作・状態遷移・FAQ
                                                                        は、下の「▼
                                                                        詳細版マニュアルを見る」から参照してください。
                                                                    </p>
                                                                </Infotip>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href="#detailed"
                                                        className="manual-print-hide -mt-2 mb-6 flex items-center justify-between gap-3 rounded-lg border-2 px-5 py-4 text-base font-semibold no-underline shadow-sm transition-shadow hover:shadow-md"
                                                        style={{
                                                            borderColor: ACCENT,
                                                            backgroundColor: ACCENT_BG,
                                                            color: ACCENT_TEXT,
                                                        }}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            scrollToHeading('detailed');
                                                        }}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <BookOpen className="h-5 w-5" />
                                                            ▼ 詳細版マニュアルを見る
                                                        </span>
                                                        <span className="text-xl" aria-hidden>
                                                            →
                                                        </span>
                                                    </a>
                                                </>
                                            );
                                        }
                                        return (
                                            <h1
                                                {...props}
                                                id={anchorId ?? (props as { id?: string }).id}
                                                className="mb-6 scroll-mt-20 border-b border-brand-border pb-3 text-3xl font-bold tracking-tight text-brand-dark"
                                            />
                                        );
                                    },
                                    h2: ({ node, ...props }) => (
                                        <h2
                                            className="mt-10 mb-4 scroll-mt-20 border-l-4 pl-3 text-2xl font-bold text-brand-dark"
                                            style={{ borderColor: ACCENT }}
                                            {...props}
                                        />
                                    ),
                                    h3: ({ node, ...props }) => (
                                        <h3
                                            className="mt-7 mb-3 scroll-mt-20 text-xl font-semibold text-brand-dark"
                                            {...props}
                                        />
                                    ),
                                    h4: ({ node, ...props }) => (
                                        <h4
                                            className="mt-5 mb-2 scroll-mt-20 text-base font-semibold text-brand-dark"
                                            {...props}
                                        />
                                    ),
                                    p: ({ node, ...props }) => (
                                        <p className="my-3 leading-7 text-brand-dark" {...props} />
                                    ),
                                    a: ({ node, ...props }) => {
                                        const href = (props as { href?: string }).href ?? '';
                                        if (href === '#detailed') {
                                            return (
                                                <a
                                                    {...props}
                                                    className="manual-print-hide my-6 flex items-center justify-between gap-3 rounded-lg border-2 px-5 py-4 text-base font-semibold no-underline shadow-sm transition-shadow hover:shadow-md"
                                                    style={{
                                                        borderColor: ACCENT,
                                                        backgroundColor: ACCENT_BG,
                                                        color: ACCENT_TEXT,
                                                    }}
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <BookOpen className="h-5 w-5" />
                                                        {props.children}
                                                    </span>
                                                    <span className="text-xl" aria-hidden>
                                                        →
                                                    </span>
                                                </a>
                                            );
                                        }
                                        if (href === '#top') {
                                            return (
                                                <a
                                                    {...props}
                                                    className="manual-print-hide inline-flex items-center gap-1 rounded-md border border-brand-border bg-white px-3 py-1.5 text-xs font-medium no-underline hover:bg-brand-bg"
                                                    style={{ color: ACCENT_TEXT }}
                                                />
                                            );
                                        }
                                        return (
                                            <a
                                                className="font-medium underline decoration-2 underline-offset-2 hover:no-underline"
                                                style={{ color: ACCENT_TEXT, textDecorationColor: ACCENT }}
                                                {...props}
                                            />
                                        );
                                    },
                                    ul: ({ node, ...props }) => (
                                        <ul className="my-3 list-disc space-y-1 pl-6" {...props} />
                                    ),
                                    ol: ({ node, ...props }) => (
                                        <ol className="my-3 list-decimal space-y-1 pl-6" {...props} />
                                    ),
                                    li: ({ node, ...props }) => (
                                        <li className="leading-7 text-brand-dark" {...props} />
                                    ),
                                    blockquote: ({ node, ...props }) => (
                                        <blockquote
                                            className="my-4 rounded-md border-l-4 px-4 py-3"
                                            style={{
                                                borderColor: ACCENT,
                                                backgroundColor: ACCENT_BG,
                                                color: ACCENT_TEXT,
                                            }}
                                            {...props}
                                        />
                                    ),
                                    hr: () => <hr className="my-8 border-brand-border" />,
                                    table: ({ node, ...props }) => (
                                        <div className="my-4 overflow-x-auto">
                                            <table
                                                className="min-w-full border-collapse border border-brand-border text-sm"
                                                {...props}
                                            />
                                        </div>
                                    ),
                                    thead: ({ node, ...props }) => (
                                        <thead
                                            style={{
                                                backgroundColor: ACCENT_BG,
                                                color: ACCENT_TEXT,
                                            }}
                                            {...props}
                                        />
                                    ),
                                    th: ({ node, ...props }) => (
                                        <th
                                            className="border border-brand-border px-3 py-2 text-left font-semibold"
                                            {...props}
                                        />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td
                                            className="border border-brand-border px-3 py-2 align-top"
                                            {...props}
                                        />
                                    ),
                                    code: ({ node, className, children, ...props }) => {
                                        const codeText = String(children ?? '');
                                        const isBlockCode =
                                            (className ?? '').includes('language-') ||
                                            codeText.includes('\n');
                                        if (!isBlockCode) {
                                            return (
                                                <code
                                                    className="rounded bg-brand-bg px-1.5 py-0.5 font-mono text-[0.85em]"
                                                    style={{ color: ACCENT_TEXT }}
                                                    {...props}
                                                >
                                                    {children}
                                                </code>
                                            );
                                        }
                                        return (
                                            <code
                                                className={[
                                                    className ?? '',
                                                    'manual-ascii-code block w-max min-w-full whitespace-pre font-mono text-[12px] leading-[1.45] text-brand-dark sm:text-[13px]',
                                                ]
                                                    .filter(Boolean)
                                                    .join(' ')}
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },
                                    pre: ({ node, ...props }) => (
                                        <pre
                                            className="manual-ascii-pre my-4 max-w-full overflow-x-auto rounded-md border border-brand-border bg-[#f4f6f9] p-3 shadow-sm sm:p-4"
                                            {...props}
                                        />
                                    ),
                                    img: ({ node, ...props }) => (
                                        <img
                                            className="my-4 rounded-md border border-brand-border shadow-sm"
                                            loading="lazy"
                                            {...props}
                                        />
                                    ),
                                    em: ({ node, ...props }) => (
                                        <em
                                            className="block text-center text-xs not-italic"
                                            style={{ color: ACCENT_TEXT }}
                                            {...props}
                                        />
                                    ),
                                    strong: ({ node, ...props }) => (
                                        <strong className="font-semibold text-brand-dark" {...props} />
                                    ),
                                }}
                            >
                                {manualMarkdown}
                            </ReactMarkdown>
                        </article>
                    </main>
                </div>
            </div>
        </>
    );
}
