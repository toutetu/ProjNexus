import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    BookOpen,
    Coins,
    FileCheck2,
    FolderSearch,
    Folders,
    Inbox,
    ListChecks,
    LogOut,
    PanelLeftClose,
    PlusCircle,
    User as UserIcon,
    Wallet,
    type LucideIcon,
} from 'lucide-react';
import { ReactNode } from 'react';

import Challenge2Badge from '@/Components/Badge/Challenge2Badge';
import { cn } from '@/lib/utils';
import type { PageProps, RoleName } from '@/types';

interface SidebarSectionProps {
    label: string;
    children: ReactNode;
}

function SidebarSection({ label, children }: SidebarSectionProps) {
    return (
        <div className="mt-5 first:mt-2">
            <div className="mb-1 px-5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
                {label}
            </div>
            {children}
        </div>
    );
}

interface SidebarLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
    active?: boolean;
    badge?: ReactNode;
    badgeClassName?: string;
    disabled?: boolean;
    dimLabel?: string;
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    as?: 'a' | 'button';
}

interface SidebarChildLabelProps {
    label: string;
    active?: boolean;
}

function SidebarChildLabel({ label, active = false }: SidebarChildLabelProps) {
    return (
        <div
            className={cn(
                'pl-12 pr-5 py-1.5 text-xs transition-colors',
                active ? 'text-white' : 'text-white/45',
            )}
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
    badge,
    badgeClassName,
    disabled = false,
    dimLabel,
    method,
    as,
}: SidebarLinkProps) {
    const baseClasses =
        'relative flex items-center gap-3 px-5 py-2.5 text-sm transition-colors';
    const stateClasses = disabled
        ? 'pointer-events-none text-white/40'
        : active
          ? 'bg-white/[0.06] text-white before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-brand-red'
          : 'text-white/85 hover:bg-white/5 hover:text-white';

    const content = (
        <>
            <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span className="flex items-center gap-1.5">
                    {label}
                    {dimLabel && (
                        dimLabel === '課題2' ? (
                            <Challenge2Badge />
                        ) : (
                            <span className="rounded bg-white/10 px-1 py-0.5 text-[9px] font-medium">
                                {dimLabel}
                            </span>
                        )
                    )}
                </span>
            </span>
            {badge !== undefined && badge !== null && (
                <span
                    className={cn(
                        'ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                        badgeClassName ?? 'bg-brand-red text-white',
                    )}
                >
                    {badge}
                </span>
            )}
        </>
    );

    if (disabled) {
        return (
            <div
                className={cn(baseClasses, stateClasses, 'justify-between')}
                aria-disabled="true"
            >
                {content}
            </div>
        );
    }

    return (
        <Link
            href={href}
            method={method}
            as={as}
            className={cn(baseClasses, stateClasses, 'justify-between')}
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
    const [path, query = ''] = pageUrl.split('?');
    const isProjectDetailPage = /^\/projects\/\d+$/.test(path ?? '');
    const detailTab = new URLSearchParams(query).get('detailTab');
    const detailSection = !isProjectDetailPage
        ? null
        : detailTab === 'tasks'
          ? 'dev'
          : detailTab === 'budget'
            ? 'budget'
            : 'approval';
    const approvalActive = activeKey === 'projects-approval' || detailSection === 'approval';
    const devActive = activeKey === 'projects-dev' || detailSection === 'dev';
    const budgetActive = activeKey === 'projects-budget' || detailSection === 'budget';

    return (
        <aside
            className="flex h-screen w-64 shrink-0 flex-col overflow-hidden text-white"
            style={{ background: '#212429' }}
        >
            <div className="relative flex min-h-14 items-center border-b border-white/10 pl-5 pr-0 py-3">
                <Link href="/" className="flex items-center gap-2">
                    <div
                        className="flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold text-white"
                        style={{
                            background:
                                'linear-gradient(135deg,#01CFFF 0%,#106EBE 50%,#6D28D9 100%)',
                        }}
                    >
                        J
                    </div>
                    <div className="text-[15px] font-bold tracking-wide">
                        開発管理アプリ
                    </div>
                </Link>
                <div className="group absolute right-0 top-1/2 -translate-y-1/2">
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="rounded-md p-2 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                        aria-label="レフトナビを閉じる"
                    >
                        <PanelLeftClose className="h-4.5 w-4.5" />
                    </button>
                    <span className="pointer-events-none absolute right-0 top-full mt-1 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                        閉じる
                    </span>
                </div>
            </div>

            <nav className="sidebar-scroll flex-1 min-h-0 overflow-y-auto py-3 text-sm">
                <SidebarSection label="申請・承認">
                    {canCreate && (
                        <SidebarLink
                            href={route('projects.create')}
                            icon={PlusCircle}
                            label="新規申請"
                            active={activeKey === 'new'}
                        />
                    )}
                    {canSeePendingList && (
                        <SidebarLink
                            href="/projects?tab=approval&filter=pending"
                            icon={Inbox}
                            label="承認待ち一覧"
                            active={activeKey === 'pending'}
                            badge={
                                pendingApprovalCount > 0
                                    ? pendingApprovalCount > 99
                                        ? '99+'
                                        : pendingApprovalCount
                                    : undefined
                            }
                        />
                    )}
                    <SidebarLink
                        href="/projects?tab=approval"
                        icon={FolderSearch}
                        label="案件一覧"
                        active={approvalActive}
                    />
                    <SidebarChildLabel label="|_案件詳細" active={detailSection === 'approval'} />
                </SidebarSection>

                <SidebarSection label="開発管理">
                    <SidebarLink
                        href="/projects?tab=dev"
                        icon={Folders}
                        label="案件一覧"
                        active={devActive}
                    />
                    <SidebarChildLabel label="|_案件詳細" active={detailSection === 'dev'} />
                    <SidebarLink
                        href={route('member-tasks.index')}
                        icon={ListChecks}
                        label="タスク一覧"
                        active={activeKey === 'tasks'}
                    />
                </SidebarSection>

                <SidebarSection label="予算管理">
                    <SidebarLink
                        href="/projects?tab=budget"
                        icon={Wallet}
                        label="案件一覧"
                        active={budgetActive}
                    />
                    <SidebarChildLabel label="|_案件詳細" active={detailSection === 'budget'} />
                    {isApplicant && (
                        <SidebarLink
                            href="#"
                            icon={Coins}
                            label="予算実績入力"
                            active={activeKey === 'budget-input'}
                        />
                    )}
                </SidebarSection>

                <div className="mt-5 border-t border-white/10 pt-4">
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
                    />
                    <SidebarLink
                        href={route('profile.edit')}
                        icon={UserIcon}
                        label="プロフィール"
                        active={activeKey === 'profile'}
                    />
                </div>
            </nav>

            <div className="flex items-center gap-3 border-t border-white/10 p-3">
                <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{
                        background: 'linear-gradient(135deg,#01CFFF,#6D28D9)',
                    }}
                    aria-hidden="true"
                >
                    {getInitial(user.name)}
                </div>
                <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium">
                        {user.name}
                    </div>
                    <div className="truncate text-[11px] text-white/50">
                        {roleLabel} / {deptLabel}
                    </div>
                </div>
                <div className="group relative ml-auto">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-white/50 transition-colors hover:text-white"
                        aria-label="ログアウト"
                    >
                        <LogOut className="h-4 w-4" />
                    </Link>
                    <span className="pointer-events-none absolute bottom-full right-0 mb-1 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                        ログアウト
                    </span>
                </div>
            </div>
        </aside>
    );
}

export type { ActiveKey };
