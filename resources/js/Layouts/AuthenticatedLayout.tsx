import { PropsWithChildren } from 'react';

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
    return (
        <div className="flex h-screen overflow-hidden bg-brand-bg text-brand-dark">
            <Sidebar activeKey={activeKey} />

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header breadcrumb={breadcrumb} />

                <div className="flex-1 overflow-y-scroll p-6">
                    <div className={cn('mx-auto w-full', contentMaxWidthClass ?? 'max-w-7xl')}>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
