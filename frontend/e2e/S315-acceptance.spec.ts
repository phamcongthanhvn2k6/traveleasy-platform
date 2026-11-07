/**
 * S315-acceptance.spec.ts
 * ============================================================================
 * KIỂM THỬ NGHIỆM THU ĐÁNH GIÁ — PHẢN HỒI NHÀ XE VÀ TRANG HƯỚNG DẪN (/reviews)
 * Thẻ Trello: [FE][S315]
 * Người thực hiện: Đoàn Nhật Cường (CuongLiam / JoshLiam)
 * Người rà soát: Phạm Công Thành (thanhphmcong1)
 * Công cụ: Playwright (Chromium / Firefox / WebKit / Edge) — DOM thật
 * Phạm vi: kiểm thử Frontend với API backend được mock bằng page.route()
 *          (không kiểm thử backend thật).
 * ============================================================================
 * Chạy: npm --prefix frontend run test:acceptance:s315
 * Ảnh chụp: docs/test-reports/cuong/screenshots/S315-<browser>-<mã test>.png
 *           (chụp tự động sau MỖI test, kể cả khi test fail)
 */
import { test, expect, type Page } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Không dùng __dirname vì package.json khai báo "type": "module"
const SHOT_DIR = path.resolve(process.cwd(), '..', 'docs', 'test-reports', 'cuong', 'screenshots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

// ⚠️ CẦN ĐỐI CHIẾU với mã nguồn dự án (AuthContext / api client)
const TOKEN_KEY = 'traveleasy_token';
const USER_KEY = 'traveleasy_user';

const SUCCESS_TEXT = 'Đăng đánh giá thành công';
const MODAL_TITLE = 'Viết Đánh Giá Chuyến Đi';

// ---------------------------------------------------------------------------
// Dữ liệu mock
// ---------------------------------------------------------------------------
const REVIEWS = [
  {
    id: 101,
    bookingCode: 'BOK-SUCCESS-01',
    customerName: 'Nguyễn Văn An',
    busCompanyName: 'Phương Trang (FUTA Bus Lines)',
    routeName: 'TP. Hồ Chí Minh ➔ Đà Lạt',
    rating: 5,
    punctualityRating: 5,
    cleanlinessRating: 5,
    serviceRating: 5,
    comment: 'Xe giường nằm êm ái, khởi hành đúng giờ, tài xế lái cẩn thận!',
    imageUrls: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
    companyReply: 'Phương Trang xin cảm ơn quý khách đã tin tưởng dịch vụ!',
    createdAt: '2026-11-01T08:30:00Z',
    status: 'APPROVED',
  },
  {
    id: 102,
    bookingCode: 'BOK-SUCCESS-02',
    customerName: 'Trần Thị Mai',
    busCompanyName: 'Thành Bưởi',
    routeName: 'TP. Hồ Chí Minh ➔ Cần Thơ',
    rating: 4,
    punctualityRating: 4,
    cleanlinessRating: 4,
    serviceRating: 4,
    comment: 'Nhân viên nhiệt tình, trạm dừng chân sạch sẽ.',
    imageUrls: '',
    companyReply: null,
    createdAt: '2026-11-02T10:00:00Z',
    status: 'APPROVED',
  },
];

const SUMMARY = {
  averageRating: 4.8,
  totalReviews: 2,
  rating5Count: 1,
  rating4Count: 1,
  rating3Count: 0,
  rating2Count: 0,
  rating1Count: 0,
  punctualityScore: 4.8,
  cleanlinessScore: 4.7,
  serviceScore: 4.9,
};

const COMPANIES = [
  { id: 1, name: 'Phương Trang (FUTA Bus Lines)' },
  { id: 2, name: 'Thành Bưởi' },
];

const ELIGIBLE = [
  {
    bookingId: 101,
    bookingCode: 'BOK-SUCCESS-01',
    passengerName: 'Đoàn Nhật Cường',
    busCompanyName: 'Phương Trang (FUTA Bus Lines)',
    routeName: 'TP. Hồ Chí Minh ➔ Đà Lạt',
  },
];

// PNG 1x1 để thay ảnh ngoài (tránh phụ thuộc mạng)
const PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=',
  'base64',
);

type MockOptions = {
  reviews?: unknown[];
  postDelayMs?: number;
  postMode?: 'rules' | 'unauthorized' | 'abort';
};

const json = (status: number, body: unknown) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
});

