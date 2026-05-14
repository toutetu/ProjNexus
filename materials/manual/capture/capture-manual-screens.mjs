import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../../..');
const outDir = path.join(root, 'materials', 'manual', 'images');
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:8000';

function loadIds() {
    const bootstrap = path.join(root, 'materials', 'manual', 'capture', 'manual-screenshot-bootstrap.php');
    const raw = execFileSync('php', [bootstrap], {
        encoding: 'utf8',
        cwd: root,
    });
    return JSON.parse(raw.trim());
}

async function login(context, page, email) {
    await context.clearCookies();
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('password');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL(/^(?!.*\/login)/, { timeout: 30_000 });
}

async function shot(page, name, opts = {}) {
    const file = path.join(outDir, name);
    await page.screenshot({
        path: file,
        fullPage: opts.fullPage ?? false,
        animations: 'disabled',
    });
    console.log('saved', name);
}

async function waitInertia(page) {
    await page.waitForTimeout(500);
}

async function closeRadixDialog(page) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
}

async function main() {
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    const ids = loadIds();
    const required = [
        'draftApplicant',
        'pendingDept',
        'pendingHq',
        'pendingHqSecond',
        'hqDirect',
        'approved',
        'resubmit',
        'prDemoEam',
    ];
    for (const k of required) {
        if (!ids[k]) {
            throw new Error(`missing id: ${k}`);
        }
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
        deviceScaleFactor: 2,
        locale: 'ja-JP',
    });

    const page = await context.newPage();

    // --- 15 applicant sidebar ---
    await login(context, page, 'applicant@example.com');
    await page.goto(`${BASE}/projects?tab=approval`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '15_sidebar_applicant.png', { fullPage: true });

    // --- 16 hq sidebar ---
    await login(context, page, 'hq@example.com');
    await page.goto(`${BASE}/projects?tab=approval`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '16_sidebar_hq_manager.png', { fullPage: true });

    // --- 17 profile ---
    await page.goto(`${BASE}/profile`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '17_profile.png', { fullPage: true });

    // --- 18 create confirm modal (applicant) ---
    await login(context, page, 'applicant@example.com');
    await page.goto(`${BASE}/projects/create`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await page.locator('#title').fill('マニュアル撮影用（未申請）');
    await page.locator('#department_id').selectOption({ label: '開発1部' });
    await page.locator('#purpose').fill('撮影用の目的説明です。');
    await page.locator('#estimated_amount').fill('1,000,000');
    await page.locator('#estimated_days').fill('30');
    await page.getByRole('button', { name: '申請する' }).first().click();
    await page.getByRole('heading', { name: '申請しますか？' }).waitFor({ state: 'visible', timeout: 10_000 });
    await waitInertia(page);
    await shot(page, '18_projects_create_confirm_modal.png');
    await page.getByRole('button', { name: 'キャンセル' }).filter({ hasText: 'キャンセル' }).last().click();

    // --- 19 draft edit ---
    await page.goto(`${BASE}/projects/${ids.draftApplicant}/edit`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '19_projects_edit.png', { fullPage: true });

    // --- 20–21 approval / rejection dialogs (dept on pending dept) ---
    await login(context, page, 'dept@example.com');
    await page.goto(`${BASE}/projects/${ids.pendingDept}`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await page.getByRole('button', { name: '承認' }).click();
    await page.getByRole('button', { name: '承認する' }).waitFor({ state: 'visible', timeout: 10_000 });
    await shot(page, '20_approval_dialog.png');
    await page.getByRole('dialog').getByRole('button', { name: 'キャンセル' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: '却下' }).click();
    await page.getByRole('button', { name: '却下する' }).waitFor({ state: 'visible', timeout: 10_000 });
    await shot(page, '21_rejection_dialog.png');
    await page.getByRole('dialog').getByRole('button', { name: 'キャンセル' }).click();

    // --- 22 task modal ---
    await login(context, page, 'applicant@example.com');
    await page.goto(`${BASE}/projects/${ids.approved}?detailTab=tasks`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await page.getByText('タスク一覧').first().waitFor({ state: 'visible', timeout: 20_000 });
    await page.getByRole('button', { name: 'タスク追加' }).last().click();
    await page
        .getByPlaceholder('例：IoTゲートウェイ設計書作成')
        .waitFor({ state: 'visible', timeout: 20_000 });
    await waitInertia(page);
    await shot(page, '22_task_modal.png');
    await closeRadixDialog(page);

    // --- 23 budget actual modal ---
    await page.goto(`${BASE}/projects/${ids.approved}?detailTab=budget`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await page.getByRole('button', { name: '実績を入力' }).click();
    await page.getByRole('heading', { name: '予算実績入力' }).waitFor({ state: 'visible', timeout: 15_000 });
    await shot(page, '23_budget_modal.png');
    await closeRadixDialog(page);

    // --- 24–26 member tasks ---
    await page.goto(`${BASE}/member-tasks?view=board`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '24_member_tasks_board.png', { fullPage: true });

    await login(context, page, 'dept@example.com');
    await page.goto(`${BASE}/member-tasks?view=members`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '25_member_tasks_members.png', { fullPage: true });

    await login(context, page, 'applicant@example.com');
    await page.goto(`${BASE}/member-tasks?view=list`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '26_member_tasks_list.png', { fullPage: true });

    // --- 27 task comments ---
    await page.goto(`${BASE}/projects/${ids.prDemoEam}?detailTab=tasks`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await page.locator('table tbody tr').first().click();
    await page.getByPlaceholder('コメントを追加...').waitFor({ state: 'visible', timeout: 15_000 });
    await page.getByPlaceholder('コメントを追加...').fill('マニュアル用のコメントです。');
    await page.getByRole('button', { name: '投稿' }).click();
    await page.waitForTimeout(1000);
    await shot(page, '27_task_comments.png');
    await closeRadixDialog(page);

    // --- 28 dept sidebar ---
    await login(context, page, 'dept@example.com');
    await page.goto(`${BASE}/projects?tab=approval`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '28_sidebar_dept_manager.png', { fullPage: true });

    // --- 29 pending dept filter ---
    await page.goto(`${BASE}/projects?tab=approval&filter=pending`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '29_projects_approval_pending_dept.png', { fullPage: true });

    // --- 30 take back ---
    await login(context, page, 'applicant@example.com');
    await page.goto(`${BASE}/projects/${ids.pendingDept}`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await page.getByRole('button', { name: '取り戻して下書きに戻す' }).scrollIntoViewIfNeeded();
    await shot(page, '30_take_back_button.png', { fullPage: true });

    // --- 31 hq direct badge（一覧では行が見えない場合があるため案件詳細で撮影） ---
    await login(context, page, 'dept@example.com');
    await page.goto(`${BASE}/projects/${ids.hqDirect}`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await page.getByText('本部直行').first().waitFor({ state: 'visible', timeout: 20_000 });
    await shot(page, '31_hq_direct_badge.png', { fullPage: true });

    // --- 32 resubmission chain (applicant2) ---
    await login(context, page, 'applicant2@example.com');
    await page.goto(`${BASE}/projects/${ids.resubmit}`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '32_resubmission_chain.png', { fullPage: true });

    // --- 33 pending dept stepper ---
    await login(context, page, 'applicant@example.com');
    await page.goto(`${BASE}/projects/${ids.pendingDept}`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '33_projects_show_pending_dept.png', { fullPage: true });

    // --- 34 pending hq stepper ---
    await page.goto(`${BASE}/projects/${ids.pendingHq}`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '34_projects_show_pending_hq.png', { fullPage: true });

    // --- 35 initial task after HQ approve (second pending-hq project) ---
    await login(context, page, 'hq@example.com');
    await page.goto(`${BASE}/projects/${ids.pendingHqSecond}`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await page.getByRole('button', { name: '承認' }).click();
    await page.getByRole('button', { name: '承認する' }).click();
    await page.waitForURL(/\/projects/, { timeout: 30_000 });
    await waitInertia(page);

    await login(context, page, 'applicant@example.com');
    await page.goto(`${BASE}/projects/${ids.pendingHqSecond}?detailTab=tasks`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await page.getByText('実装計画作成').first().waitFor({ state: 'visible', timeout: 20_000 });
    await shot(page, '35_initial_task_auto_created.png', { fullPage: true });

    // --- 36 dev tab deadline colors (hq) ---
    await login(context, page, 'hq@example.com');
    await page.goto(`${BASE}/projects?tab=dev`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '36_dev_tab_deadline_warning.png', { fullPage: true });

    // --- 37 budget over 100% ---
    await page.goto(`${BASE}/projects?tab=budget`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    const consumptionSelect = page.locator('select').filter({
        has: page.locator('option[value="over"]'),
    });
    await consumptionSelect.selectOption('over');
    await waitInertia(page);
    await page.waitForTimeout(600);
    await shot(page, '37_budget_alert_red.png', { fullPage: true });

    // --- 38 dashboard ---
    await login(context, page, 'applicant@example.com');
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '38_dashboard.png', { fullPage: true });

    // --- 39 hq member tasks no dept ---
    await login(context, page, 'hq@example.com');
    await page.goto(`${BASE}/member-tasks`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '39_member_tasks_hq_select_dept.png', { fullPage: true });

    // --- 40 task history in modal ---
    await login(context, page, 'applicant@example.com');
    await page.goto(`${BASE}/projects/${ids.approved}?detailTab=tasks`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await page.getByText('ユーザーストーリー分解と見積').first().click();
    await page.getByRole('button', { name: /変更履歴/ }).click();
    await page.waitForTimeout(500);
    await shot(page, '40_task_history_expand.png');
    await closeRadixDialog(page);

    // --- 41 dept create (hq direct flow indicator) ---
    await login(context, page, 'dept@example.com');
    await page.goto(`${BASE}/projects/create`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '41_projects_create_dept_manager.png', { fullPage: true });

    // --- 42 notifications types ---
    await page.goto(`${BASE}/notifications`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '42_notifications_types.png', { fullPage: true });

    // --- 43 header bell unread ---
    await login(context, page, 'applicant@example.com');
    await page.goto(`${BASE}/projects?tab=approval`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    const bell = page.getByRole('link', { name: /通知（未読/ });
    await bell.scrollIntoViewIfNeeded();
    await bell.screenshot({ path: path.join(outDir, '43_header_bell_unread.png') });
    console.log('saved 43_header_bell_unread.png');

    // --- 44 dev progress bars ---
    await page.goto(`${BASE}/projects?tab=dev`, { waitUntil: 'domcontentloaded' });
    await waitInertia(page);
    await shot(page, '44_projects_dev_progress_bar.png', { fullPage: true });

    await browser.close();
    console.log('done');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
