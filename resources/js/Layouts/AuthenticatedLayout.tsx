import { PropsWithChildren } from 'react';

import Header from '@/Components/Layout/Header';
import Sidebar, { type ActiveKey } from '@/Components/Layout/Sidebar';
import type { BreadcrumbItem } from '@/types';

interface AuthenticatedLayoutProps {
    breadcrumb?: BreadcrumbItem[];
    activeKey?: ActiveKey;
}

export default function AuthenticatedLayout({
    breadcrumb = [],
    activeKey = null,
    children,
}: PropsWithChildren<AuthenticatedLayoutProps>) {
    return (
        <div className="flex h-screen overflow-hidden bg-brand-bg text-brand-dark">
            <Sidebar activeKey={activeKey} />

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Header breadcrumb={breadcrumb} />

                <div className="flex-1 overflow-y-scroll p-6">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </div>
            </main>
        </div>
    );
}
