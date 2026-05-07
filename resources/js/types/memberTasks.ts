import type { TaskCommentItem, TaskHistoryItem } from '@/Components/Modals/ProjectTaskDialog';

export type MemberTaskStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface MemberTaskItem {
    id: number;
    projectId: number;
    projectTitle: string;
    title: string;
    description: string | null;
    taskType: 'task' | 'feature' | 'improvement' | 'bug';
    priority: 'high' | 'medium' | 'low';
    status: MemberTaskStatus;
    progressRate: number;
    assigneeId: number | null;
    assignee: string | null;
    reviewerId: number | null;
    reviewer: string | null;
    dueDate: string | null;
    updatedAt: string | null;
    canUpdate: boolean;
    comments?: TaskCommentItem[];
    histories?: TaskHistoryItem[];
}
