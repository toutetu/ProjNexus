import type { MemberTaskItem } from '@/types/memberTasks';
import { useState } from 'react';

import TaskCard from './TaskCard';

interface KanbanBoardProps {
    tasks: MemberTaskItem[];
    onOpenTask: (task: MemberTaskItem) => void;
    onDropStatus: (task: MemberTaskItem, nextStatus: MemberTaskItem['status']) => void;
    /** 完了列ヘッダー横の補足。未指定は「(直近30日)」。空文字で非表示（案件タスク一覧など） */
    closedColumnExtra?: string;
    isTaskDraggable?: (task: MemberTaskItem) => boolean;
}

export default function KanbanBoard({
    tasks,
    onOpenTask,
    onDropStatus,
    closedColumnExtra,
    isTaskDraggable = () => true,
}: KanbanBoardProps) {
    const closedExtra =
        closedColumnExtra === undefined ? '(直近30日)' : closedColumnExtra || undefined;

    const cols: { key: MemberTaskItem['status']; title: string; dot: string; extra?: string; bg?: string }[] = [
        { key: 'open', title: '未着手', dot: 'bg-gray-400' },
        { key: 'in_progress', title: '進行中', dot: 'bg-brand-blue' },
        {
            key: 'resolved',
            title: '確認待ち',
            dot: 'bg-[#7C3AED]',
            extra: '(完了報告済み)',
            bg: 'bg-[#F5F3FF]',
        },
        {
            key: 'closed',
            title: '完了',
            dot: 'bg-[#16A34A]',
            extra: closedExtra,
        },
    ];

    const grouped = cols.map((col) => ({
        ...col,
        items: tasks.filter((t) => t.status === col.key),
    }));

    const [overColumn, setOverColumn] = useState<MemberTaskItem['status'] | null>(null);

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {grouped.map((col) => (
                <div
                    key={col.key}
                    className={`flex min-h-[50vh] flex-col rounded-[10px] p-2.5 ${
                        overColumn === col.key ? 'ring-2 ring-brand-blue/30' : ''
                    } ${col.bg ?? 'bg-[#F1F3F5]'}`}
                    onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setOverColumn(col.key);
                    }}
                    onDragLeave={() => setOverColumn((prev) => (prev === col.key ? null : prev))}
                    onDrop={(e) => {
                        e.preventDefault();
                        setOverColumn(null);
                        const rawId = e.dataTransfer.getData('text/plain');
                        const droppedId = Number(rawId);
                        if (Number.isNaN(droppedId)) return;
                        const droppedTask = tasks.find((task) => task.id === droppedId);
                        if (!droppedTask) return;
                        if (droppedTask.status === col.key) return;
                        onDropStatus(droppedTask, col.key);
                    }}
                >
                    <div className="flex items-center justify-between px-2 pb-2.5 pt-1.5">
                        <div className="flex items-center gap-1.5 text-[13px] font-bold tracking-wide text-brand-dark">
                            <span className={`h-2 w-2 rounded-full ${col.dot}`} />
                            {col.title}
                            {col.extra && (
                                <span
                                    className={
                                        col.key === 'resolved'
                                            ? 'text-[10px] font-normal text-[#7C3AED]'
                                            : 'text-[10px] font-normal text-brand-muted'
                                    }
                                >
                                    {col.extra}
                                </span>
                            )}
                        </div>
                        <span className="rounded-full border border-brand-border bg-white px-2 py-0.5 text-[11px] font-semibold text-brand-muted">
                            {col.items.length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto px-0.5">
                        {col.items.map((task) => (
                            <div key={task.id} className="mb-2">
                                <TaskCard
                                    task={task}
                                    variant="kanban"
                                    onOpenTask={onOpenTask}
                                    draggable={isTaskDraggable(task)}
                                    onDragEnd={() => {
                                        setOverColumn(null);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
