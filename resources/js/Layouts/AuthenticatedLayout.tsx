import { PropsWithChildren, useEffect, useState } from 'react';
import { PanelLeftOpen } from 'lucide-react';

import Header from '@/Components/Layout/Header';
import Sidebar, { type ActiveKey } from '@/Components/Layout/Sidebar';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface AuthenticatedLayoutProps {
    breadcrumb?: BreadcrumbItem[];
    activeKey?: ActiveKey;
    /** メインコンテンツの横幅クラス（既定は max-w-7xl） */
    contentMaxWidthClass?: string;
}

export default function AuthenticatedLayout({
    breadcrumb = [],
    activeKey = null,
    contentMaxWidthClass,
    children,
}: PropsWithChildren<AuthenticatedLayoutProps>) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = window.localStorage.getItem('projnexus.sidebar.open');
        if (saved === null) return;
        setSidebarOpen(saved === '1');
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage.setItem('projnexus.sidebar.open', sidebarOpen ? '1' : '0');
    }, [sidebarOpen]);

    return (
        <div className="flex h-screen overflow-hidden bg-brand-bg text-brand-dark">
            {sidebarOpen && (
                <Sidebar
                    activeKey={activeKey}
                    onToggleSidebar={() => setSidebarOpen(false)}
                />
            )}

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header breadcrumb={breadcrumb} leftInset={!sidebarOpen} />
                {!sidebarOpen && (
                    <div className="group absolute left-3 top-3 z-20">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-md border border-brand-border bg-white p-2 text-brand-dark shadow-sm transition-colors hover:bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                            aria-label="レフトナビを開く"
                        >
                            <PanelLeftOpen className="h-5 w-5" />
                        </button>
                        <span className="pointer-events-none absolute left-full top-1/2 ml-1 -translate-y-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                            開く
                        </span>
                    </div>
                )}

                <div className="flex-1 overflow-y-scroll p-6">
                    <div className={cn('mx-auto w-full', contentMaxWidthClass ?? 'max-w-7xl')}>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
