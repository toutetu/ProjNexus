import { Head, Link } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import mermaid from 'mermaid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { ArrowLeft, BookOpen, ChevronDown, ChevronRight, Info, Menu, X } from 'lucide-react';

import ApplicationLogo from '@/Components/ApplicationLogo';
import { Infotip } from '@/Components/ui/infotip';
import PortfolioEmbed from '@/Pages/Manual/PortfolioEmbed';

interface Props {
    markdown: string;
    updatedAt: string | null;
    portfolioUrl: string;
}

type ManualView = 'about' | 'manual';

const viewFromLocation = (): ManualView => {
    if (typeof window === 'undefined') return 'manual';
    return new URLSearchParams(window.location.search).get('view') === 'about'
        ? 'about'
        : 'manual';
};

interface TocItem {
    id: string;
    label: string;
    level: 1 | 2 | 3;
    children?: TocItem[];
}

function buildTocTree(headings: HTMLHeadingElement[]): TocItem[] {
    const roots: TocItem[] = [];
    let currentH1: TocItem | null = null;
    let currentH2: TocItem | null = null;

    for (const el of headings) {
        const id = el.id;
        const label = el.textContent?.trim() ?? '';
        if (el.tagName === 'H1') {
            currentH2 = null;
            const n: TocItem = { id, label, level: 1, children: [] };
            roots.push(n);
            currentH1 = n;
        } else if (el.tagName === 'H2') {
            const n: TocItem = { id, label, level: 2, children: [] };
            if (currentH1?.children) {
                currentH1.children.push(n);
            } else {
                roots.push(n);
            }
            currentH2 = n;
        } else if (el.tagName === 'H3') {
            const n: TocItem = { id, label, level: 3, children: [] };
            if (currentH2?.children) {
                currentH2.children.push(n);
            } else if (currentH1?.children) {
                currentH1.children.push(n);
            } else {
                roots.push(n);
            }
        }
    }
    return roots;
}

function collectH2IdsWithChildH3(nodes: TocItem[]): string[] {
    const out: string[] = [];
    const walk = (ns: TocItem[]) => {
        for (const n of ns) {
            if (
                n.level === 2 &&
                n.children?.some((c) => c.level === 3)
            ) {
                out.push(n.id);
            }
            if (n.children?.length) walk(n.children);
        }
    };
    walk(nodes);
    return out;
}

function findParentH2IdForHeading(nodes: TocItem[], targetId: string): string | null {
    for (const n of nodes) {
        if (n.level === 2 && n.children?.some((c) => c.id === targetId)) {
            return n.id;
        }
        if (n.children?.length) {
            const inner = findParentH2IdForHeading(n.children, targetId);
            if (inner) return inner;
        }
    }
    return null;
}

type ManualTocNavProps = {
    tree: TocItem[];
    expandedH2Ids: Set<string>;
    onToggleChapter: (id: string) => void;
    onOpenChapter: (id: string) => void;
    onExpandAll: () => void;
    activeId: string;
    onPick: (id: string) => void;
    compact?: boolean;
};

