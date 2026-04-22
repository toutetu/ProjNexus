import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-brand-dark text-white',
                secondary:
                    'border-transparent bg-brand-bg text-brand-dark',
                destructive:
                    'border-transparent bg-[#FEE2E2] text-[#991B1B]',
                outline: 'border-brand-border text-brand-dark',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
