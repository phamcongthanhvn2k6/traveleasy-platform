/**
 * S317-responsive-cross-browser.spec.ts
 * ============================================================================
 * KIỂM THỬ HỒI QUY GIAO DIỆN — BỐ CỤC THÍCH ỨNG VÀ TƯƠNG THÍCH TRÌNH DUYỆT (/)
 * Thẻ Trello: [FE][S317] (ID: 6ae81140)
 * Người thực hiện: Đoàn Nhật Cường (CuongLiam)
 * Leader phê duyệt: Phạm Công Thành (thanhphmcong1)
 * Công cụ: Playwright (Chromium / Firefox / WebKit / Edge) — render DOM thật
 * ============================================================================
 * Chạy: npm --prefix frontend run test:regression:s317
 * Ảnh chụp lưu tại: docs/screenshots/S317-<browser>-<viewport>.png
 */
import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const SHOT_DIR = path.resolve(process.cwd(), '..', 'docs', 'test-reports', 'cuong', 'screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: 'mobile-375x667', width: 375, height: 667 },
  { name: 'mobile-412x915', width: 412, height: 915 },
  { name: 'tablet-768x1024', width: 768, height: 1024 },
  { name: 'tablet-1024x768', width: 1024, height: 768 },
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'desktop-1920x1080', width: 1920, height: 1080 },
];

const hasHorizontalOverflow = (page: Page) =>
  page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );

// ---------------------------------------------------------------------------
// 1. RESPONSIVE: không tràn ngang + chụp ảnh thật ở mỗi viewport
// ---------------------------------------------------------------------------
test.describe('S317 Responsive layout', () => {
  for (const vp of VIEWPORTS) {
    test(`[S317-RS] ${vp.name}: không tràn ngang, render được trang chủ`, async ({ page }, info) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'networkidle' });

      await expect(page.locator('body')).toBeVisible();

      await page.screenshot({
        path: path.join(SHOT_DIR, `S317-${info.project.name}-${vp.name}.png`),
        fullPage: true,
      });

      expect(await hasHorizontalOverflow(page), 'Trang bị tràn chiều ngang').toBe(false);

      await page.screenshot({
        path: path.join(SHOT_DIR, `S317-${info.project.name}-${vp.name}.png`),
        fullPage: true,
      });
    });
  }

  test('[S317-RS] Mobile: nút submit tìm kiếm có touch target >= 44px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    // Điều chỉnh selector cho đúng SearchBar của dự án nếu cần
    const btn = page.locator('button[type="submit"]').first();
    await expect(btn).toBeVisible();
    const box = await btn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test('[S317-RS] Số cột lưới thay đổi theo breakpoint (layout thực đo từ DOM)', async ({ page }) => {
    // Đo số cột thật của phần tử grid đầu tiên trên trang
    const countCols = () =>
      page.evaluate(() => {
        const grid = Array.from(document.querySelectorAll<HTMLElement>('*')).find(
          (el) => getComputedStyle(el).display === 'grid' && el.children.length >= 2,
        );
        if (!grid) return 0;
        return getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
      });

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/', { waitUntil: 'networkidle' });
    const mobile = await countCols();

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(300);
    const desktop = await countCols();

    expect(desktop, 'Desktop phải có nhiều cột hơn mobile').toBeGreaterThan(mobile);
  });
});

// ---------------------------------------------------------------------------
// 2. CROSS-BROWSER: kiểm tra tính năng CSS thật trên engine đang chạy
// ---------------------------------------------------------------------------
test.describe('S317 Cross-browser', () => {
  test('[S317-CB] Engine hỗ trợ flexbox, grid, sticky, backdrop-filter', async ({ page, browserName }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const support = await page.evaluate(() => ({
      flexbox: CSS.supports('display', 'flex'),
      grid: CSS.supports('display', 'grid'),
      sticky: CSS.supports('position', 'sticky'),
      backdrop:
        CSS.supports('backdrop-filter', 'blur(4px)') ||
        CSS.supports('-webkit-backdrop-filter', 'blur(4px)'),
    }));
    console.log(`[${browserName}]`, support);
    expect(support).toEqual({ flexbox: true, grid: true, sticky: true, backdrop: true });
  });

  test('[S317-CB] Không có lỗi JS chưa bắt (pageerror) khi tải trang chủ', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/', { waitUntil: 'networkidle' });
    expect(errors, errors.join('\n')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 3. RBAC: khách vãng lai bị chặn ở tuyến admin/company
// ---------------------------------------------------------------------------
test.describe('S317 RBAC guard', () => {
  test('[S317-RBAC] Guest vào /admin/dashboard -> /admin/login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('[S317-RBAC] Guest vào /company/trips -> /company/login', async ({ page }) => {
    await page.goto('/company/trips');
    await expect(page).toHaveURL(/\/company\/login/);
  });
});

// ---------------------------------------------------------------------------
// 4. EDGE CASE: API backend lỗi -> trang không trắng, không crash
// ---------------------------------------------------------------------------
test.describe('S317 Edge cases', () => {
  test('[S317-EC] API lỗi/ngắt kết nối: trang chủ vẫn hiển thị nội dung', async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route('**/api/**', (route) => route.abort('failed'));

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const textLen = await page.evaluate(() => document.body.innerText.trim().length);
    expect(textLen, 'Màn hình bị trắng khi API lỗi').toBeGreaterThan(20);
    expect(errors, errors.join('\n')).toHaveLength(0);

    await page.screenshot({
      path: path.join(SHOT_DIR, `S317-${info.project.name}-api-offline.png`),
      fullPage: true,
    });
  });
});