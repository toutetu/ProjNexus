import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { ArrowLeft, BookOpen } from 'lucide-react';

import ApplicationLogo from '@/Components/ApplicationLogo';

interface Props {
    markdown: string;
    updatedAt: string | null;
}

interface TocItem {
    id: string;
    label: string;
}

const ACCENT = '#EDB100';
const ACCENT_BG = '#FFF9E6';
const ACCENT_TEXT = '#7A5400';

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

    useEffect(() => {
        const article = document.querySelector('article#manual-body');
        if (!article) return;
        const headings = Array.from(article.querySelectorAll<HTMLHeadingElement>('h2[id]'));
        setTocItems(
            headings.map((h) => ({
                id: h.id,
                label: h.textContent?.trim() ?? '',
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
    }, [markdown]);

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
            <div className="min-h-screen bg-brand-bg text-brand-dark">
                <header className="sticky top-0 z-20 border-b border-brand-border bg-brand-dark text-white">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-brand-cyan via-brand-blue to-brand-purple">
                                <ApplicationLogo className="h-5 w-5 fill-white text-white" />
                            </span>
                            開発管理アプリ
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
                    <aside className="hidden w-64 shrink-0 md:block">
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
                                    return (
                                        <li key={item.id}>
                                            <a
                                                href={`#${item.id}`}
                                                className="block rounded-md px-3 py-1.5 leading-snug transition-colors hover:bg-[#FFF9E6] hover:text-[#7A5400]"
                                                style={
                                                    isActive
                                                        ? {
                                                              backgroundColor: ACCENT_BG,
                                                              color: ACCENT_TEXT,
                                                              fontWeight: 600,
                                                              borderLeft: `3px solid ${ACCENT}`,
                                                              paddingLeft: '9px',
                                                          }
                                                        : undefined
                                                }
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
                        <details className="mb-6 rounded-lg border border-brand-border bg-white px-4 py-3 text-sm md:hidden">
                            <summary
                                className="cursor-pointer font-semibold"
                                style={{ color: ACCENT_TEXT }}
                            >
                                目次を表示
                            </summary>
                            <ul className="mt-3 space-y-1">
                                {tocItems.map((item) => (
                                    <li key={item.id}>
                                        <a
                                            href={`#${item.id}`}
                                            className="block rounded px-2 py-1 hover:bg-[#FFF9E6]"
                                            style={{ color: ACCENT_TEXT }}
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </details>

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
                                    h1: ({ node, ...props }) => (
                                        <h1
                                            className="mb-6 border-b border-brand-border pb-3 text-3xl font-bold tracking-tight text-brand-dark"
                                            {...props}
                                        />
                                    ),
                                    h2: ({ node, ...props }) => (
                                        <h2
                                            className="mt-10 mb-4 border-l-4 pl-3 text-2xl font-bold text-brand-dark"
                                            style={{ borderColor: ACCENT }}
                                            {...props}
                                        />
                                    ),
                                    h3: ({ node, ...props }) => (
                                        <h3
                                            className="mt-7 mb-3 text-xl font-semibold text-brand-dark"
                                            {...props}
                                        />
                                    ),
                                    h4: ({ node, ...props }) => (
                                        <h4
                                            className="mt-5 mb-2 text-base font-semibold text-brand-dark"
                                            {...props}
                                        />
                                    ),
                                    p: ({ node, ...props }) => (
                                        <p className="my-3 leading-7 text-brand-dark" {...props} />
                                    ),
                                    a: ({ node, ...props }) => (
                                        <a
                                            className="font-medium underline decoration-2 underline-offset-2 hover:no-underline"
                                            style={{ color: ACCENT_TEXT, textDecorationColor: ACCENT }}
                                            {...props}
                                        />
                                    ),
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
                                        const isInline = !className;
                                        if (isInline) {
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
                                            <code className={className} {...props}>
                                                {children}
                                            </code>
                                        );
                                    },
                                    pre: ({ node, ...props }) => (
                                        <pre
                                            className="my-4 overflow-x-auto rounded-md bg-brand-dark p-4 text-xs leading-6 text-white"
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
                                {markdown}
                            </ReactMarkdown>
                        </article>
                    </main>
                </div>
            </div>
        </>
    );
}
