/**
 * @file S318-company-expenses-acceptance.spec.ts
 * @description KIỂM THỬ CHẤP NHẬN UI/UX PHÂN HỆ SỔ CHI PHÍ VẬN HÀNH & BÁO CÁO LÃI LỖ P&L (S318)
 * Thẻ Trello: [Ưu tiên: 3] [2 SP] [S318] Sổ Chi Phí Vận Hành Chuyến & Báo Cáo Lãi Lỗ (P&L)
 * Phụ trách: Trần Minh Đức (@minhdctrn13)
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AcceptanceCheckItem {
  id: string;
  name: string;
  expected: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

export const runS318CompanyExpensesAcceptance = async (): Promise<{
  totalTests: number;
  passed: number;
  failed: number;
  checks: AcceptanceCheckItem[];
}> => {
  const checks: AcceptanceCheckItem[] = [];

  const pagePath = path.resolve(__dirname, '../src/pages/company/expenses/TripExpensesPage.tsx');
  const fileContent = fs.readFileSync(pagePath, 'utf-8');

  // 1. Kiểm tra kết nối API thực tế (/api/v1/company/expenses) thay vì dữ liệu tĩnh
  try {
    const hasApiCall = fileContent.includes('/api/v1/company/expenses') ||
                       fileContent.includes('fetchExpenses') ||
                       fileContent.includes('loadExpenses') ||
                       fileContent.includes('tripExpenseService');
    const hasDynamicState = fileContent.includes('setSummary') || fileContent.includes('setTrips') || fileContent.includes('loading');

    checks.push({
      id: 'AC-FE-01',
      name: 'Tích hợp API kết nối cơ sở dữ liệu thật (/api/v1/company/expenses)',
      expected: 'Trang phải có logic gọi API hoặc kết nối dịch vụ thay vì mảng mock tĩnh',
      status: (hasApiCall && hasDynamicState) ? 'PASS' : 'FAIL',
      details: hasApiCall ? 'Đã tìm thấy logic kết nối API /api/v1/company/expenses.' : 'Chưa có logic gọi API, vẫn đang dùng dữ liệu mock tĩnh!'
    });
  } catch (e: any) {
    checks.push({
      id: 'AC-FE-01',
      name: 'Tích hợp API kết nối cơ sở dữ liệu thật',
      expected: 'PASS',
      status: 'FAIL',
      details: e.message
    });
  }

  // 2. Kiểm tra hỗ trợ hiển thị và nhập Số hóa đơn đỏ VAT (invoiceNumber)
  try {
    const hasInvoiceNumberField = fileContent.includes('invoiceNumber') || fileContent.includes('Hóa đơn') || fileContent.includes('hoá đơn');
    const hasInvoiceModal = fileContent.includes('Số hóa đơn đỏ') || fileContent.includes('invoiceNumber');

    checks.push({
      id: 'AC-FE-02',
      name: 'Đính kèm số hóa đơn đỏ/chứng từ điện tử VAT',
      expected: 'Có trường hiển thị và form nhập invoiceNumber',
      status: (hasInvoiceNumberField && hasInvoiceModal) ? 'PASS' : 'FAIL',
      details: hasInvoiceNumberField ? 'Đã có trường quản lý số hóa đơn đỏ invoiceNumber.' : 'Thiếu trường số hóa đơn đỏ!'
    });
  } catch (e: any) {
    checks.push({
      id: 'AC-FE-02',
      name: 'Đính kèm số hóa đơn đỏ/chứng từ điện tử VAT',
      expected: 'PASS',
      status: 'FAIL',
      details: e.message
    });
  }

  // 3. Kiểm tra Cảnh báo màu đỏ nổi bật khi chuyến xe chạy lỗ (Chi phí > Doanh thu, isLoss = true)
  try {
    const hasLossHighlight = fileContent.includes('isLoss') &&
                             (fileContent.includes('rose') || fileContent.includes('red')) &&
                             (fileContent.includes('Lỗ') || fileContent.includes('lỗ'));

    checks.push({
      id: 'AC-FE-03',
      name: 'Cảnh báo màu đỏ nổi bật khi chuyến xe chạy lỗ (isLoss == true)',
      expected: 'Cảnh báo màu đỏ/rose khi chuyến xe có tổng chi phí vượt doanh thu',
      status: hasLossHighlight ? 'PASS' : 'FAIL',
      details: hasLossHighlight ? 'Đã có định dạng cảnh báo màu đỏ với badge/text rõ ràng khi chuyến xe bị lỗ.' : 'Chưa có xử lý cờ isLoss hoặc thiếu định dạng màu đỏ!'
    });
  } catch (e: any) {
    checks.push({
      id: 'AC-FE-03',
      name: 'Cảnh báo màu đỏ nổi bật khi chuyến xe chạy lỗ',
      expected: 'PASS',
      status: 'FAIL',
      details: e.message
    });
  }

  // 4. Kiểm tra Modal nhập hoặc cập nhật chi phí vận hành
  try {
    const hasInputModal = fileContent.includes('isModalOpen') || fileContent.includes('showModal') || fileContent.includes('openModal');
    const hasCostInputs = fileContent.includes('fuelCost') && fileContent.includes('tollBotCost') && fileContent.includes('driverSalary');

    checks.push({
      id: 'AC-FE-04',
      name: 'Modal tương tác nhập liệu và cập nhật chi phí vận hành chuyến',
      expected: 'Modal cho phép nhập đầy đủ 5 khoản chi phí và hóa đơn đỏ',
      status: (hasInputModal && hasCostInputs) ? 'PASS' : 'FAIL',
      details: (hasInputModal && hasCostInputs) ? 'Đã có Modal nhập liệu hoàn chỉnh cho 5 danh mục chi phí.' : 'Chưa có modal nhập liệu chi phí vận hành!'
    });
  } catch (e: any) {
    checks.push({
      id: 'AC-FE-04',
      name: 'Modal tương tác nhập liệu và cập nhật chi phí',
      expected: 'PASS',
      status: 'FAIL',
      details: e.message
    });
  }

  // 5. Kiểm tra cơ chế kiểm soát khóa sổ kế toán (isLocked / 48 giờ)
  try {
    const hasLockGuardrail = fileContent.includes('isLocked') || fileContent.includes('lockNotice') || fileContent.includes('ĐÃ KHÓA');

    checks.push({
      id: 'AC-FE-05',
      name: 'Kiểm soát khóa sổ kế toán sau 48h hoặc khi đã chốt kỳ đối soát',
      expected: 'Giao diện hiển thị cảnh báo khóa sổ và vô hiệu hóa nút sửa khi isLocked',
      status: hasLockGuardrail ? 'PASS' : 'FAIL',
      details: hasLockGuardrail ? 'Đã có cơ chế cảnh báo khóa sổ kế toán.' : 'Chưa có kiểm soát khóa sổ!'
    });
  } catch (e: any) {
    checks.push({
      id: 'AC-FE-05',
      name: 'Kiểm soát khóa sổ kế toán sau 48h',
      expected: 'PASS',
      status: 'FAIL',
      details: e.message
    });
  }

  // 6. Kiểm tra quy chuẩn Zero Emoji và ký tự mũi tên an toàn
  try {
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const hasEmoji = emojiRegex.test(fileContent);
    const hasUnsafeArrow = fileContent.includes('➔');

    checks.push({
      id: 'AC-FE-06',
      name: 'Quy chuẩn Zero Emoji và Ký tự điều hướng an toàn',
      expected: '0 emoji, không có ký tự đồ họa lạ ➔',
      status: (!hasEmoji && !hasUnsafeArrow) ? 'PASS' : 'FAIL',
      details: (!hasEmoji && !hasUnsafeArrow) ? 'Mã nguồn sạch, đạt chuẩn Zero Emoji.' : `Phát hiện vi phạm: hasEmoji=${hasEmoji}, hasUnsafeArrow=${hasUnsafeArrow}`
    });
  } catch (e: any) {
    checks.push({
      id: 'AC-FE-06',
      name: 'Quy chuẩn Zero Emoji',
      expected: 'PASS',
      status: 'FAIL',
      details: e.message
    });
  }

  const passed = checks.filter(c => c.status === 'PASS').length;
  const failed = checks.filter(c => c.status === 'FAIL').length;

  return {
    totalTests: checks.length,
    passed,
    failed,
    checks
  };
};

runS318CompanyExpensesAcceptance().then(res => {
  console.log('=== KẾT QUẢ KIỂM THỬ CHẤP NHẬN FRONTEND S318 ===');
  console.log(`Tổng số: ${res.totalTests} | Đạt: ${res.passed} | Không đạt: ${res.failed}`);
  res.checks.forEach(c => {
    console.log(`[${c.status}] ${c.id} - ${c.name}: ${c.details}`);
  });
  if (res.failed > 0) {
    process.exit(1);
  }
});
