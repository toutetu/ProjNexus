import type { LucideIcon } from 'lucide-react';
import { FileText, GitBranch, History, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';

import {
    sectionNavTheme,
    sidebarHistoryTabTheme,
} from '@/lib/sidebarNavTheme';
import { cn } from '@/lib/utils';

export type ProjectDetailTab = 'apply' | 'history' | 'tasks' | 'budget';

/** コンテンツ領域（サイドバー本体と同様に白ベース） */
export const PROJECT_DETAIL_TAB_CONTENT_CLASS = 'bg-white';

/** タブストリップ背景（白）— スカラップ外側の塗りと一致させる */
const TAB_STRIP_HEX = '#FFFFFF';

type TabTone =
    | { kind: 'section'; key: 'approval' | 'dev' | 'budget' }
    | { kind: 'history' };

function toneActiveSurface(tone: TabTone): string {
    if (tone.kind === 'history') {
        return sidebarHistoryTabTheme.tabActiveSurfaceHex;
    }
    return sectionNavTheme[tone.key].tabActiveSurfaceHex;
}

function toneActiveLabelClass(tone: TabTone): string {
    if (tone.kind === 'history') {
        return sidebarHistoryTabTheme.tabActiveLabelClass;
    }
    return sectionNavTheme[tone.key].tabActiveLabelClass;
}

interface FolderTabProps {
    active: boolean;
    onClick: () => void;
    icon: LucideIcon;
    label: string;
    tone: TabTone;
    badge?: ReactNode;
}

function FolderTab({ active, onClick, icon: Icon, label, tone, badge }: FolderTabProps) {
    const activeBg = toneActiveSurface(tone);
    const activeLabel = toneActiveLabelClass(tone);

    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={onClick}
            className={cn(
                'relative shrink-0 px-4 pb-2.5 pt-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                /* 非アクティブを上に重ね、隣のアクティブタブのスカラップ（白）が角で乗らないようにする */
                active
                    ? cn('z-[2] rounded-t-[12px] font-medium', activeLabel)
                    : 'z-[3] rounded-t-[10px] bg-white text-gray-600 hover:bg-gray-100 hover:text-brand-dark',
            )}
            style={
                active
                    ? {
                          backgroundColor: activeBg,
                          boxShadow: `0 1px 0 0 ${activeBg}`,
                      }
                    : undefined
            }
        >
            <span className="relative z-[1] inline-flex items-center gap-1.5">
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
                {badge}
            </span>
            {active && (
                <>
                    <span
                        className="pointer-events-none absolute -left-3 bottom-0 z-0 h-3 w-3 rounded-br-[12px]"
                        style={{
                            backgroundColor: TAB_STRIP_HEX,
                            boxShadow: `4px 4px 0 0 ${activeBg}`,
                        }}
                        aria-hidden
                    />
                    <span
                        className="pointer-events-none absolute -right-3 bottom-0 z-0 h-3 w-3 rounded-bl-[12px]"
                        style={{
                            backgroundColor: TAB_STRIP_HEX,
                            boxShadow: `-4px 4px 0 0 ${activeBg}`,
                        }}
                        aria-hidden
                    />
                </>
            )}
        </button>
    );
}

export interface ProjectDetailTabBarProps {
    activeTab: ProjectDetailTab;
    onTabChange: (tab: ProjectDetailTab) => void;
    showDevBudgetTabs: boolean;
    taskCount: number;
}

export default function ProjectDetailTabBar({
    activeTab,
    onTabChange,
    showDevBudgetTabs,
    taskCount,
}: ProjectDetailTabBarProps) {
    const devTheme = sectionNavTheme.dev;

    return (
        <div className="border-b border-brand-border bg-white">
            <div
                role="tablist"
                aria-label="案件詳細タブ"
                className="isolate flex items-end gap-2 px-2 pb-0 pt-2"
            >
                <FolderTab
                    tone={{ kind: 'section', key: 'approval' }}
                    active={activeTab === 'apply'}
                    onClick={() => onTabChange('apply')}
                    icon={FileText}
                    label="申請"
                />
                {showDevBudgetTabs && (
                    <>
                        <FolderTab
                            tone={{ kind: 'section', key: 'dev' }}
                            active={activeTab === 'tasks'}
                            onClick={() => onTabChange('tasks')}
                            icon={GitBranch}
                            label="開発"
                            badge={
                                <span
                                    className={cn(
                                        'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                                        activeTab === 'tasks'
                                            ? cn(devTheme.activeIconClass, 'font-semibold')
                                            : 'bg-gray-200 text-gray-700',
                                    )}
                                >
                                    {taskCount}
                                </span>
                            }
                        />
                        <FolderTab
                            tone={{ kind: 'section', key: 'budget' }}
                            active={activeTab === 'budget'}
                            onClick={() => onTabChange('budget')}
                            icon={Wallet}
                            label="予算"
                        />
                    </>
                )}
                <div className="mx-1 min-h-[10px] min-w-[1.25rem] flex-1" aria-hidden />
                <FolderTab
                    tone={{ kind: 'history' }}
                    active={activeTab === 'history'}
                    onClick={() => onTabChange('history')}
                    icon={History}
                    label="履歴"
                />
            </div>
        </div>
    );
}