// Cài mock API; trả về mảng `posts` ghi lại mọi request POST /api/reviews
const setupMockApi = async (page: Page, opts: MockOptions = {}) => {
  const posts: Array<Record<string, unknown>> = [];
  const { reviews = REVIEWS, postDelayMs = 0, postMode = 'rules' } = opts;

  await page.route(/images\.unsplash\.com/, (r) =>
    r.fulfill({ status: 200, contentType: 'image/png', body: PIXEL }),
  );
  await page.route(/\/api\/reviews\/summary(\?.*)?$/, (r) =>
    r.fulfill(json(200, { status: 200, message: 'Success', data: SUMMARY })),
  );
  await page.route(/\/api\/bus-companies(\?.*)?$/, (r) =>
    r.fulfill(json(200, { status: 200, message: 'Success', data: COMPANIES })),
  );
  await page.route(/\/api\/bookings\/eligible-reviews(\?.*)?$/, (r) =>
    r.fulfill(json(200, { status: 200, data: ELIGIBLE })),
  );

  await page.route(/\/api\/reviews(\?.*)?$/, async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      return route.fulfill(json(200, { status: 200, message: 'Success', data: reviews }));
    }
    if (method !== 'POST') return route.continue();

    const body = route.request().postDataJSON() ?? {};
    posts.push(body);
    if (postDelayMs) await new Promise((res) => setTimeout(res, postDelayMs));

    if (postMode === 'abort') return route.abort('failed');
    if (postMode === 'unauthorized') {
      return route.fulfill(json(401, { status: 401, message: 'Phiên đăng nhập đã hết hạn' }));
    }
    if (!body.bookingCode || body.bookingCode === 'INVALID-999') {
      return route.fulfill(
        json(400, { status: 400, message: 'Mã vé không tồn tại hoặc chưa hoàn thành chuyến đi!' }),
      );
    }
    if (body.bookingCode === 'USED-CODE-111') {
      return route.fulfill(
        json(409, { status: 409, message: 'Chuyến xe này đã được gửi đánh giá trước đó!' }),
      );
    }
    return route.fulfill(
      json(201, { status: 201, message: `${SUCCESS_TEXT}!`, data: { id: 999, ...body } }),
    );
  });

  return { posts };
};

const loginAsCustomer = (page: Page) =>
  page.addInitScript(
    ([tokenKey, userKey]) => {
      localStorage.setItem(tokenKey, 'mock-valid-jwt-token-s315');
      localStorage.setItem(
        userKey,
        JSON.stringify({ id: 1, fullName: 'Đoàn Nhật Cường', role: 'CUSTOMER' }),
      );
    },
    [TOKEN_KEY, USER_KEY],
  );

const loginAsGuest = (page: Page) =>
  page.addInitScript(
    ([tokenKey, userKey]) => {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
    },
    [TOKEN_KEY, USER_KEY],
  );

// Mở modal viết đánh giá, điền mã vé + nhận xét, trả về nút gửi
const openFormAndFill = async (page: Page, code: string) => {
  await page.getByRole('button', { name: /Viết Đánh Giá/i }).click();
  await expect(page.getByText(MODAL_TITLE)).toBeVisible();
  // ⚠️ Selector theo placeholder — đối chiếu với form thật
  await page.getByPlaceholder(/Mã đặt vé/i).fill(code);
  await page.locator('textarea').fill('Chuyến đi kiểm thử nghiệm thu S315');
  return page.getByRole('button', { name: /Gửi Đánh Giá/i });
};

// ---------------------------------------------------------------------------
// Chụp ảnh sau MỖI test (kể cả fail) để luôn có bằng chứng
// ---------------------------------------------------------------------------
test.afterEach(async ({ page }, info) => {
  const id = info.title.match(/\[(S315-[A-Z0-9-]+)\]/)?.[1] ?? 'S315-unknown';
  try {
    await page.screenshot({
      path: path.join(SHOT_DIR, `${id}-${info.project.name}.png`),
      fullPage: true,
    });
  } catch {
    /* trang đã đóng — bỏ qua */
  }
});

