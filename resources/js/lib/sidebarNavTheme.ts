/**
 * サイドバーセクション・案件詳細タブで共通利用するナビゲーション色トークン。
 * Sidebar.tsx の sectionNavTheme と同期させること。
 */
export type SidebarSectionVariant = 'approval' | 'dev' | 'budget';

export const sectionNavTheme: Record<
    SidebarSectionVariant,
    {
        labelColor: string;
        lineColor: string;
        activeClass: string;
        activeIconClass: string;
        /** フォルダ型タブのアクティブ面・スカラップ用（実色） */
        tabActiveSurfaceHex: string;
        tabActiveLabelClass: string;
    }
> = {
    approval: {
        labelColor: 'text-[#0099c4]',
        lineColor: 'bg-[#BAF1FF]',
        activeClass: 'bg-[#E0F7FF] text-[#0369a1] font-medium',
        activeIconClass: 'bg-[#BAF1FF] text-[#0369a1]',
        tabActiveSurfaceHex: '#E0F7FF',
        tabActiveLabelClass: 'text-[#0369a1]',
    },
    dev: {
        labelColor: 'text-[#106EBE]',
        lineColor: 'bg-[#BFDBFE]',
        activeClass: 'bg-[#EFF6FF] text-[#1D4ED8] font-medium',
        activeIconClass: 'bg-[#DBEAFE] text-[#1D4ED8]',
        tabActiveSurfaceHex: '#EFF6FF',
        tabActiveLabelClass: 'text-[#1D4ED8]',
    },
    budget: {
        labelColor: 'text-[#7c3aed]',
        lineColor: 'bg-[#DDD6FE]',
        activeClass: 'bg-[#F5F3FF] text-[#6D28D9] font-medium',
        activeIconClass: 'bg-[#EDE9FE] text-[#6D28D9]',
        tabActiveSurfaceHex: '#F5F3FF',
        tabActiveLabelClass: 'text-[#6D28D9]',
    },
};

/** 履歴タブ（セクション variant なし）：アクティブ時は薄いグレー面で区別 */
export const sidebarHistoryTabTheme = {
    tabActiveSurfaceHex: '#F3F4F6',
    tabActiveLabelClass: 'text-brand-dark',
} as const;
