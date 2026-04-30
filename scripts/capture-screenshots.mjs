/**
 * 利用マニュアル用スクリーンショット自動撮影スクリプト
 *
 * 使い方:
 *   1. XAMPP で MySQL を起動し、php artisan serve / npm run dev を立ち上げる
 *      （http://127.0.0.1:8000/ でアプリが動いていること、php artisan db:seed 済み）
 *   2. node scripts/capture-screenshots.mjs
 *
 * 出力先: doc/manual/images/*.png
 */

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../doc/manual/images');
const BASE = 'http://127.0.0.1:8000';
const PASSWORD = 'password';
const VIEWPORT = { width: 1440, height: 1024 };

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const log = (msg) => console.log(`[capture] ${msg}`);

async function shoot(page, name, { fullPage = true } = {}) {
    const path = resolve(OUT_DIR, `${name}.png`);
    await page.screenshot({ path, fullPage });
    log(`saved ${name}.png`);
}

async function login(context, email) {
    const page = await context.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', PASSWORD);
    await Promise.all([
        page.waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 15000 }),
        page.click('form button:has-text("ログイン")'),
    ]);
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    log(`logged in as ${email}, current URL=${page.url()}`);
    return page;
}

async function findProjectIdByTitle(page, title) {
    const link = page.locator(`a:has-text("${title}")`).first();
    const href = await link.getAttribute('href');
    const match = href && href.match(/\/projects\/(\d+)/);
    return match ? match[1] : null;
}

async function visit(page, path) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
}

// 01. ログイン画面（未ログイン）
{
    const ctx = await browser.newContext({ viewport: VIEWPORT, locale: 'ja-JP' });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    await shoot(page, '01_login');
    await ctx.close();
}

// 02-11. 申請者ロールでの操作画面
{
    const ctx = await browser.newContext({ viewport: VIEWPORT, locale: 'ja-JP' });
    const page = await login(ctx, 'applicant@example.com');

    // 02. 申請タブ一覧
    await visit(page, '/projects?tab=approval');
    await shoot(page, '02_projects_approval_applicant');

    // 案件IDを抽出（承認済の例として「EAM次世代ワークフロー改善」、却下の例として「高額インフラ増強計画」）
    const approvedId = await findProjectIdByTitle(page, 'EAM次世代ワークフロー改善');
    const rejectedHqId = await findProjectIdByTitle(page, '高額インフラ増強計画');
    log(`approvedId=${approvedId}, rejectedHqId=${rejectedHqId}`);

    // 03. 新規申請フォーム
    await visit(page, '/projects/create');
    await shoot(page, '03_projects_create');

    // 04. 案件詳細 申請タブ（承認済）
    if (approvedId) {
        await visit(page, `/projects/${approvedId}?detailTab=apply`);
        await shoot(page, '04_projects_show_approved_apply');

        // 05. 履歴タブ
        await visit(page, `/projects/${approvedId}?detailTab=history`);
        await shoot(page, '05_projects_show_history');

        // 06. タスクタブ
        await visit(page, `/projects/${approvedId}?detailTab=tasks`);
        await shoot(page, '06_projects_show_tasks');

        // 07. 予算タブ
        await visit(page, `/projects/${approvedId}?detailTab=budget`);
        await shoot(page, '07_projects_show_budget');
    }

    // 08. 却下案件の詳細
    if (rejectedHqId) {
        await visit(page, `/projects/${rejectedHqId}?detailTab=apply`);
        await shoot(page, '08_projects_show_rejected');
    }

    // 09. 開発タブ
    await visit(page, '/projects?tab=dev');
    await shoot(page, '09_projects_dev');

    // 10. 予算タブ
    await visit(page, '/projects?tab=budget');
    await shoot(page, '10_projects_budget');

    // 11. 通知一覧
    await visit(page, '/notifications');
    await shoot(page, '11_notifications');

    await ctx.close();
}

// 12. 部門管理者ロール：自部門の部門承認待ちを開いて承認画面を表示
{
    const ctx = await browser.newContext({ viewport: VIEWPORT, locale: 'ja-JP' });
    const page = await login(ctx, 'dept@example.com');

    await visit(page, '/projects?tab=approval&status=pending_dept');
    const pendingDeptId = await findProjectIdByTitle(page, '配管図OCR自動分類ツール');
    log(`pendingDeptId=${pendingDeptId}`);

    if (pendingDeptId) {
        await visit(page, `/projects/${pendingDeptId}?detailTab=apply`);
        await shoot(page, '12_dept_manager_approve_screen');
    }
    await ctx.close();
}

// 13. 本部管理者ロール：全社の承認待ちを俯瞰
{
    const ctx = await browser.newContext({ viewport: VIEWPORT, locale: 'ja-JP' });
    const page = await login(ctx, 'hq@example.com');

    await visit(page, '/projects?tab=approval');
    await shoot(page, '13_hq_manager_projects_index');

    await visit(page, '/projects?tab=budget');
    await shoot(page, '14_hq_manager_budget_overview');

    await ctx.close();
}

await browser.close();
log('done');
