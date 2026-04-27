import { cn } from '@/lib/utils';

interface Challenge2BadgeProps {
    className?: string;
}

export default function Challenge2Badge({ className = '' }: Challenge2BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center whitespace-nowrap rounded px-1 py-0.5 text-[9px] font-semibold leading-none tracking-wide',
                'bg-brand-accent text-[#4A3A12]',
                className,
            )}
        >
            課題2
        </span>
    );
}
