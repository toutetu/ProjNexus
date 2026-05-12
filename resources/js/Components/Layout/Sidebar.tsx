import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    CheckSquare,
    Clock,
    FilePlus,
    FolderSearch,
    Inbox,
    LayoutDashboard,
    LayoutList,
    List,
    LogOut,
    PanelLeftClose,
    User as UserIcon,
    Wallet,
    type LucideIcon,
} from 'lucide-react';
import { createContext, ReactNode, useContext } from 'react';

import Challenge2Badge from '@/Components/Badge/Challenge2Badge';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { PROJECT_LIST_PAGE_TITLE } from '@/lib/projectListLabels';
import {
    type SidebarSectionVariant,
    sectionNavTheme,
} from '@/lib/sidebarNavTheme';
import { cn } from '@/lib/utils';
import type { PageProps, RoleName } from '@/types';

export type { SidebarSectionVariant };

const SidebarSectionVariantContext = createContext<SidebarSectionVariant | null>(null);

interface SidebarSectionProps {
    label: string;
    variant: SidebarSectionVariant;
    children: ReactNode;
}

function SidebarSection({ label, variant, children }: SidebarSectionProps) {
    return (
        <SidebarSectionVariantContext.Provider value={variant}>
            <div className="mt-3 first:mt-1">
                <div className="flex items-center gap-2 px-3 pb-1 pt-2.5">
                    <span
                        className={cn(
                            'whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.07em]',
                            sectionNavTheme[variant].labelColor,
                        )}
                    >
                        {label}
                    </span>
                    <div className={cn('h-px flex-1', sectionNavTheme[variant].lineColor)} />
                </div>
                {children}
            </div>
        </SidebarSectionVariantContext.Provider>
    );
}

interface SidebarLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
    active?: boolean;
    /** 親ラッパーが activeClass（背景）を持つときの内側行。背景・角丸はラッパーに任せる */
    insideMergedActive?: boolean;
    badge?: ReactNode;
    badgeClassName?: string;
    disabled?: boolean;
    dimLabel?: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    as?: 'a' | 'button';
    target?: string;
    rel?: string;
}

interface SidebarChildLabelProps {
    label: string;
    active?: boolean;
    /** 親ラッパーが activeClass を持つときの内側行 */
    insideMergedActive?: boolean;
    className?: string;
}

function SidebarChildLabel({
    label,
    active = false,
    insideMergedActive = false,
    className,
}: SidebarChildLabelProps) {
    const variant = useContext(SidebarSectionVariantContext);
    const mergedInner = insideMergedActive && active && variant !== null;
    const activeStyle =
        !mergedInner && active && variant !== null
            ? {
                  backgroundColor: sectionNavTheme[variant].activeBgHex,
                  color: sectionNavTheme[variant].activeTextHex,
                  borderColor: sectionNavTheme[variant].activeBorderHex,
              }
            : undefined;

    return (
        <div
            className={cn(
                'py-1 pl-11 pr-3 text-xs transition-colors',
                className,
                mergedInner
                    ? 'mx-0 w-full rounded-none bg-transparent font-medium text-inherit'
                    : 'mx-2 rounded-lg',
                mergedInner
                    ? undefined
                    : active && variant !== null
                      ? sectionNavTheme[variant].activeClass
                      : active
                        ? 'bg-gray-100 font-medium text-brand-dark'
                        : 'text-[#9CA3AF] hover:bg-gray-100',
            )}
            style={activeStyle}
        >
            {label}
        </div>
    );
}

