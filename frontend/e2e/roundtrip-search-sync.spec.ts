/**
 * roundtrip-search-sync.spec.ts
 * ============================================================================
 * KIỂM THỬ: ĐỒNG BỘ NGÀY KHỨ HỒI KHI TĂNG/GIẢM NGÀY ĐI & TỰ ĐỘNG CHỮA LỖI URL
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLocalTodayDateString, getLocalNextDayString } from '../src/utils/dateUtils';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RoundTripCheck {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

export const calculateShiftedDates = (
  baseDate: string,
  currentReturnDate: string | undefined,
  days: number
): { newDepartureDate: string; newReturnDate?: string } => {
  const todayStr = getLocalTodayDateString();
  const depBase = baseDate || todayStr;
  const newDateStr = getLocalNextDayString(depBase, days);

  if (newDateStr < todayStr) {
    return { newDepartureDate: depBase, newReturnDate: currentReturnDate };
  }

  let newReturnDateStr: string | undefined = undefined;
  if (currentReturnDate && currentReturnDate.trim() !== '') {
    const [depY, depM, depD] = depBase.split('-').map(Number);
    const [retY, retM, retD] = currentReturnDate.split('-').map(Number);
    const depTime = new Date(depY, depM - 1, depD).getTime();
    const retTime = new Date(retY, retM - 1, retD).getTime();
    const diffDays = Math.round((retTime - depTime) / (1000 * 60 * 60 * 24));
    const safeGap = diffDays >= 0 ? diffDays : 2;
    newReturnDateStr = getLocalNextDayString(newDateStr, safeGap);
  }

  return { newDepartureDate: newDateStr, newReturnDate: newReturnDateStr };
};

export const runRoundTripSyncSuite = async (): Promise<{
  totalTests: number;
  passed: number;
  failed: number;
  results: RoundTripCheck[];
}> => {
  const results: RoundTripCheck[] = [];

  // Case 1: Tịnh tiến ngày khứ hồi khi nhấn "Hôm sau >"
  try {
    const initialDep = '2026-11-10';
    const initialRet = '2026-11-12'; // Cách nhau 2 ngày
    const shifted = calculateShiftedDates(initialDep, initialRet, 1);

    const isDepShifted = shifted.newDepartureDate === '2026-11-11';
    const isRetShifted = shifted.newReturnDate === '2026-11-13';

    results.push({
      id: 'ROUNDTRIP-SYNC-01',
      name: 'Tịnh tiến đồng bộ ngày về khi nhấn Hôm sau (+1 ngày)',
      status: (isDepShifted && isRetShifted) ? 'PASS' : 'FAIL',
      details: `Ban đầu: [Đi: ${initialDep}, Về: ${initialRet}] -> Sau khi bấm: [Đi: ${shifted.newDepartureDate}, Về: ${shifted.newReturnDate}]. Khoảng cách 2 ngày được bảo toàn trọn vẹn.`
    });
  } catch (err: any) {
    results.push({
      id: 'ROUNDTRIP-SYNC-01',
      name: 'Tịnh tiến đồng bộ ngày về khi nhấn Hôm sau',
      status: 'FAIL',
      details: err.message
    });
  }

  // Case 2: Tự động điều chỉnh khi ngày về trước ngày đi (như lỗi trong ảnh người dùng phản ánh)
  try {
    const invalidDep = '2026-11-11';
    const invalidRet = '2026-11-09'; // Lỗi: Ngày về trước ngày đi
    const healed = calculateShiftedDates(invalidDep, invalidRet, 1);

    const isDepOk = healed.newDepartureDate === '2026-11-12';
    // Phải được tự động sửa thành ngày về >= ngày đi (+2 ngày an toàn)
    const isRetHealed = Boolean(healed.newReturnDate && healed.newReturnDate >= healed.newDepartureDate);

    results.push({
      id: 'ROUNDTRIP-SYNC-02',
      name: 'Tự động chữa lành trạng thái lỗi khi ngày về nhỏ hơn ngày đi',
      status: (isDepOk && isRetHealed) ? 'PASS' : 'FAIL',
      details: `Đầu vào lỗi: [Đi: ${invalidDep}, Về: ${invalidRet}] -> Sau xử lý: [Đi: ${healed.newDepartureDate}, Về: ${healed.newReturnDate}]. Khắc phục lỗi nghịch lý ngày về trước ngày đi.`
    });
  } catch (err: any) {
    results.push({
      id: 'ROUNDTRIP-SYNC-02',
      name: 'Tự động chữa lành trạng thái lỗi',
      status: 'FAIL',
      details: err.message
    });
  }

  // Case 3: Kiểm tra trực tiếp file TripSearchHeader.tsx đã truyền đủ tham số và không dùng toISOString
  try {
    const headerPath = path.resolve(__dirname, '../src/pages/customer/search/components/TripSearchHeader.tsx');
    const headerContent = fs.readFileSync(headerPath, 'utf8');

    const usesToIsoString = headerContent.includes('.toISOString()');
    const passesReturnDateInStepper = headerContent.includes('newReturnDateStr');

    results.push({
      id: 'ROUNDTRIP-SYNC-03',
      name: 'Xác thực TripSearchHeader.tsx loại bỏ toISOString và truyền đủ newReturnDateStr',
      status: (!usesToIsoString && passesReturnDateInStepper) ? 'PASS' : 'FAIL',
      details: `Không dùng toISOString: ${!usesToIsoString}, Có truyền newReturnDateStr: ${passesReturnDateInStepper}.`
    });
  } catch (err: any) {
    results.push({
      id: 'ROUNDTRIP-SYNC-03',
      name: 'Xác thực TripSearchHeader.tsx',
      status: 'FAIL',
      details: err.message
    });
  }

  // Case 4: Kiểm tra không chứa ký tự mũi tên lạ (➔, →) hay Emoji trong TripSearchHeader và TripSearchPage
  try {
    const headerPath = path.resolve(__dirname, '../src/pages/customer/search/components/TripSearchHeader.tsx');
    const pagePath = path.resolve(__dirname, '../src/pages/customer/search/TripSearchPage.tsx');

    const headerContent = fs.readFileSync(headerPath, 'utf8');
    const pageContent = fs.readFileSync(pagePath, 'utf8');

    const hasGraphicArrow = headerContent.includes('➔') || headerContent.includes('→');
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const hasHeaderEmoji = emojiRegex.test(headerContent.replace(/['"]->['"]/g, ''));
    const hasPageEmoji = emojiRegex.test(pageContent);

    const isClean = !hasGraphicArrow && !hasHeaderEmoji && !hasPageEmoji;

    results.push({
      id: 'ROUNDTRIP-SYNC-04',
      name: 'Quy chuẩn hiển thị: Không ký tự mũi tên đồ họa (➔, →), 0 emoji',
      status: isClean ? 'PASS' : 'FAIL',
      details: `Mũi tên đồ họa: ${hasGraphicArrow ? 'CÒN TỒN TẠI' : 'SẠCH SẼ'}, Emoji: ${hasHeaderEmoji || hasPageEmoji ? 'CÒN TỒN TẠI' : 'SẠCH SẼ'}.`
    });
  } catch (err: any) {
    results.push({
      id: 'ROUNDTRIP-SYNC-04',
      name: 'Quy chuẩn hiển thị không emoji',
      status: 'FAIL',
      details: err.message
    });
  }

  const passed = results.filter(r => r.status === 'PASS').length;
  return {
    totalTests: results.length,
    passed,
    failed: results.length - passed,
    results
  };
};

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('roundtrip-search-sync')) {
  runRoundTripSyncSuite().then(report => {
    console.log(`[ROUNDTRIP-SYNC-TEST] Kết quả kiểm thử: ${report.passed}/${report.totalTests} PASS`);
    report.results.forEach(r => console.log(`  - [${r.status}] ${r.id}: ${r.name}`));
    if (report.failed > 0) process.exit(1);
  });
}
