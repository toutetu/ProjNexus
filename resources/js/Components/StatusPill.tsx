import { cn } from '@/lib/utils';

export type ProjectStatus =
    | 'draft'
    | 'pending_dept'
    | 'pending_hq'
    | 'approved'
    | 'rejected';

interface StatusPillProps {
    status: ProjectStatus;
    size?: 'sm' | 'md';
    className?: string;
}

interface StatusStyle {
    label: string;
    bg: string;
    text: string;
    dot: string;
}

const STATUS_STYLES: Record<ProjectStatus, StatusStyle> = {
    draft: {
        label: '下書き',
        bg: 'bg-[#E9ECEF]',
        text: 'text-[#495057]',
        dot: 'bg-[#6C757D]',
    },
    pending_dept: {
        label: '部門承認待ち',
        bg: 'bg-[#E0F7FE]',
        text: 'text-[#0C7DA3]',
        dot: 'bg-[#01CFFF]',
    },
    pending_hq: {
        label: '本部承認待ち',
        bg: 'bg-[#E3EEFB]',
        text: 'text-[#0A4E8A]',
        dot: 'bg-[#106EBE]',
    },
    approved: {
        label: '承認済',
        bg: 'bg-[#DCFCE7]',
        text: 'text-[#166534]',
        dot: 'bg-[#16A34A]',
    },
    rejected: {
        label: '却下',
        bg: 'bg-[#FEE2E2]',
        text: 'text-[#991B1B]',
        dot: 'bg-[#E60013]',
    },
};

export default function StatusPill({
    status,
    size = 'md',
    className,
}: StatusPillProps) {
    const style = STATUS_STYLES[status];
    const sizeClasses =
        size === 'sm'
            ? 'px-2 py-0.5 text-[10px] gap-1'
            : 'px-2.5 py-0.5 text-[11px] gap-1.5';
    const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2';

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full font-medium',
                sizeClasses,
                style.bg,
                style.text,
                className,
            )}
        >
            <span
                className={cn('rounded-full', dotSize, style.dot)}
                aria-hidden="true"
            />
            {style.label}
        </span>
    );
}
