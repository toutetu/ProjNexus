// 予算と実績のグラフで共通の色（白黒印刷でも見分けやすい濃淡にしている）
export const BUDGET_COLORS = {
    budget: '#106EBE',
    actual: '#F09595',
    actualDot: '#E24B4A',
    over: '#A32D2D',
} as const;

export const formatManYen = (yen: number): string =>
    Math.round(yen / 10000).toLocaleString('ja-JP');
