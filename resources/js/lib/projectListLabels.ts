/** `/projects` のタブ別ページタイトル・サイドバー導線ラベル（旧「案件一覧」） */
export type ProjectIndexTab = 'approval' | 'dev' | 'budget';

export const PROJECT_LIST_PAGE_TITLE: Record<ProjectIndexTab, string> = {
    approval: '申請状況一覧',
    dev: '開発進捗一覧',
    budget: '予算状況一覧',
};
