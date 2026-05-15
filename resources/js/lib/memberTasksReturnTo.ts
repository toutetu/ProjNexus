/**
 * S-14 からタスク保存後に戻す相対 URL（return_to）。
 * Ziggy の route() は絶対 URL になり、サーバー側の検証で拒否されるためパスのみ組み立てる。
 */
export function buildMemberTasksReturnTo(
    queryParams: Record<string, string | number>,
): string {
    const search = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
        search.set(key, String(value));
    });
    const qs = search.toString();

    return qs === '' ? '/member-tasks' : `/member-tasks?${qs}`;
}
