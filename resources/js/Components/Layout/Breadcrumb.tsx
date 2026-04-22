import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Fragment } from 'react';

import type { BreadcrumbItem } from '@/types';

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    if (items.length === 0) return null;

    return (
        <nav
            aria-label="パンくずリスト"
            className="flex items-center gap-2 text-sm text-brand-muted"
        >
            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                const Icon = item.icon;
                const content = (
                    <span className="flex items-center gap-1">
                        {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                        <span
                            className={
                                isLast
                                    ? 'font-medium text-brand-dark'
                                    : 'text-brand-muted'
                            }
                        >
                            {item.label}
                        </span>
                    </span>
                );

                return (
                    <Fragment key={`${item.label}-${index}`}>
                        {item.href && !isLast ? (
                            <Link
                                href={item.href}
                                className="transition-colors hover:text-brand-dark"
                            >
                                {content}
                            </Link>
                        ) : (
                            content
                        )}
                        {!isLast && (
                            <ChevronRight
                                className="h-3.5 w-3.5 text-brand-muted"
                                aria-hidden="true"
                            />
                        )}
                    </Fragment>
                );
            })}
        </nav>
    );
}
