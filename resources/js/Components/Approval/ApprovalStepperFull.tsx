import { Check, Clock3, Route, X } from 'lucide-react';

import type { ProjectStatus } from '@/Components/StatusPill';
import { cn } from '@/lib/utils';

type StepState = 'todo' | 'done' | 'current' | 'rejected' | 'skipped';

export interface ApprovalTimelineItem {
    level: 'dept' | 'hq';
    action: 'approved' | 'rejected';
    approver: string | null;
    actedAt: string | null;
}

interface ApprovalStepperFullProps {
    status: ProjectStatus;
    approvals: ApprovalTimelineItem[];
    submittedAt: string | null;
    applicantName: string | null;
    rejectedAt?: 'dept' | 'hq' | null;
    skipsDeptStep?: boolean;
}

const STEP_LABELS = ['申請', '部門承認', '本部承認', '承認済'] as const;

function formatDate(value: string | null): string {
    if (!value) return '—';
    const dt = new Date(value.replace(' ', 'T'));
    if (Number.isNaN(dt.getTime())) return value;

    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const hh = String(dt.getHours()).padStart(2, '0');
    const mi = String(dt.getMinutes()).padStart(2, '0');
    return `${mm}/${dd} ${hh}:${mi}`;
}

function formatDateOnly(value: string | null): string {
    if (!value) return '—';
    const dt = new Date(value.replace(' ', 'T'));
    if (Number.isNaN(dt.getTime())) return value;
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
}

function getStepStates(
    status: ProjectStatus,
    rejectedAt: 'dept' | 'hq' | null | undefined,
    skipsDeptStep: boolean,
): StepState[] {
    switch (status) {
        case 'draft':
            return ['current', 'todo', 'todo', 'todo'];
        case 'pending_dept':
            return ['done', 'current', 'todo', 'todo'];
        case 'pending_hq':
            if (skipsDeptStep) return ['done', 'skipped', 'current', 'todo'];
            return ['done', 'done', 'current', 'todo'];
        case 'approved':
            if (skipsDeptStep) return ['done', 'skipped', 'done', 'done'];
            return ['done', 'done', 'done', 'done'];
        case 'rejected':
            if (rejectedAt === 'dept') return ['done', 'rejected', 'todo', 'todo'];
            if (skipsDeptStep && rejectedAt === 'hq') return ['done', 'skipped', 'rejected', 'todo'];
            return ['done', 'done', 'rejected', 'todo'];
        default:
            return ['todo', 'todo', 'todo', 'todo'];
    }
}

function findLatest(approvals: ApprovalTimelineItem[], level: 'dept' | 'hq') {
    const filtered = approvals.filter((item) => item.level === level);
    return filtered.length > 0 ? filtered[0] : null;
}

export default function ApprovalStepperFull({
    status,
    approvals,
    submittedAt,
    applicantName,
    rejectedAt,
    skipsDeptStep = false,
}: ApprovalStepperFullProps) {
    const states = getStepStates(status, rejectedAt, skipsDeptStep);
    const dept = findLatest(approvals, 'dept');
    const hq = findLatest(approvals, 'hq');

    const connectorDone = (index: number) => {
        const left = states[index];
        const right = states[index + 1];
        return (
            (left === 'done' && right !== 'todo') ||
            (left === 'skipped' && (right === 'current' || right === 'done' || right === 'rejected'))
        );
    };

    const stepMeta = (index: number, state: StepState): string => {
        if (index === 0) return `${applicantName ?? '申請者'} / ${formatDate(submittedAt)}`;

        if (index === 1) {
            if (state === 'skipped') return 'スキップ';
            if (!dept) return state === 'current' ? '対応待ち' : '—';
            return `${dept.approver ?? '承認者'} / ${formatDate(dept.actedAt)}`;
        }

        if (index === 2) {
            if (!hq) return state === 'current' ? '対応待ち' : '—';
            return `${hq.approver ?? '承認者'} / ${formatDate(hq.actedAt)}`;
        }

        if (index === 3) {
            if (state === 'done') return hq ? formatDate(hq.actedAt) : formatDate(submittedAt);
            return '—';
        }

        return '—';
    };

    return (
        <div className="rounded-lg border border-brand-border bg-white">
            <div className="flex items-center gap-2 border-b border-brand-border px-6 py-4">
                <Route className="h-4 w-4 text-brand-muted" />
                <p className="text-sm font-semibold text-brand-dark">承認フロー</p>
                <p className="ml-auto text-xs text-brand-muted">申請日: {formatDateOnly(submittedAt)}</p>
            </div>

            <div className="px-6 py-6">
                <div className="flex items-start">
                    {STEP_LABELS.map((label, index) => {
                        const state = states[index];
                        const isLast = index === STEP_LABELS.length - 1;

                        return (
                            <div key={label} className="relative flex flex-1 flex-col items-center text-center">
                                {!isLast && (
                                    <div
                                        className={cn(
                                            'absolute left-[calc(50%+24px)] right-[calc(-50%+24px)] top-5 h-0.5 bg-brand-border',
                                            connectorDone(index) && 'bg-brand-blue',
                                        )}
                                    />
                                )}

                                <div
                                    className={cn(
                                        'z-[1] flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold',
                                        state === 'todo' && 'border-brand-border bg-white text-brand-muted',
                                        state === 'done' && 'border-brand-blue bg-brand-blue text-white',
                                        state === 'current' &&
                                            'animate-brand-pulse border-brand-blue bg-brand-blue text-white',
                                        state === 'rejected' && 'border-brand-red bg-brand-red text-white',
                                        state === 'skipped' &&
                                            'border-dashed border-brand-muted/70 bg-brand-bg text-brand-muted',
                                    )}
                                >
                                    {state === 'done' && <Check className="h-4.5 w-4.5" />}
                                    {state === 'current' && <Clock3 className="h-4.5 w-4.5" />}
                                    {state === 'rejected' && <X className="h-4.5 w-4.5" />}
                                    {(state === 'todo' || state === 'skipped') && <span>{index + 1}</span>}
                                </div>

                                <p
                                    className={cn(
                                        'mt-2 text-xs font-medium text-brand-muted',
                                        (state === 'done' || state === 'rejected') && 'text-brand-dark',
                                        state === 'current' && 'font-semibold text-brand-blue',
                                        state === 'skipped' && 'line-through decoration-brand-muted/60',
                                    )}
                                >
                                    {label}
                                </p>
                                <p
                                    className={cn(
                                        'mt-1 text-[11px] text-brand-muted',
                                        state === 'current' && 'text-brand-blue',
                                    )}
                                >
                                    {stepMeta(index, state)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
