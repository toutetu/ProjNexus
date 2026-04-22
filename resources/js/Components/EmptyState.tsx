import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed border-brand-border bg-brand-bg/60 px-6 py-10 text-center">
            <div className="rounded-full bg-white p-3 shadow-sm">
                <Icon className="h-5 w-5 text-brand-muted" aria-hidden="true" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-brand-dark">{title}</h3>
            {description && (
                <p className="mt-1 text-sm text-brand-muted">{description}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