function SidebarLink({
    href,
    icon: Icon,
    label,
    active = false,
    insideMergedActive = false,
    badge,
    badgeClassName,
    disabled = false,
    dimLabel,
    method,
    as,
    target,
    rel,
}: SidebarLinkProps) {
    const variant = useContext(SidebarSectionVariantContext);
    const theme = variant !== null ? sectionNavTheme[variant] : null;

    const mergedInner = Boolean(insideMergedActive && active && theme !== null);
    const baseClasses = cn(
        'flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors duration-150',
        mergedInner ? 'mx-0 w-full rounded-none bg-transparent text-inherit' : 'mx-2 rounded-lg',
    );
    const inactiveIconClass = 'bg-gray-100 text-gray-400';

    const stateClasses = disabled
        ? 'pointer-events-none cursor-not-allowed text-brand-muted opacity-50'
        : mergedInner
          ? 'justify-between font-medium hover:bg-transparent'
          : active && theme !== null
            ? theme.activeClass
            : active
              ? 'bg-gray-100 font-medium text-brand-dark'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700';

    const activeStyle =
        !mergedInner && active && theme !== null
            ? {
                  backgroundColor: theme.activeBgHex,
                  color: theme.activeTextHex,
                  borderColor: theme.activeBorderHex,
              }
            : undefined;
    const activeIconStyle =
        active && theme !== null
            ? {
                  backgroundColor: theme.activeIconBgHex,
                  color: theme.activeTextHex,
              }
            : undefined;

    const content = (
        <>
            <span className="flex min-w-0 flex-1 items-center gap-2">
                <span
                    className={cn(
                        'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px]',
                        active && theme !== null
                            ? theme.activeIconClass
                            : inactiveIconClass,
                    )}
                    style={activeIconStyle}
                    aria-hidden="true"
                >
                    <Icon size={11} />
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate">{label}</span>
                    {dimLabel && (
                        dimLabel === '課題2' ? (
                            <Challenge2Badge />
                        ) : (
                            <span className="rounded bg-slate-200 px-1 py-0.5 text-[9px] font-medium text-slate-700">
                                {dimLabel}
                            </span>
                        )
                    )}
                </span>
            </span>
            {badge !== undefined && badge !== null && (
                <span
                    className={cn(
                        'ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        badgeClassName ?? 'bg-brand-red text-white',
                    )}
                >
                    {badge}
                </span>
            )}
        </>
    );

    const composedClass = cn(baseClasses, stateClasses);

    if (disabled) {
        return (
            <div className={cn(composedClass, 'justify-between')} aria-disabled="true">
                {content}
            </div>
        );
    }

    if (target === '_blank') {
        return (
            <a href={href} target={target} rel={rel} className={composedClass} style={activeStyle}>
                {content}
            </a>
        );
    }

    return (
        <Link
            href={href}
            method={method}
            as={as}
            target={target}
            rel={rel}
            className={composedClass}
            style={activeStyle}
        >
            {content}
        </Link>
    );
}

function getInitial(name: string | undefined): string {
    if (!name) return '?';
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed[0] : '?';
}

const ROLE_LABEL: Record<RoleName, string> = {
    applicant: '申請者',
    dept_manager: '部門管理者',
    hq_manager: '本部管理者',
};

type ActiveKey =
    | 'dashboard'
    | 'new'
    | 'pending'
    | 'projects-approval'
    | 'projects-dev'
    | 'projects-budget'
    | 'tasks'
    | 'budget-input'
    | 'notifications'
    | 'manual'
    | 'profile'
    | null;

interface SidebarProps {
    activeKey?: ActiveKey;
    onToggleSidebar?: () => void;
}