test.describe('S315 — Hiển thị công khai', () => {
  test('[S315-01] Trang /reviews hiển thị tiêu đề, cam kết người đi thật và scorecard', async ({ page }) => {
    await setupMockApi(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    await expect(page.locator('h1')).toContainText('Đánh Giá & Trải Nghiệm Khách Hàng');
    await expect(page.getByText('100% Người Đi Thật')).toBeVisible();
    await expect(page.getByText('Chống Review Ảo Tuyệt Đối')).toBeVisible();
    await expect(page.getByText('4.8').first()).toBeVisible();
  });

  test('[S315-02] Đánh giá có phản hồi: hiển thị hộp phản hồi chính thức của nhà xe', async ({ page }) => {
    await setupMockApi(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    await expect(
      page.getByText('Phương Trang xin cảm ơn quý khách đã tin tưởng dịch vụ!'),
    ).toBeVisible();
    await expect(page.getByText('Ban Điều Hành Phương Trang (FUTA Bus Lines)')).toBeVisible();
  });

  test('[S315-03] Đánh giá không có phản hồi: không hiện hộp phản hồi cho nhà xe đó', async ({ page }) => {
    await setupMockApi(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    await expect(page.getByText('Nhân viên nhiệt tình, trạm dừng chân sạch sẽ.')).toBeVisible();
    // Chỉ có đúng 1 hộp phản hồi (của review 101), không có của "Thành Bưởi"
    await expect(page.getByText(/Ban Điều Hành/)).toHaveCount(1);
    await expect(page.getByText(/Ban Điều Hành Thành Bưởi/)).toHaveCount(0);
  });

  test('[S315-04] Lọc 5 sao: chỉ còn đánh giá 5 sao', async ({ page }) => {
    await setupMockApi(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    // ⚠️ Selector nút lọc — đối chiếu với giao diện thật
    const fiveStar = page.getByRole('button', { name: /5\s*sao/i }).first();
    await expect(fiveStar).toBeVisible();
    await fiveStar.click();

    await expect(page.getByText('Xe giường nằm êm ái, khởi hành đúng giờ')).toBeVisible();
    await expect(page.getByText('Nhân viên nhiệt tình, trạm dừng chân sạch sẽ.')).toHaveCount(0);
  });

  test('[S315-05] Trạng thái rỗng: chưa có đánh giá nào', async ({ page }) => {
    await setupMockApi(page, { reviews: [] });
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    await expect(page.locator('h1')).toContainText('Đánh Giá & Trải Nghiệm Khách Hàng');
    await expect(page.getByText(/chưa có đánh giá/i)).toBeVisible();
  });

  test('[S315-06] API reviews lỗi/ngắt kết nối: trang không trắng, không crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.route(/\/api\/reviews/, (r) => r.abort('failed'));

    await page.goto('/reviews', { waitUntil: 'networkidle' });

    await expect(page.locator('h1')).toContainText('Đánh Giá & Trải Nghiệm Khách Hàng');
    expect(errors, errors.join('\n')).toHaveLength(0);
  });

  test('[S315-07] Ảnh đính kèm: bấm vào ảnh mở lightbox', async ({ page }) => {
    await setupMockApi(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    const img = page.locator('img[src*="unsplash.com"]').first();
    await expect(img).toBeVisible();
    await img.click();

    // ⚠️ Selector lightbox — đối chiếu với component thật
    await expect(
      page.locator('[role="dialog"], [data-testid="lightbox"], .lightbox').first(),
    ).toBeVisible();
  });

  test('[S315-08] Trang hướng dẫn / quy chế (/policy) hiển thị đúng', async ({ page }) => {
    await page.goto('/policy', { waitUntil: 'networkidle' });

    await expect(page.locator('h1')).toContainText('Chính Sách & Quy Chế Hoạt Động');
    await expect(page.getByText('Minh bạch quyền lợi hành khách')).toBeVisible();
  });
});

test.describe('S315 — Quyền người dùng', () => {
  test('[S315-09] Khách chưa đăng nhập bấm "Viết Đánh Giá": bị yêu cầu đăng nhập, không mở form, không gọi API', async ({ page }) => {
    const { posts } = await setupMockApi(page);
    await loginAsGuest(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: /Viết Đánh Giá/i }).click();

    await expect(async () => {
      const redirected = /\/(auth|login)/.test(page.url());
      const toast = await page.getByText(/Bạn cần đăng nhập/i).isVisible();
      expect(redirected || toast).toBe(true);
    }).toPass({ timeout: 5000 });

    await expect(page.getByText(MODAL_TITLE)).toHaveCount(0);
    expect(posts).toHaveLength(0);
  });

  test('[S315-10] /reviews?bookingCode=... khi chưa đăng nhập: chuyển hướng sang đăng nhập kèm redirect', async ({ page }) => {
    await setupMockApi(page);
    await loginAsGuest(page);
    await page.goto('/reviews?bookingCode=BOK-123', { waitUntil: 'networkidle' });

    await expect(page).toHaveURL(/\/(auth|login).*redirect=/);
  });

  test('[S315-11] Đã đăng nhập: mở được form viết đánh giá', async ({ page }) => {
    await setupMockApi(page);
    await loginAsCustomer(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    await page.getByRole('button', { name: /Viết Đánh Giá/i }).click();
    await expect(page.getByText(MODAL_TITLE)).toBeVisible();
  });
});

test.describe('S315 — Gửi đánh giá: mã vé, lỗi, thao tác lặp', () => {
  test('[S315-12] Mã vé hợp lệ (hoàn thành chuyến): gửi thành công, đúng 1 request', async ({ page }) => {
    const { posts } = await setupMockApi(page);
    await loginAsCustomer(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    const submit = await openFormAndFill(page, 'BOK-SUCCESS-01');
    await submit.click();

    await expect(page.getByText(SUCCESS_TEXT)).toBeVisible();
    expect(posts).toHaveLength(1);
    expect(posts[0].bookingCode).toBe('BOK-SUCCESS-01');
  });

  test('[S315-13] Mã vé không tồn tại / chưa hoàn thành chuyến: bị từ chối rõ ràng', async ({ page }) => {
    const { posts } = await setupMockApi(page);
    await loginAsCustomer(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    const submit = await openFormAndFill(page, 'INVALID-999');
    await submit.click();

    await expect(
      page.getByText('Mã vé không tồn tại hoặc chưa hoàn thành chuyến đi!'),
    ).toBeVisible();
    await expect(page.getByText(SUCCESS_TEXT)).toHaveCount(0);
    expect(posts).toHaveLength(1);
  });

  test('[S315-14] Mã vé đã dùng để đánh giá: bị từ chối rõ ràng', async ({ page }) => {
    await setupMockApi(page);
    await loginAsCustomer(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    const submit = await openFormAndFill(page, 'USED-CODE-111');
    await submit.click();

    await expect(
      page.getByText('Chuyến xe này đã được gửi đánh giá trước đó!'),
    ).toBeVisible();
    await expect(page.getByText(SUCCESS_TEXT)).toHaveCount(0);
  });

  test('[S315-15] Bấm gửi liên tiếp khi mạng chậm: chỉ gửi 1 request (chống gửi lặp)', async ({ page }) => {
    const { posts } = await setupMockApi(page, { postDelayMs: 1500 });
    await loginAsCustomer(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    const submit = await openFormAndFill(page, 'BOK-SUCCESS-01');
    await submit.click();
    // Lần bấm thứ 2: nút có thể đã bị vô hiệu hóa -> timeout là hành vi đúng
    await submit.click({ timeout: 500 }).catch(() => undefined);
    await submit.click({ timeout: 500 }).catch(() => undefined);

    await page.waitForTimeout(2500);
    expect(posts, 'Gửi lặp: có nhiều hơn 1 request POST').toHaveLength(1);
  });

  test('[S315-16] Phiên hết hạn (401) khi gửi: không báo thành công giả', async ({ page }) => {
    await setupMockApi(page, { postMode: 'unauthorized' });
    await loginAsCustomer(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    const submit = await openFormAndFill(page, 'BOK-SUCCESS-01');
    await submit.click();

    await expect(page.getByText(SUCCESS_TEXT)).toHaveCount(0);
    await expect(async () => {
      const redirected = /\/(auth|login)/.test(page.url());
      const msg = await page.getByText(/hết hạn|đăng nhập lại|đăng nhập/i).first().isVisible();
      expect(redirected || msg).toBe(true);
    }).toPass({ timeout: 5000 });
  });

  test('[S315-17] Mất kết nối khi gửi: báo lỗi, không báo thành công giả', async ({ page }) => {
    await setupMockApi(page, { postMode: 'abort' });
    await loginAsCustomer(page);
    await page.goto('/reviews', { waitUntil: 'networkidle' });

    const submit = await openFormAndFill(page, 'BOK-SUCCESS-01');
    await submit.click();

    await expect(page.getByText(/lỗi|thất bại|kết nối|thử lại/i).first()).toBeVisible();
    await expect(page.getByText(SUCCESS_TEXT)).toHaveCount(0);
  });
});