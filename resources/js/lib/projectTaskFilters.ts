export type TaskFilterDueMode = '' | 'overdue' | 'week' | 'month' | 'unset' | 'date';

export interface ProjectTaskFilterValues {
    keyword: string;
    taskType: string;
    priority: string;
    status: string;
    assigneeId: string;
    reviewerId: string;
    dueMode: TaskFilterDueMode;
    dueDate: string;
}

export const emptyProjectTaskFilters = (): ProjectTaskFilterValues => ({
    keyword: '',
    taskType: '',
    priority: '',
    status: '',
    assigneeId: '',
    reviewerId: '',
    dueMode: '',
    dueDate: '',
});

export function isProjectTaskFilterActive(filters: ProjectTaskFilterValues): boolean {
    return (
        filters.keyword.trim() !== '' ||
        filters.taskType !== '' ||
        filters.priority !== '' ||
        filters.status !== '' ||
        filters.assigneeId !== '' ||
        filters.reviewerId !== '' ||
        filters.dueMode !== '' ||
        filters.dueDate !== ''
    );
}

export interface TaskFilterMatchInput {
    id: number;
    title: string;
    description?: string | null;
    taskType: string;
    priority: string;
    status: string;
    assigneeId: number | null;
    assignee?: string | null;
    reviewerId: number | null;
    reviewer?: string | null;
    dueDate: string | null;
}

export interface TaskFilterMatchContext {
    projectId?: number;
    keywordExtras?: string[];
}

function todayStartMs(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

function weekRangeMs(): { start: number; end: number } {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);
    return {
        start: monday.getTime(),
        end: sunday.getTime(),
    };
}

function monthRangeMs(): { start: number; end: number } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime();
    return { start, end };
}

function matchesDueFilter(
    dueDate: string | null,
    status: string,
    dueMode: TaskFilterDueMode,
    dueDateFilter: string,
): boolean {
    if (dueMode === '') return true;

    if (dueMode === 'unset') {
        return dueDate === null || dueDate === '';
    }

    if (!dueDate) return false;

    const dueMs = new Date(`${dueDate}T00:00:00`).getTime();
    if (Number.isNaN(dueMs)) return false;

    if (dueMode === 'date') {
        return dueDateFilter !== '' && dueDate === dueDateFilter;
    }

    if (dueMode === 'overdue') {
        if (status === 'closed') return false;
        return dueMs < todayStartMs();
    }

    if (dueMode === 'week') {
        const { start, end } = weekRangeMs();
        return dueMs >= start && dueMs <= end;
    }

    if (dueMode === 'month') {
        const { start, end } = monthRangeMs();
        return dueMs >= start && dueMs <= end;
    }

    return true;
}

export function matchesProjectTaskFilters(
    task: TaskFilterMatchInput,
    filters: ProjectTaskFilterValues,
    context: TaskFilterMatchContext = {},
): boolean {
    if (filters.taskType !== '' && task.taskType !== filters.taskType) return false;
    if (filters.priority !== '' && task.priority !== filters.priority) return false;
    if (filters.status !== '' && task.status !== filters.status) return false;

    if (filters.assigneeId !== '') {
        if (filters.assigneeId === '__unassigned') {
            if (task.assigneeId !== null) return false;
        } else if (task.assigneeId !== Number(filters.assigneeId)) {
            return false;
        }
    }

    if (filters.reviewerId !== '') {
        if (filters.reviewerId === '__unassigned') {
            if (task.reviewerId !== null) return false;
        } else if (task.reviewerId !== Number(filters.reviewerId)) {
            return false;
        }
    }

    if (!matchesDueFilter(task.dueDate, task.status, filters.dueMode, filters.dueDate)) {
        return false;
    }

    const q = filters.keyword.trim().toLowerCase();
    if (q === '') return true;

    const projectId = context.projectId;
    const code =
        projectId != null
            ? `TASK-${String(projectId).padStart(4, '0')}-${String(task.id).padStart(3, '0')}`.toLowerCase()
            : '';

    const blob = [
        task.title,
        task.description ?? '',
        task.assignee ?? '',
        task.reviewer ?? '',
        task.taskType,
        task.priority,
        task.status,
        task.dueDate ?? '',
        code,
        String(task.id),
        ...(context.keywordExtras ?? []),
    ]
        .join('\u0000')
        .toLowerCase();

    return blob.includes(q);
}
