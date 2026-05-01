import { LayoutDashboard, Rows3, Users } from 'lucide-react';

import { cn } from '@/lib/utils';

type ViewMode = 'board' | 'list' | 'members';

interface ViewToggleProps {
    value: ViewMode;
    onChange: (next: ViewMode) => void;
}

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-brand-muted">ビュー</span>
            <div className="inline-flex rounded-lg border border-brand-border bg-white p-0.5">
                <button
                    type="button"
                    onClick={() => onChange('board')}
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition',
                        value === 'board'
                            ? 'bg-brand-dark text-white'
                            : 'text-brand-muted hover:text-brand-dark',
                    )}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    カンバン
                </button>
                <button
                    type="button"
                    onClick={() => onChange('members')}
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition',
                        value === 'members'
                            ? 'bg-brand-dark text-white'
                            : 'text-brand-muted hover:text-brand-dark',
                    )}
                >
                    <Users className="h-4 w-4" />
                    メンバー別
                </button>
                <button
                    type="button"
                    onClick={() => onChange('list')}
                    className={cn(
                        'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition',
                        value === 'list'
                            ? 'bg-brand-dark text-white'
                            : 'text-brand-muted hover:text-brand-dark',
                    )}
                >
                    <Rows3 className="h-4 w-4" />
                    一覧
                </button>
            </div>
        </div>
    );
}

export type { ViewMode };
