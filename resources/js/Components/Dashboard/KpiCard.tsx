import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type Accent = 'cyan-blue' | 'yellow' | 'blue-purple' | 'red';

interface KpiCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    unit?: string;
    badge?: { text: string; tone?: 'default' | 'warn' | 'danger' };
    footer?: string;
    progress?: number;
    accent: Accent;
}

const accentClassMap: Record<Accent, string> = {
    'cyan-blue': 'bg-gradient-to-r from-brand-cyan to-brand-blue',
    yellow: 'bg-brand-accent',
    'blue-purple': 'bg-gradient-to-r from-brand-blue to-brand-purple',
    red: 'bg-brand-red',
};

const badgeClassMap = {
    default: 'bg-blue-50 text-brand-blue',
    warn: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-brand-red',
} as const;

export default function KpiCard({
    icon: Icon,
    label,
    value,
    unit,
    badge,
    footer,
    progress,
    accent,
}: KpiCardProps) {
    const isDanger = accent === 'red';

    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all duration-150',
                'cursor-pointer hover:-translate-y-0.5 hover:shadow-md',
                isDanger ? 'border-2 border-brand-red/20' : 'border-brand-border',
            )}
        >
            <div className={cn('absolute left-0 right-0 top-0 h-1', accentClassMap[accent])} />
            <div
                className={cn(
                    'mb-2 flex items-center gap-2 text-sm font-medium',
                    isDanger ? 'text-brand-red' : 'text-brand-muted',
                )}
            >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
            </div>

            <div className="mb-3 flex items-end justify-between">
                <div className="flex items-baseline gap-1">
                    <span
                        className={cn(
                            'font-mono text-4xl font-bold tracking-tight',
                            isDanger ? 'text-brand-red' : 'text-brand-dark',
                        )}
                    >
                        {value}
                    </span>
                    {unit && <span className="ml-1 text-sm text-brand-muted">{unit}</span>}
                </div>
                {badge && (
                    <span
                        className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                            badgeClassMap[badge.tone ?? 'default'],
                        )}
                    >
                        {badge.text}
                    </span>
                )}
            </div>

            {typeof progress === 'number' && (
                <div className="mb-1 h-2 overflow-hidden rounded-full bg-brand-bg">
                    <div
                        className={cn(
                            'h-full rounded-full',
                            isDanger ? 'bg-brand-red' : 'bg-gradient-to-r from-brand-blue to-brand-purple',
                        )}
                        style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
                    />
                </div>
            )}

            {footer && (
                <div className={cn('mt-1 text-xs', isDanger ? 'text-brand-red' : 'text-brand-muted')}>
                    {footer}
                </div>
            )}
        </div>
    );
}
