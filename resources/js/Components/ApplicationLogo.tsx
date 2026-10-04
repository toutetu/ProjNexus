import { SVGAttributes } from 'react';

/** 左上の1枚。中心側の角を円弧で切り欠き、残り3枚は回転で描く */
const TILE_PATH =
    'M6.5 4H12a2.5 2.5 0 0 1 2.5 2.5v3.18A6.5 6.5 0 0 0 9.68 14.5H6.5A2.5 2.5 0 0 1 4 12V6.5A2.5 2.5 0 0 1 6.5 4z';

/**
 * ProjNexus のマーク。申請・承認・タスク・予算の4枚が、中心の案件データに集まる形。
 * 色は className の fill-* か text-*（currentColor）で指定する。
 */
export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            fill="currentColor"
            {...props}
            viewBox="0 0 32 32"
            xmlns="http://www.w3.org/2000/svg"
        >
            {[0, 90, 180, 270].map((deg) => (
                <path key={deg} d={TILE_PATH} transform={`rotate(${deg} 16 16)`} />
            ))}
            <circle cx="16" cy="16" r="3.5" />
        </svg>
    );
}
