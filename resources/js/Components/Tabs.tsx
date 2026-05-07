import { type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface TabItem<T extends string> {
    value: T;
    label: string;
    icon?: LucideIcon;
    count?: number;
}

interface TabsProps<T extends string> {
    value: T;
    onChange: (v: T) => void;
    items: TabItem<T>[];
    className?: string;
}


export default function Tabs<T extends string>({
    value,
    onChange,
    items,
    className,
}: TabsProps<T>) {
    return (
        <div className={cn('flex items-center gap-6', className)}>
            {items.map((item) => {
                const isActive = item.value === value;
                const Icon = item.icon;

                return (
                    <button
                        key={item.value}
                        type="button"
                        onClick={() => onChange(item.value)}
                        className={cn(
                            'relative inline-flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors',
                            isActive
                                ? 'border-brand-red text-brand-red'
                                : 'border-transparent text-brand-muted hover:text-brand-dark',
                        )}
                    >
                        {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                        <span>{item.label}</span>
                        {typeof item.count === 'number' && (
                            <span
                                className={cn(
                                    'rounded px-1.5 py-0.5 text-xs font-semibold',
                                    isActive
                                        ? 'bg-[#FEE2E2] text-[#991B1B]'
                                        : 'bg-gray-100 text-gray-600',
                                )}
                            >
                                {item.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
