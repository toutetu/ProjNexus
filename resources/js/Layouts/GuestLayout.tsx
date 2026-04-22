import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-brand-bg px-4 pt-8 sm:justify-center sm:pt-0">
            <div className="mb-4 text-center">
                <Link href="/">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan via-brand-blue to-brand-purple">
                        <ApplicationLogo className="h-8 w-8 fill-white text-white" />
                    </div>
                </Link>
                <p className="text-base font-semibold text-brand-dark">開発管理アプリ</p>
                <p className="mt-1 text-xs text-brand-muted">
                    Project Development Management
                </p>
            </div>

            <div className="w-full overflow-hidden rounded-lg border border-brand-border bg-white px-6 py-5 shadow-sm sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
