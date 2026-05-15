import { Search } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';

import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    isProjectTaskFilterActive,
    type ProjectTaskFilterValues,
} from '@/lib/projectTaskFilters';

export interface TaskFilterPersonOption {
    id: number;
    name: string;
}

export interface TaskFilterBarProps {
    filters: ProjectTaskFilterValues;
    onChange: (patch: Partial<ProjectTaskFilterValues>) => void;
    onClear: () => void;
    assignees: TaskFilterPersonOption[];
    reviewers: TaskFilterPersonOption[];
    leadingExtras?: ReactNode;
    trailingExtras?: ReactNode;
    className?: string;
    emptyMessage?: string;
    showEmptyMessage?: boolean;
}

const selectClassName =
    'h-8 min-w-[7.25rem] shrink-0 rounded-md border border-brand-border bg-white px-2 py-0 pr-7 text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40';

export default function TaskFilterBar({
    filters,
    onChange,
    onClear,
    assignees,
    reviewers,
    leadingExtras,
    trailingExtras,
    className,
    emptyMessage = '条件に一致するタスクはありません。',
    showEmptyMessage = false,
}: TaskFilterBarProps) {
    const active = isProjectTaskFilterActive(filters);

    useEffect(() => {
        if (filters.dueMode !== 'date' && filters.dueDate !== '') {
            onChange({ dueDate: '' });
        }
    }, [filters.dueDate, filters.dueMode, onChange]);

    return (
        <div className={className}>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                {leadingExtras}
                <div className="relative w-full min-w-[12rem] max-w-md flex-[1_1_14rem]">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-muted" />
                    <Input
                        type="search"
                        value={filters.keyword}
                        onChange={(event) => onChange({ keyword: event.target.value })}
                        placeholder="キーワード（タイトル・説明・担当など）"
                        className="h-8 border-brand-border bg-white py-1 pl-8 pr-2 text-xs placeholder:text-[11px]"
                        aria-label="タスクキーワード検索"
                    />
                </div>
                <select
                    value={filters.taskType}
                    onChange={(event) => onChange({ taskType: event.target.value })}
                    className={`${selectClassName} min-w-[7.25rem]`}
                    aria-label="種類で絞り込み"
                >
                    <option value="">種類：すべて</option>
                    <option value="task">タスク</option>
                    <option value="feature">機能追加</option>
                    <option value="improvement">改善</option>
                    <option value="bug">バグ</option>
                </select>
                <select
                    value={filters.priority}
                    onChange={(event) => onChange({ priority: event.target.value })}
                    className={selectClassName}
                    aria-label="優先度で絞り込み"
                >
                    <option value="">優先度：すべて</option>
                    <option value="high">高</option>
                    <option value="medium">中</option>
                    <option value="low">低</option>
                </select>
                <select
                    value={filters.status}
                    onChange={(event) => onChange({ status: event.target.value })}
                    className={`${selectClassName} min-w-[8.5rem]`}
                    aria-label="ステータスで絞り込み"
                >
                    <option value="">ステータス：すべて</option>
                    <option value="open">未着手</option>
                    <option value="in_progress">進行中</option>
                    <option value="resolved">確認待ち</option>
                    <option value="closed">完了</option>
                </select>
                <select
                    value={filters.assigneeId}
                    onChange={(event) => onChange({ assigneeId: event.target.value })}
                    className={`${selectClassName} min-w-[8.5rem]`}
                    aria-label="担当で絞り込み"
                >
                    <option value="">担当：すべて</option>
                    <option value="__unassigned">未割当</option>
                    {assignees.map((u) => (
                        <option key={u.id} value={String(u.id)}>
                            {u.name}
                        </option>
                    ))}
                </select>
                <select
                    value={filters.reviewerId}
                    onChange={(event) => onChange({ reviewerId: event.target.value })}
                    className={`${selectClassName} min-w-[8.5rem]`}
                    aria-label="確認者で絞り込み"
                >
                    <option value="">確認者：すべて</option>
                    <option value="__unassigned">未設定</option>
                    {reviewers.map((u) => (
                        <option key={u.id} value={String(u.id)}>
                            {u.name}
                        </option>
                    ))}
                </select>
                <select
                    value={filters.dueMode}
                    onChange={(event) =>
                        onChange({
                            dueMode: event.target.value as ProjectTaskFilterValues['dueMode'],
                        })
                    }
                    className={`${selectClassName} min-w-[9rem]`}
                    aria-label="期日で絞り込み"
                >
                    <option value="">期日：すべて</option>
                    <option value="overdue">期限超過</option>
                    <option value="week">今週中</option>
                    <option value="month">今月中</option>
                    <option value="unset">期日未設定</option>
                    <option value="date">期日指定</option>
                </select>
                {filters.dueMode === 'date' && (
                    <Input
                        type="date"
                        value={filters.dueDate}
                        onChange={(event) => onChange({ dueDate: event.target.value })}
                        className="h-8 min-w-[10rem] shrink-0 border-brand-border bg-white px-2 py-1 text-xs"
                        aria-label="期日の日付指定"
                    />
                )}
                {trailingExtras}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 px-2.5 text-xs"
                    onClick={onClear}
                    disabled={!active}
                >
                    クリア
                </Button>
            </div>
            {showEmptyMessage && (
                <p className="mt-2 text-xs text-brand-muted">{emptyMessage}</p>
            )}
        </div>
    );
}
