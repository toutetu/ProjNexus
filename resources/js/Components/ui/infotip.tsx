import { Info } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface InfotipProps {
    /** ツールチップ内の説明文 */
    children: ReactNode;
    /** トリガーボタンの aria-label */
    ariaLabel: string;
    /** ツールチップの水平寄せ（トリガー基準） */
    align?: 'left' | 'right';
    /** ラッパー（トリガー＋ツールチップ）への追加クラス（位置微調整用） */
    className?: string;
}

export function Infotip({ children, ariaLabel, align = 'right', className }: InfotipProps) {
    return (
        <div className={cn('group relative shrink-0', className)}>
            <button
                type="button"
                className="rounded-full p-0.5 text-brand-muted outline-none hover:text-brand-dark focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
                aria-label={ariaLabel}
            >
                <Info className="h-3.5 w-3.5" aria-hidden />
            </button>
            <span
                role="tooltip"
                className={cn(
                    'pointer-events-none invisible absolute top-full z-20 mt-1.5 w-[min(18rem,calc(100vw-2rem))] rounded-md border border-brand-border bg-white px-2.5 py-2 text-left text-xs leading-snug text-brand-dark shadow-md opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100',
                    align === 'right' ? 'right-0' : 'left-0',
                )}
            >
                {children}
            </span>
        </div>
    );
}
