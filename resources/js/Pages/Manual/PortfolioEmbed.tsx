import { ExternalLink, Presentation } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface Props {
    portfolioUrl: string;
}

const withEmbeddedMode = (url: string): string => {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}embedded=1`;
};

export default function PortfolioEmbed({ portfolioUrl }: Props) {
    const frameRef = useRef<HTMLIFrameElement>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const [frameHeight, setFrameHeight] = useState(760);
    const embeddedUrl = useMemo(() => withEmbeddedMode(portfolioUrl), [portfolioUrl]);

    const syncFrameHeight = useCallback(() => {
        try {
            const document = frameRef.current?.contentDocument;
            if (!document) return;

            const height = Math.max(
                document.documentElement.scrollHeight,
                document.body?.scrollHeight ?? 0,
                760,
            );
            setFrameHeight(Math.ceil(height));
        } catch {
            // If the configured asset URL is not same-origin, the iframe remains scrollable.
        }
    }, []);

    const handleLoad = useCallback(() => {
        resizeObserverRef.current?.disconnect();

        try {
            const document = frameRef.current?.contentDocument;
            if (document && typeof ResizeObserver !== 'undefined') {
                const observer = new ResizeObserver(syncFrameHeight);
                observer.observe(document.documentElement);
                resizeObserverRef.current = observer;
            }
        } catch {
            // Cross-origin access is optional; the iframe still displays normally.
        }

        syncFrameHeight();
    }, [syncFrameHeight]);

    useEffect(() => {
        window.addEventListener('resize', syncFrameHeight, { passive: true });
        return () => {
            window.removeEventListener('resize', syncFrameHeight);
            resizeObserverRef.current?.disconnect();
        };
    }, [syncFrameHeight]);

    return (
        <section
            aria-labelledby="about-projnexus-title"
            className="overflow-hidden rounded-xl border border-jpt-border bg-white shadow-sm"
            style={{ overflowAnchor: 'none' }}
        >
            <div className="flex flex-col gap-4 border-b border-jpt-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                    <div className="mb-1 flex items-center gap-2 text-sm font-semibold" style={{ color: '#7A5400' }}>
                        <Presentation className="h-4 w-4" aria-hidden />
                        ポートフォリオ・ケーススタディ
                    </div>
                    <h1 id="about-projnexus-title" className="text-2xl font-bold tracking-tight text-jpt-dark sm:text-3xl">
                        このアプリについて
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-jpt-muted sm:text-base">
                        開発の背景、業務課題、設計上の工夫、技術構成を10ページで紹介します。
                    </p>
                </div>
                <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md border-2 px-4 py-2.5 text-sm font-semibold no-underline transition-colors hover:bg-[#FFF9E6]"
                    style={{ borderColor: '#EDB100', color: '#7A5400' }}
                >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    別画面で開く・印刷
                </a>
            </div>

            <iframe
                ref={frameRef}
                src={embeddedUrl}
                title="ProjNexus このアプリについて"
                loading="eager"
                onLoad={handleLoad}
                className="block w-full border-0 bg-[#dfe4ea]"
                style={{ height: `${frameHeight}px` }}
            />
        </section>
    );
}
