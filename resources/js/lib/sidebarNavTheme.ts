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
        activeBgHex: string;
        activeTextHex: string;
        activeBorderHex: string;
        activeIconBgHex: string;
        /** フォルダ型タブのアクティブ面・スカラップ用（実色） */
        tabActiveSurfaceHex: string;
        tabActiveLabelClass: string;
    }
> = {
    approval: {
        labelColor: 'text-[#0099c4]',
        lineColor: 'bg-[#BAF1FF]',
        activeClass: 'text-[#0369a1] font-medium border',
        activeIconClass: 'text-[#0369a1]',
        activeBgHex: '#E0F7FF',
        activeTextHex: '#0369a1',
        activeBorderHex: '#BAF1FF',
        activeIconBgHex: '#BAF1FF',
        tabActiveSurfaceHex: '#E0F7FF',
        tabActiveLabelClass: 'text-[#0369a1]',
    },
    dev: {
        labelColor: 'text-[#106EBE]',
        lineColor: 'bg-[#BFDBFE]',
        activeClass: 'text-[#1D4ED8] font-medium border',
        activeIconClass: 'text-[#1D4ED8]',
        activeBgHex: '#EFF6FF',
        activeTextHex: '#1D4ED8',
        activeBorderHex: '#BFDBFE',
        activeIconBgHex: '#DBEAFE',
        tabActiveSurfaceHex: '#EFF6FF',
        tabActiveLabelClass: 'text-[#1D4ED8]',
    },
    budget: {
        labelColor: 'text-[#7c3aed]',
        lineColor: 'bg-[#DDD6FE]',
        activeClass: 'text-[#6D28D9] font-medium border',
        activeIconClass: 'text-[#6D28D9]',
        activeBgHex: '#F5F3FF',
        activeTextHex: '#6D28D9',
        activeBorderHex: '#DDD6FE',
        activeIconBgHex: '#EDE9FE',
        tabActiveSurfaceHex: '#F5F3FF',
        tabActiveLabelClass: 'text-[#6D28D9]',
    },
};

/** 履歴タブ（セクション variant なし）：アクティブ時は薄いグレー面で区別 */
export const sidebarHistoryTabTheme = {
    tabActiveSurfaceHex: '#F3F4F6',
    tabActiveLabelClass: 'text-brand-dark',
} as const;
