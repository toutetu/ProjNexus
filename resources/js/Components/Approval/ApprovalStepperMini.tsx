import type { ProjectStatus } from '@/Components/StatusPill';
import { cn } from '@/lib/utils';

interface ApprovalStepperMiniProps {
    status: ProjectStatus;
    rejectedAt?: 'dept' | 'hq';
}

type StepState = 'todo' | 'done' | 'current' | 'rejected';

const STEP_LABELS = ['申請', '部門', '本部', '済'] as const;

function getStepStates(
    status: ProjectStatus,
    rejectedAt?: 'dept' | 'hq',
): StepState[] {
    switch (status) {
        case 'draft':
            return ['current', 'todo', 'todo', 'todo'];
        case 'pending_dept':
            return ['done', 'current', 'todo', 'todo'];
        case 'pending_hq':
            return ['done', 'done', 'current', 'todo'];
        case 'approved':
            return ['done', 'done', 'done', 'done'];
        case 'rejected':
            if (rejectedAt === 'dept') {
                return ['done', 'rejected', 'todo', 'todo'];
            }
            return ['done', 'done', 'rejected', 'todo'];
        default:
            return ['todo', 'todo', 'todo', 'todo'];
    }
}

function getCurrentIndex(states: StepState[]): number {
    const rejectedIndex = states.findIndex((s) => s === 'rejected');
    if (rejectedIndex >= 0) return rejectedIndex;

    const currentIndex = states.findIndex((s) => s === 'current');
    if (currentIndex >= 0) return currentIndex;

    if (states.every((s) => s === 'done')) return 3;
    return 0;
}

export default function ApprovalStepperMini({
    status,
    rejectedAt,
}: ApprovalStepperMiniProps) {
    const states = getStepStates(status, rejectedAt);
    const currentIndex = getCurrentIndex(states);
    const isRejected = states.includes('rejected');

    return (
        <div>
            <div className="inline-flex items-center gap-1">
                {states.map((state, index) => (
                    <div key={STEP_LABELS[index]} className="flex items-center gap-1">
                        <span
                            className={cn(
                                'h-2.5 w-2.5 rounded-full border-[1.5px]',
                                state === 'done' &&
                                    'border-brand-blue bg-brand-blue',
                                state === 'todo' &&
                                    'border-brand-border bg-white',
                                state === 'current' &&
                                    'border-brand-blue bg-brand-blue animate-brand-pulse',
                                state === 'rejected' &&
                                    'border-brand-red bg-brand-red',
                            )}
                            aria-hidden="true"
                        />
                        {index < states.length - 1 && (
                            <span
                                className={cn(
                                    'h-0.5 w-3.5 bg-brand-border',
                                    states[index] === 'done' &&
                                        states[index + 1] !== 'todo' &&
                                        'bg-brand-blue',
                                )}
                                aria-hidden="true"
                            />
                        )}
                    </div>
                ))}
            </div>
            <p className="mt-1 text-[10px] text-brand-muted">
                {STEP_LABELS.map((label, index) => (
                    <span key={label}>
                        <span
                            className={cn(
                                index === currentIndex && !isRejected && 'font-bold text-brand-blue',
                                index === currentIndex && isRejected && 'font-bold text-brand-red',
                            )}
                        >
                            {label}
                        </span>
                        {index < STEP_LABELS.length - 1 && <span> → </span>}
                    </span>
                ))}
            </p>
        </div>
    );
}