export default function Sidebar({ activeKey = null, onToggleSidebar }: SidebarProps) {
    const page = usePage<PageProps>();
    const { auth, unreadNotificationCount = 0, pendingApprovalCount = 0 } = page.props;
    const user = auth.user;
    const roles = user.roles;
    const hasRole = (role: RoleName) => roles.includes(role);

    const isApplicant = hasRole('applicant');
    const isDeptManager = hasRole('dept_manager');
    const isHqManager = hasRole('hq_manager');

    const canCreate = isApplicant || isDeptManager;
    const canSeePendingList = isDeptManager || isHqManager;

    const primaryRole = roles[0];
    const roleLabel = primaryRole ? ROLE_LABEL[primaryRole] : 'ゲスト';
    const deptLabel = user.department?.name ?? '未所属';
    const pageUrl = page.url ?? '';
    const resolvedUrl = (() => {
        try {
            return new URL(pageUrl, 'http://cursor.local');
        } catch {
            return null;
        }
    })();
    const path = resolvedUrl?.pathname ?? pageUrl.split('?')[0] ?? '';
    const query = resolvedUrl?.search.slice(1) ?? pageUrl.split('?')[1] ?? '';
    const livePath = typeof window !== 'undefined' ? window.location.pathname : '';
    const liveQuery = typeof window !== 'undefined' ? window.location.search.slice(1) : '';
    const effectivePath = livePath || path;
    const effectiveQuery = liveQuery || query;
    const effectiveTab = new URLSearchParams(effectiveQuery).get('tab');
    const isProjectsIndexPage = /\/projects\/?$/.test(effectivePath);
    const memberTasksActive =
        activeKey === 'tasks' || /\/member-tasks\/?$/.test(effectivePath);
    const isProjectDetailPage = /^\/projects\/\d+\/?$/.test(effectivePath ?? '');
    const budgetInputMatch = (effectivePath ?? '').match(/^\/projects\/(\d+)\/budget-input\/?$/);
    const isBudgetInputPage = budgetInputMatch !== null;
    const detailTab = new URLSearchParams(effectiveQuery).get('detailTab');
    const detailSection = !(isProjectDetailPage || isBudgetInputPage)
        ? null
        : isBudgetInputPage
          ? 'budget'
          : detailTab === 'tasks'
            ? 'dev'
            : detailTab === 'budget'
              ? 'budget'
              : 'approval';

    /** 案件詳細でタブ切替が replaceState のとき、Inertia の page.url と detailTab がずれるため activeKey を優先する */
    const projectNavFromActiveKey: 'approval' | 'dev' | 'budget' | null =
        activeKey === 'projects-approval'
            ? 'approval'
            : activeKey === 'projects-dev'
              ? 'dev'
              : activeKey === 'projects-budget'
                ? 'budget'
                : null;

    const isProjectsCreatePage = /\/projects\/create\/?$/.test(effectivePath);
    const newActive = activeKey === 'new' || isProjectsCreatePage;
    const pendingActive = activeKey === 'pending';

    const isProjectsApprovalListPage = isProjectsIndexPage && effectiveTab === 'approval';
    const isProjectsDevListPage = isProjectsIndexPage && effectiveTab === 'dev';
    const isProjectsBudgetListPage = isProjectsIndexPage && effectiveTab === 'budget';

    const approvalListActive =
        activeKey === 'projects-approval' ||
        ((activeKey === null || activeKey === undefined) && isProjectsApprovalListPage) ||
        (projectNavFromActiveKey === null && detailSection === 'approval');
    const devListActive =
        activeKey === 'projects-dev' ||
        ((activeKey === null || activeKey === undefined) && isProjectsDevListPage) ||
        (projectNavFromActiveKey === null && detailSection === 'dev');
    const budgetListActive =
        activeKey === 'projects-budget' ||
        activeKey === 'budget-input' ||
        ((activeKey === null || activeKey === undefined) && isProjectsBudgetListPage) ||
        (projectNavFromActiveKey === null && detailSection === 'budget');
    const budgetInputActive = activeKey === 'budget-input' || isBudgetInputPage;

    const effectiveDetailSection = projectNavFromActiveKey ?? detailSection;

    /** 一覧行と「↳ 案件詳細」の両方がアクティブなとき、角丸を 1 つのブロックに見せる */
    const approvalListDetailMerged =
        approvalListActive &&
        isProjectDetailPage &&
        effectiveDetailSection === 'approval';
    const devListDetailMerged =
        devListActive && isProjectDetailPage && effectiveDetailSection === 'dev';
    const budgetListDetailMerged =
        budgetListActive && isProjectDetailPage && effectiveDetailSection === 'budget';
    const budgetListDetailInputMerged =
        budgetInputActive && isBudgetInputPage && effectiveDetailSection === 'budget';

    return (
        <aside className="flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-brand-border bg-white text-brand-dark">
            <div className="relative flex min-h-14 items-center border-b border-brand-border py-2.5 pl-5 pr-0">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red">
                        <ApplicationLogo className="h-5 w-5 fill-white text-white" />
                    </div>
                    <div className="flex flex-col leading-tight">
                        <span className="text-[10px] font-medium text-[#6C757D]">
                            開発管理アプリ
                        </span>
                        <span className="text-[15px] font-semibold tracking-wide text-brand-dark">
                            ProjNexus
                        </span>
                    </div>
                </Link>
                <div className="group absolute right-0 top-1/2 -translate-y-1/2">
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="rounded-md p-2 text-[#6C757D] transition-colors hover:bg-gray-100 hover:text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                        aria-label="レフトナビを閉じる"
                    >
                        <PanelLeftClose className="h-4.5 w-4.5" />
                    </button>
                    <span className="pointer-events-none absolute right-0 top-full z-10 mt-1 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                        閉じる
                    </span>
                </div>
            </div>

            <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto py-2 text-sm">
                <SidebarSection label="申請・承認" variant="approval">
                    {canCreate && (
                        <SidebarLink
                            href={route('projects.create')}
                            icon={FilePlus}
                            label="新規申請"
                            active={newActive}
                        />
                    )}
                    {canSeePendingList && (
                        <SidebarLink
                            href="/projects?tab=approval&filter=pending"
                            icon={Clock}
                            label="承認待ち一覧"
                            active={pendingActive}
                            badge={
                                pendingApprovalCount > 0
                                    ? pendingApprovalCount > 99
                                        ? '99+'
                                        : pendingApprovalCount
                                    : undefined
                            }
                        />
                    )}
                    {approvalListDetailMerged ? (
                        <div
                            className={cn(
                                'mx-2 overflow-hidden rounded-lg',
                                sectionNavTheme.approval.activeClass,
                            )}
                            style={{
                                backgroundColor: sectionNavTheme.approval.activeBgHex,
                                color: sectionNavTheme.approval.activeTextHex,
                                borderColor: sectionNavTheme.approval.activeBorderHex,
                            }}
                        >
                            <SidebarLink
                                href="/projects?tab=approval"
                                icon={List}
                                label={PROJECT_LIST_PAGE_TITLE.approval}
                                active
                                insideMergedActive
                            />
                            <SidebarChildLabel
                                label="↳ 案件詳細"
                                active
                                insideMergedActive
                            />
                        </div>
                    ) : (
                        <>
                            <SidebarLink
                                href="/projects?tab=approval"
                                icon={List}
                                label={PROJECT_LIST_PAGE_TITLE.approval}
                                active={approvalListActive}
                            />
                            <SidebarChildLabel
                                label="↳ 案件詳細"
                                active={
                                    isProjectDetailPage &&
                                    effectiveDetailSection === 'approval'
                                }
                            />
                        </>
                    )}
                </SidebarSection>

                <SidebarSection label="開発管理" variant="dev">
                    <SidebarLink
                        href={route('member-tasks.index')}
                        icon={CheckSquare}
                        label="タスク一覧"
                        active={memberTasksActive}
                    />
                    {devListDetailMerged ? (
                        <div
                            className={cn(
                                'mx-2 overflow-hidden rounded-lg',
                                sectionNavTheme.dev.activeClass,
                            )}
                            style={{
                                backgroundColor: sectionNavTheme.dev.activeBgHex,
                                color: sectionNavTheme.dev.activeTextHex,
                                borderColor: sectionNavTheme.dev.activeBorderHex,
                            }}
                        >
                            <SidebarLink
                                href="/projects?tab=dev"
                                icon={LayoutList}
                                label={PROJECT_LIST_PAGE_TITLE.dev}
                                active
                                insideMergedActive
                            />
                            <SidebarChildLabel
                                label="↳ 案件詳細"
                                active
                                insideMergedActive
                            />
                        </div>
                    ) : (
                        <>
                            <SidebarLink
                                href="/projects?tab=dev"
                                icon={LayoutList}
                                label={PROJECT_LIST_PAGE_TITLE.dev}
                                active={devListActive}
                            />
                            <SidebarChildLabel
                                label="↳ 案件詳細"
                                active={
                                    isProjectDetailPage && effectiveDetailSection === 'dev'
                                }
                            />
                        </>
                    )}
                </SidebarSection>

                <SidebarSection label="予算管理" variant="budget">
                    <SidebarLink
                        href={route('dashboard')}
                        icon={LayoutDashboard}
                        label="ダッシュボード"
                        active={activeKey === 'dashboard'}
                    />
                    {budgetListDetailInputMerged ? (
                        <div
                            className={cn(
                                'mx-2 overflow-hidden rounded-lg',
                                sectionNavTheme.budget.activeClass,
                            )}
                            style={{
                                backgroundColor: sectionNavTheme.budget.activeBgHex,
                                color: sectionNavTheme.budget.activeTextHex,
                                borderColor: sectionNavTheme.budget.activeBorderHex,
                            }}
                        >
                            <SidebarLink
                                href="/projects?tab=budget"
                                icon={Wallet}
                                label={PROJECT_LIST_PAGE_TITLE.budget}
                                active
                                insideMergedActive
                            />
                            <SidebarChildLabel
                                label="↳ 案件詳細"
                                active
                                insideMergedActive
                            />
                            <SidebarChildLabel
                                label="↳ 予算実績入力"
                                active
                                insideMergedActive
                                className="pl-14"
                            />
                        </div>
                    ) : budgetListDetailMerged ? (
                        <div
                            className={cn(
                                'mx-2 overflow-hidden rounded-lg',
                                sectionNavTheme.budget.activeClass,
                            )}
                            style={{
                                backgroundColor: sectionNavTheme.budget.activeBgHex,
                                color: sectionNavTheme.budget.activeTextHex,
                                borderColor: sectionNavTheme.budget.activeBorderHex,
                            }}
                        >
                            <SidebarLink
                                href="/projects?tab=budget"
                                icon={Wallet}
                                label={PROJECT_LIST_PAGE_TITLE.budget}
                                active
                                insideMergedActive
                            />
                            <SidebarChildLabel
                                label="↳ 案件詳細"
                                active
                                insideMergedActive
                            />
                        </div>
                    ) : (
                        <>
                            <SidebarLink
                                href="/projects?tab=budget"
                                icon={Wallet}
                                label={PROJECT_LIST_PAGE_TITLE.budget}
                                active={budgetListActive}
                            />
                            <SidebarChildLabel
                                label="↳ 案件詳細"
                                active={
                                    (isProjectDetailPage || isBudgetInputPage) &&
                                    effectiveDetailSection === 'budget'
                                }
                            />
                            <SidebarChildLabel
                                label="↳ 予算実績入力"
                                active={budgetInputActive}
                                className="pl-14"
                            />
                        </>
                    )}
                    {budgetListDetailMerged && (
                        <SidebarChildLabel
                            label="↳ 予算実績入力"
                            active={false}
                            className="pl-14"
                        />
                    )}
                </SidebarSection>

                <SidebarSectionVariantContext.Provider value={null}>
                    <div className="mt-3 border-t border-brand-border pt-2.5">
                        <SidebarLink
                            href={route('notifications.index')}
                            icon={Bell}
                            label="通知"
                            active={activeKey === 'notifications'}
                            badge={
                                unreadNotificationCount > 0
                                    ? unreadNotificationCount > 99
                                        ? '99+'
                                        : unreadNotificationCount
                                    : undefined
                            }
                        />
                        <SidebarLink
                            href={route('manual.show')}
                            icon={BookOpen}
                            label="マニュアル"
                            active={activeKey === 'manual'}
                            target="_blank"
                            rel="noopener"
                        />
                        <SidebarLink
                            href={route('profile.edit')}
                            icon={UserIcon}
                            label="プロフィール"
                            active={activeKey === 'profile'}
                        />
                        <div className="mt-2 border-t border-brand-border pt-2">
                            <SidebarLink
                                href={route('logout')}
                                method="post"
                                as="button"
                                icon={LogOut}
                                label="ログアウト"
                            />
                        </div>
                    </div>
                </SidebarSectionVariantContext.Provider>
            </nav>

            <div className="flex items-center gap-3 border-t border-brand-border p-3">
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: '#E60013' }}
                    aria-hidden="true"
                >
                    {getInitial(user.name)}
                </div>
                <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-brand-dark">{user.name}</div>
                    <div className="truncate text-[11px] text-[#6C757D]">
                        {roleLabel} / {deptLabel}
                    </div>
                </div>
            </div>
        </aside>
    );
}

export type { ActiveKey };
