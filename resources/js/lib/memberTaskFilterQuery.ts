import type { ProjectTaskFilterValues } from '@/lib/projectTaskFilters';

export interface MemberTasksServerFilters {
    keyword: string;
    task_type: string;
    status: string;
    assignee_id: number | null;
    assignee_unassigned?: boolean;
    reviewer_id: string | null;
    project_id: number | null;
    priority: string;
    due: string;
    due_date: string;
}

export function memberTaskFiltersFromServer(
    filters: MemberTasksServerFilters,
): ProjectTaskFilterValues {
    let assigneeId = '';
    if (filters.assignee_unassigned) {
        assigneeId = '__unassigned';
    } else if (filters.assignee_id !== null) {
        assigneeId = String(filters.assignee_id);
    }

    return {
        keyword: filters.keyword,
        taskType: filters.task_type,
        priority: filters.priority,
        status: filters.status,
        assigneeId,
        reviewerId: filters.reviewer_id ?? '',
        dueMode: (filters.due || '') as ProjectTaskFilterValues['dueMode'],
        dueDate: filters.due_date,
    };
}

export function memberTaskFilterPatchToQuery(
    patch: Partial<ProjectTaskFilterValues>,
): Record<string, string | number | undefined | null> {
    const out: Record<string, string | number | undefined | null> = {};

    if ('keyword' in patch) {
        out.keyword = patch.keyword?.trim() ?? '';
    }
    if ('taskType' in patch) {
        out.task_type = patch.taskType ?? '';
    }
    if ('priority' in patch) {
        out.priority = patch.priority ?? '';
    }
    if ('status' in patch) {
        out.status = patch.status ?? '';
    }
    if ('assigneeId' in patch) {
        out.assignee_id =
            patch.assigneeId === '' || patch.assigneeId === undefined
                ? null
                : patch.assigneeId === '__unassigned'
                  ? '__unassigned'
                  : Number(patch.assigneeId);
    }
    if ('reviewerId' in patch) {
        out.reviewer_id =
            patch.reviewerId === '' || patch.reviewerId === undefined
                ? null
                : patch.reviewerId;
    }
    if ('dueMode' in patch) {
        out.due = patch.dueMode ?? '';
    }
    if ('dueDate' in patch) {
        out.due_date = patch.dueDate ?? '';
    }

    return out;
}

export function memberTaskFiltersToQuery(
    filters: ProjectTaskFilterValues,
    projectId: number | null,
): Record<string, string | number> {
    const q: Record<string, string | number> = {};

    if (filters.keyword.trim() !== '') {
        q.keyword = filters.keyword.trim();
    }
    if (filters.taskType !== '') {
        q.task_type = filters.taskType;
    }
    if (filters.priority !== '') {
        q.priority = filters.priority;
    }
    if (filters.status !== '') {
        q.status = filters.status;
    }
    if (filters.assigneeId !== '') {
        q.assignee_id =
            filters.assigneeId === '__unassigned'
                ? '__unassigned'
                : Number(filters.assigneeId);
    }
    if (filters.reviewerId !== '') {
        q.reviewer_id = filters.reviewerId;
    }
    if (projectId !== null) {
        q.project_id = projectId;
    }
    if (filters.dueMode !== '') {
        q.due = filters.dueMode;
    }
    if (filters.dueMode === 'date' && filters.dueDate !== '') {
        q.due_date = filters.dueDate;
    }

    return q;
}