function ManualTocNav({
    tree,
    expandedH2Ids,
    onToggleChapter,
    onOpenChapter,
    onExpandAll,
    activeId,
    onPick,
    compact,
}: ManualTocNavProps) {
    const linkPad = compact ? 'px-2 py-1' : 'px-3 py-1.5';
    const h3Pad = compact ? 'pl-4 py-0.5' : 'pl-5 py-1';

    const activeStyle = (isActive: boolean): CSSProperties =>
        isActive
            ? {
                  backgroundColor: ACCENT_BG,
                  color: ACCENT_TEXT,
                  fontWeight: 600,
                  borderLeft: `3px solid ${ACCENT}`,
                  paddingLeft: compact ? '5px' : '9px',
              }
            : {};

    const renderH2 = (node: TocItem) => {
        const hasH3 = node.children?.some((c) => c.level === 3) ?? false;
        const open = expandedH2Ids.has(node.id);
        const isActive = activeId === node.id;
        const h3List = node.children?.filter((c) => c.level === 3) ?? [];

        return (
            <li key={node.id} className="space-y-0.5">
                <div className="flex items-start gap-0.5">
                    {hasH3 ? (
                        <button
                            type="button"
                            className="mt-0.5 shrink-0 rounded p-0.5 text-jpt-muted hover:bg-jpt-bg hover:text-jpt-dark"
                            aria-expanded={open}
                            aria-controls={`toc-h2-${node.id}`}
                            id={`toc-h2-btn-${node.id}`}
                            onClick={() => onToggleChapter(node.id)}
                        >
                            {open ? (
                                <ChevronDown className="h-4 w-4" aria-hidden />
                            ) : (
                                <ChevronRight className="h-4 w-4" aria-hidden />
                            )}
                        </button>
                    ) : (
                        <span className="w-5 shrink-0" aria-hidden />
                    )}
                    <a
                        href={`#${node.id}`}
                        id={hasH3 ? `toc-h2-link-${node.id}` : undefined}
                        className={`min-w-0 flex-1 rounded-md leading-snug transition-colors hover:bg-[#FFF9E6] hover:text-[#7A5400] ${linkPad} ${
                            hasH3 ? '' : 'pl-0'
                        }`}
                        style={{
                            color: ACCENT_TEXT,
                            fontWeight: 600,
                            fontSize: compact ? '0.8rem' : '0.82rem',
                            ...activeStyle(isActive),
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            if (hasH3 && !open) {
                                onOpenChapter(node.id);
                            }
                            onPick(node.id);
                        }}
                    >
                        {node.label}
                    </a>
                </div>
                {hasH3 && open ? (
                    <ul
                        id={`toc-h2-${node.id}`}
                        role="region"
                        aria-labelledby={
                            hasH3
                                ? `toc-h2-btn-${node.id} toc-h2-link-${node.id}`
                                : undefined
                        }
                        className="ml-5 space-y-0.5 border-l border-jpt-border/50 pl-2"
                    >
                        {h3List.map((h3) => {
                            const h3Active = activeId === h3.id;
                            return (
                                <li key={h3.id}>
                                    <a
                                        href={`#${h3.id}`}
                                        className={`block rounded-md text-xs leading-snug text-jpt-dark transition-colors hover:bg-[#FFF9E6] hover:text-[#7A5400] ${h3Pad}`}
                                        style={activeStyle(h3Active)}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onPick(h3.id);
                                        }}
                                    >
                                        {h3.label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                ) : null}
            </li>
        );
    };

    return (
        <>
            <button
                type="button"
                className={`mb-3 w-full rounded-md border border-jpt-border bg-white text-xs font-semibold text-jpt-dark shadow-sm transition-colors hover:bg-jpt-bg ${
                    compact ? 'py-1.5' : 'py-2'
                }`}
                onClick={onExpandAll}
            >
                全部表示
            </button>
            <ul className="space-y-1 text-sm">
                {tree.map((h1) => (
                    <li key={h1.id} className="mt-3 first:mt-0">
                        <a
                            href={`#${h1.id}`}
                            className={`block rounded-md font-bold tracking-tight transition-colors hover:bg-[#FFF9E6] hover:text-[#7A5400] ${linkPad}`}
                            style={{
                                color: ACCENT_TEXT,
                                fontSize: compact ? '0.8rem' : '0.82rem',
                                ...activeStyle(activeId === h1.id),
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                onPick(h1.id);
                            }}
                        >
                            {h1.label}
                        </a>
                        {h1.children?.length ? (
                            <ul className="mt-1.5 space-y-1 border-l border-jpt-border/40 pl-2">
                                {h1.children.map((c) => {
                                    if (c.level === 2) {
                                        return renderH2(c);
                                    }
                                    if (c.level === 3) {
                                        const h3Active = activeId === c.id;
                                        return (
                                            <li key={c.id}>
                                                <a
                                                    href={`#${c.id}`}
                                                    className={`block rounded-md text-xs leading-snug text-jpt-dark transition-colors hover:bg-[#FFF9E6] hover:text-[#7A5400] ${h3Pad}`}
                                                    style={activeStyle(h3Active)}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        onPick(c.id);
                                                    }}
                                                >
                                                    {c.label}
                                                </a>
                                            </li>
                                        );
                                    }
                                    return null;
                                })}
                            </ul>
                        ) : null}
                    </li>
                ))}
            </ul>
        </>
    );
}

mermaid.initialize({ startOnLoad: false, theme: 'neutral', fontFamily: 'sans-serif' });

let mermaidCounter = 0;

const MermaidDiagram = ({ chart }: { chart: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const id = useRef(`mermaid-${++mermaidCounter}`);

    useEffect(() => {
        let cancelled = false;
        if (!containerRef.current) return;
        mermaid.render(id.current, chart.trim()).then(({ svg }) => {
            if (!cancelled && containerRef.current) {
                containerRef.current.innerHTML = svg;
            }
        }).catch(() => {});
        return () => { cancelled = true; };
    }, [chart]);

    return <div ref={containerRef} className="my-4 flex justify-center overflow-x-auto" />;
};

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
    .manual-view-switcher,
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

export default function ManualIndex({ markdown, updatedAt, portfolioUrl }: Props) {
    const [tocTree, setTocTree] = useState<TocItem[]>([]);
    const [expandedH2Ids, setExpandedH2Ids] = useState<Set<string>>(() => new Set());
    const [activeId, setActiveId] = useState<string>('');
    const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);
    const [activeView, setActiveView] = useState<ManualView>(viewFromLocation);

    const { manualMarkdown, showQuickManualIntroInfotip } = useMemo(() => {
        const stripped = markdown.replace(QUICK_MANUAL_OPTIONAL_BLOCKQUOTE, '# 利用マニュアル（簡易版）\n\n');
        const startsQuick = /^\s*# 利用マニュアル（簡易版）/.test(markdown);
        return {
            manualMarkdown: stripped,
            showQuickManualIntroInfotip: startsQuick,
        };
    }, [markdown]);

    const scrollToHeading = useCallback((id: string) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', `#${id}`);
        setActiveId(id);
        setMobileTocOpen(false);
    }, []);

    const switchView = useCallback((view: ManualView) => {
        setActiveView(view);
        setMobileTocOpen(false);

        const url = new URL(window.location.href);
        if (view === 'about') url.searchParams.set('view', 'about');
        else url.searchParams.delete('view');
        url.hash = '';
        window.history.pushState({ manualView: view }, '', `${url.pathname}${url.search}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const handlePopState = () => setActiveView(viewFromLocation());
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const toggleChapter = useCallback((id: string) => {
        setExpandedH2Ids((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    const openChapter = useCallback((id: string) => {
        setExpandedH2Ids((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    }, []);

    const expandAllChapters = useCallback(() => {
        setExpandedH2Ids(new Set(collectH2IdsWithChildH3(tocTree)));
    }, [tocTree]);

    useEffect(() => {
        if (activeView !== 'manual') return;

        const article = document.querySelector('article#manual-body');
        if (!article) return;
        const headings = Array.from(
            article.querySelectorAll<HTMLHeadingElement>('h1[id], h2[id], h3[id]'),
        );
        const tree = buildTocTree(headings);
        setTocTree(tree);

        const nextExpanded = new Set<string>();
        const hash = window.location.hash.replace(/^#/, '');
        if (hash) {
            const parentH2 = findParentH2IdForHeading(tree, hash);
            if (parentH2) nextExpanded.add(parentH2);
        }
        setExpandedH2Ids(nextExpanded);

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
    }, [activeView, manualMarkdown]);

    useEffect(() => {
        if (!activeId || tocTree.length === 0) return;
        const parentH2 = findParentH2IdForHeading(tocTree, activeId);
        if (!parentH2) return;
        setExpandedH2Ids((prev) => {
            if (prev.has(parentH2)) return prev;
            const next = new Set(prev);
            next.add(parentH2);
            return next;
        });
    }, [activeId, tocTree]);

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
            <Head title={activeView === 'about' ? 'このアプリについて' : '利用マニュアル'} />
            <style>{PRINT_STYLES}</style>
            <div className="min-h-screen bg-jpt-bg text-jpt-dark">
                <header className="sticky top-0 z-20 border-b border-jpt-border bg-jpt-dark text-white">
                    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-jpt-cyan via-jpt-blue to-jpt-purple">
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
                                className="ml-2 hidden items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline-flex"
                                style={{ backgroundColor: ACCENT_BG, color: ACCENT_TEXT }}
                            >
                                {activeView === 'about' ? (
                                    <Info className="h-3 w-3" />
                                ) : (
                                    <BookOpen className="h-3 w-3" />
                                )}
                                {activeView === 'about' ? 'このアプリについて' : '利用マニュアル'}
                            </span>
                        </Link>
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white sm:px-3"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            アプリへ戻る
                        </Link>
                    </div>
                </header>

                <nav
                    className="manual-view-switcher sticky top-14 z-10 border-b border-jpt-border bg-white/95 backdrop-blur"
                    aria-label="コンテンツ切り替え"
                >
                    <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 sm:px-6">
                        <button
                            type="button"
                            onClick={() => switchView('about')}
                            aria-pressed={activeView === 'about'}
                            className={`inline-flex min-h-10 items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                                activeView === 'about'
                                    ? 'bg-jpt-dark text-white shadow-sm'
                                    : 'text-jpt-dark hover:bg-jpt-bg'
                            }`}
                        >
                            <Info className="h-4 w-4" aria-hidden />
                            このアプリについて
                        </button>
                        <button
                            type="button"
                            onClick={() => switchView('manual')}
                            aria-pressed={activeView === 'manual'}
                            className={`inline-flex min-h-10 items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                                activeView === 'manual'
                                    ? 'bg-jpt-dark text-white shadow-sm'
                                    : 'text-jpt-dark hover:bg-jpt-bg'
                            }`}
                        >
                            <BookOpen className="h-4 w-4" aria-hidden />
                            操作マニュアル
                        </button>
                    </div>
                </nav>

                {activeView === 'about' ? (
                    <main
                        className="mx-auto max-w-[1340px] px-4 py-6 sm:px-6 md:py-8"
                        style={{ overflowAnchor: 'none' }}
                    >
                        <PortfolioEmbed portfolioUrl={portfolioUrl} />
                    </main>
                ) : (
                    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6 md:py-12">
                    <aside className="hidden w-72 shrink-0 lg:block">
                        <nav className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2">
                            <p
                                className="mb-2 text-xs font-semibold uppercase tracking-wider"
                                style={{ color: ACCENT_TEXT }}
                            >
                                目次
                            </p>
                            <ManualTocNav
                                tree={tocTree}
                                expandedH2Ids={expandedH2Ids}
                                onToggleChapter={toggleChapter}
                                onOpenChapter={openChapter}
                                onExpandAll={expandAllChapters}
                                activeId={activeId}
                                onPick={scrollToHeading}
                            />
                        </nav>
                    </aside>

                    <main className="min-w-0 flex-1">
                        <div className="mb-6 lg:hidden">
                            <button
                                type="button"
                                onClick={() => setMobileTocOpen((prev) => !prev)}
                                className="inline-flex items-center gap-2 rounded-md border border-jpt-border bg-white px-3 py-2 text-sm font-semibold text-jpt-dark hover:bg-jpt-bg"
                                aria-expanded={mobileTocOpen}
                                aria-controls="mobile-manual-toc"
                            >
                                {mobileTocOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                                目次
                            </button>

                            {mobileTocOpen && (
                                <div
                                    id="mobile-manual-toc"
                                    className="mt-3 max-h-[min(70vh,28rem)] overflow-y-auto rounded-lg border border-jpt-border bg-white p-3 text-sm shadow-sm"
                                >
                                    <ManualTocNav
                                        tree={tocTree}
                                        expandedH2Ids={expandedH2Ids}
                                        onToggleChapter={toggleChapter}
                                        onOpenChapter={openChapter}
                                        onExpandAll={expandAllChapters}
                                        activeId={activeId}
                                        onPick={scrollToHeading}
                                        compact
                                    />
                                </div>
                            )}
                        </div>

                        <article
                            id="manual-body"
                            className="manual-body rounded-xl border border-jpt-border bg-white px-6 py-8 shadow-sm sm:px-10"
                        >
                            <p className="mb-6 text-xs text-jpt-muted">
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
                                                    <div className="mb-6 scroll-mt-20 border-b border-jpt-border pb-3">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h1
                                                                {...props}
                                                                id={
                                                                    anchorId ??
                                                                    (props as { id?: string }).id
                                                                }
                                                                className="mb-0 shrink-0 border-0 pb-0 text-3xl font-bold tracking-tight text-jpt-dark"
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
                                                className="mb-6 scroll-mt-20 border-b border-jpt-border pb-3 text-3xl font-bold tracking-tight text-jpt-dark"
                                            />
                                        );
                                    },
                                    h2: ({ node, ...props }) => (
                                        <h2
                                            className="mt-10 mb-4 scroll-mt-20 border-l-4 pl-3 text-2xl font-bold text-jpt-dark"
                                            style={{ borderColor: ACCENT }}
                                            {...props}
                                        />
                                    ),
                                    h3: ({ node, ...props }) => (
                                        <h3
                                            className="mt-7 mb-3 scroll-mt-20 text-xl font-semibold text-jpt-dark"
                                            {...props}
                                        />
                                    ),
                                    h4: ({ node, ...props }) => (
                                        <h4
                                            className="mt-5 mb-2 scroll-mt-20 text-base font-semibold text-jpt-dark"
                                            {...props}
                                        />
                                    ),
                                    p: ({ node, ...props }) => (
                                        <p className="my-3 leading-7 text-jpt-dark" {...props} />
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
                                                    className="manual-print-hide inline-flex items-center gap-1 rounded-md border border-jpt-border bg-white px-3 py-1.5 text-xs font-medium no-underline hover:bg-jpt-bg"
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
                                        <li className="leading-7 text-jpt-dark" {...props} />
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
                                    hr: () => <hr className="my-8 border-jpt-border" />,
                                    table: ({ node, ...props }) => (
                                        <div className="my-4 overflow-x-auto">
                                            <table
                                                className="min-w-full border-collapse border border-jpt-border text-sm"
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
                                            className="border border-jpt-border px-3 py-2 text-left font-semibold"
                                            {...props}
                                        />
                                    ),
                                    td: ({ node, ...props }) => (
                                        <td
                                            className="border border-jpt-border px-3 py-2 align-top"
                                            {...props}
                                        />
                                    ),
                                    code: ({ node, className, children, ...props }) => {
                                        const codeText = String(children ?? '');
                                        if ((className ?? '').includes('language-mermaid')) {
                                            return <MermaidDiagram chart={codeText} />;
                                        }
                                        const isBlockCode =
                                            (className ?? '').includes('language-') ||
                                            codeText.includes('\n');
                                        if (!isBlockCode) {
                                            return (
                                                <code
                                                    className="rounded bg-jpt-bg px-1.5 py-0.5 font-mono text-[0.85em]"
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
                                                    'manual-ascii-code block w-max min-w-full whitespace-pre font-mono text-[12px] leading-[1.45] text-jpt-dark sm:text-[13px]',
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
                                            className="manual-ascii-pre my-4 max-w-full overflow-x-auto rounded-md border border-jpt-border bg-[#f4f6f9] p-3 shadow-sm sm:p-4"
                                            {...props}
                                        />
                                    ),
                                    img: ({ node, ...props }) => (
                                        <img
                                            className="my-4 rounded-md border border-jpt-border shadow-sm"
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
                                        <strong className="font-semibold text-jpt-dark" {...props} />
                                    ),
                                }}
                            >
                                {manualMarkdown}
                            </ReactMarkdown>
                        </article>
                    </main>
                    </div>
                )}
            </div>
        </>
    );
}
