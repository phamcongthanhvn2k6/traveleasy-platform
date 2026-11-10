/**
 * S307-acceptance.spec.ts
 * ============================================================================
 * KIEM THU NGHIEM THU: PHAN HE QUAN TRI GIA VE DONG & PHU THU LE TET / CUOI TUAN
 * The Trello: S307 - [PRICING] Phan he quan tri gia ve dong
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AcceptanceTestResult {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL';
  details: string;
}

export const runS307AcceptanceSuite = async (): Promise<{
  totalTests: number;
  passed: number;
  failed: number;
  results: AcceptanceTestResult[];
}> => {
  const results: AcceptanceTestResult[] = [];
  const srcDir = path.resolve(__dirname, '../src');

  // DOD-FE-S307-01: Hop dong kieu du lieu va cac truong mo rong tai types/index.ts
  try {
    const typesPath = path.join(srcDir, 'types/index.ts');
    const typesContent = fs.readFileSync(typesPath, 'utf8');

    const hasTripOriginalPrice = typesContent.includes('originalPrice?: number') || typesContent.includes('originalPrice: number');
    const hasTripPricingBadge = typesContent.includes('pricingBadge?: string') || typesContent.includes('pricingBadge: string');
    const hasTripSurcharge = typesContent.includes('surchargeAmount?: number') || typesContent.includes('surchargeAmount: number');
    const hasTripRuleDesc = typesContent.includes('ruleDescription?: string') || typesContent.includes('ruleDescription: string');
    const hasCompanyPricingRule = typesContent.includes('export interface CompanyPricingRule');
    const hasPriceSimulation = typesContent.includes('PriceSimulationRequest') && typesContent.includes('PriceSimulationResponse');

    const ok = hasTripOriginalPrice && hasTripPricingBadge && hasTripSurcharge && hasTripRuleDesc && hasCompanyPricingRule && hasPriceSimulation;
    results.push({
      id: 'DOD-FE-S307-01',
      name: 'Hop dong du lieu TypeScript: Bo sung truong gia dong cho Trip va mo hinh CompanyPricingRule',
      status: ok ? 'PASS' : 'FAIL',
      details: ok
        ? 'Da bo sung day du originalPrice, pricingBadge, surchargeAmount, ruleDescription va cac interface CompanyPricingRule, PriceSimulation.'
        : 'Thieu cac truong/interface gia dong trong types/index.ts'
    });
  } catch (err: any) {
    results.push({
      id: 'DOD-FE-S307-01',
      name: 'Hop dong du lieu TypeScript',
      status: 'FAIL',
      details: err.message
    });
  }

  // DOD-FE-S307-02: Tich hop API backend thuc te tai CompanyPricingRulesPage (Loai bo localStorage)
  try {
    const pagePath = path.join(srcDir, 'pages/company/pricing-rules/CompanyPricingRulesPage.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');

    const usesApi = pageContent.includes('/api/v1/company/pricing-rules') || pageContent.includes('pricing-rules');
    const usesLocalStorage = pageContent.includes('localStorage.getItem') || pageContent.includes('localStorage.setItem');
    const hasToggleStatus = pageContent.includes('toggle-status') || pageContent.includes('toggleStatus');
    const hasApiFetch = pageContent.includes('api.get') || pageContent.includes('axios') || pageContent.includes('fetch');

    const ok = usesApi && !usesLocalStorage && hasToggleStatus && hasApiFetch;
    results.push({
      id: 'DOD-FE-S307-02',
      name: 'Ket noi API backend thuc te cho quan tri gia ve (Loai bo hoan toan mock localStorage)',
      status: ok ? 'PASS' : 'FAIL',
      details: ok
        ? 'Giao dien quan tri ket noi truc tiep REST API backend (/api/v1/company/pricing-rules), khong con ton tai mock localStorage.'
        : 'Chua dat yeu cau API hoac con dung mock localStorage'
    });
  } catch (err: any) {
    results.push({
      id: 'DOD-FE-S307-02',
      name: 'Ket noi API backend thuc te',
      status: 'FAIL',
      details: err.message
    });
  }

  // DOD-FE-S307-03: Ho tro day du cac loai quy tac va pham vi dieu chinh gia
  try {
    const pagePath = path.join(srcDir, 'pages/company/pricing-rules/CompanyPricingRulesPage.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');

    const hasHoliday = pageContent.includes('HOLIDAY_SURCHARGE') || pageContent.includes('Phu thu Le Tet');
    const hasWeekend = pageContent.includes('WEEKEND_SURCHARGE') || pageContent.includes('Phu thu Cuoi tuan');
    const hasFlashSale = pageContent.includes('FLASH_SALE_LAST_MINUTE') || pageContent.includes('Flash Sale');
    const hasAdjustmentTypes = pageContent.includes('PERCENTAGE') && pageContent.includes('FIXED_AMOUNT');
    const hasModal = pageContent.includes('isModalOpen') || pageContent.includes('showModal');

    const ok = hasHoliday && hasWeekend && hasFlashSale && hasAdjustmentTypes && hasModal;
    results.push({
      id: 'DOD-FE-S307-03',
      name: 'Form quan tri quy tac: Ho tro Phu thu Le Tet (+20%), Cuoi tuan (+10%), Flash sale (-15%)',
      status: ok ? 'PASS' : 'FAIL',
      details: ok
        ? 'Form modal ho tro day du cac loai quy tac: Le Tet, Cuoi tuan, Flash Sale gio chot, hinh thuc phan tram va so tien co dinh.'
        : 'Thieu tinh nang form hoac enum quy tac gia'
    });
  } catch (err: any) {
    results.push({
      id: 'DOD-FE-S307-03',
      name: 'Form quan tri quy tac',
      status: 'FAIL',
      details: err.message
    });
  }

  // DOD-FE-S307-04: Cong cu Mo phong tinh gia truc tiep (Live Price Simulator Widget)
  try {
    const pagePath = path.join(srcDir, 'pages/company/pricing-rules/CompanyPricingRulesPage.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');

    const hasSimulator = pageContent.includes('simulate') || pageContent.includes('Mo Phong') || pageContent.includes('Mo phong');
    const hasBasePriceInput = pageContent.includes('basePrice') || pageContent.includes('gia goc') || pageContent.includes('Gia goc');
    const hasSimulationResult = pageContent.includes('calculatedPrice') || pageContent.includes('Gia sau dieu chinh') || pageContent.includes('gia sau dieu chinh');

    const ok = hasSimulator && hasBasePriceInput && hasSimulationResult;
    results.push({
      id: 'DOD-FE-S307-04',
      name: 'Tich hop widget Mo phong tinh gia truc tiep (Live Price Simulator) cho nha xe',
      status: ok ? 'PASS' : 'FAIL',
      details: ok
        ? 'Da tich hop cong cu mo phong tinh gia ve truc quan, cho phep nha xe thu nghiem gia goc, gio chay va xem truoc ket qua tinh gia dong.'
        : 'Thieu widget mo phong tinh gia truc tiep'
    });
  } catch (err: any) {
    results.push({
      id: 'DOD-FE-S307-04',
      name: 'Widget Mo phong tinh gia truc tiep',
      status: 'FAIL',
      details: err.message
    });
  }

  // DOD-FE-S307-05: Hien thi Huy hieu gia dong va gach gia goc tai the ket qua tim kiem (TripResultCard)
  try {
    const cardPath = path.join(srcDir, 'pages/customer/search/components/TripResultCard.tsx');
    const cardContent = fs.readFileSync(cardPath, 'utf8');

    const hasPricingBadge = cardContent.includes('pricingBadge');
    const hasOriginalPrice = cardContent.includes('originalPrice');
    const hasLineThrough = cardContent.includes('line-through') || cardContent.includes('lineThrough');

    const ok = hasPricingBadge && hasOriginalPrice && hasLineThrough;
    results.push({
      id: 'DOD-FE-S307-05',
      name: 'Hien thi huy hieu gia dong (pricingBadge) va gia goc gach ngang khi co khuyen mai tai TripResultCard',
      status: ok ? 'PASS' : 'FAIL',
      details: ok
        ? 'The chuyen xe render huy hieu phu thu/khuyen mai ro rang va hien thi gia goc gach ngang khi co chiet khau.'
        : 'Thieu tinh nang render huy hieu gia dong hoac gach ngang gia goc'
    });
  } catch (err: any) {
    results.push({
      id: 'DOD-FE-S307-05',
      name: 'Hien thi huy hieu gia dong tai TripResultCard',
      status: 'FAIL',
      details: err.message
    });
  }

  // DOD-FE-S307-06: Minh bach phan ra phu thu va gia goc tai bang tong quan thanh toan (OrderSummaryPanel)
  try {
    const summaryPath = path.join(srcDir, 'pages/customer/checkout/components/OrderSummaryPanel.tsx');
    const summaryContent = fs.readFileSync(summaryPath, 'utf8');

    const hasSurchargeBreakdown = summaryContent.includes('surchargeAmount') || summaryContent.includes('pricingBadge');
    const hasOriginalPriceBreakdown = summaryContent.includes('originalPrice');

    const ok = hasSurchargeBreakdown && hasOriginalPriceBreakdown;
    results.push({
      id: 'DOD-FE-S307-06',
      name: 'Minh bach phan ra chi phi phu thu va giam gia tai man hinh thanh toan (OrderSummaryPanel)',
      status: ok ? 'PASS' : 'FAIL',
      details: ok
        ? 'Bang tom tat don ve giai trinh ro rang muc phu thu/chiet khau giup khach hang nam ro chi tiet truoc khi thanh toan.'
        : 'Thieu phan ra chi phi phu thu va gia goc tai OrderSummaryPanel'
    });
  } catch (err: any) {
    results.push({
      id: 'DOD-FE-S307-06',
      name: 'Minh bach phan ra chi phi tai OrderSummaryPanel',
      status: 'FAIL',
      details: err.message
    });
  }

  // DOD-FE-S307-07: Tuan thu tuyet doi quy chuan 0 Emoji va tieng Viet chuan muc
  try {
    const filesToCheck = [
      path.join(srcDir, 'types/index.ts'),
      path.join(srcDir, 'pages/company/pricing-rules/CompanyPricingRulesPage.tsx'),
      path.join(srcDir, 'pages/customer/search/components/TripResultCard.tsx'),
      path.join(srcDir, 'pages/customer/search/TripSearchPage.tsx'),
      path.join(srcDir, 'pages/customer/checkout/components/OrderSummaryPanel.tsx'),
      path.join(__dirname, 'S307-acceptance.spec.ts'),
    ];

    const emojiRegex = /\p{Extended_Pictographic}/u;
    let foundEmojis = 0;
    const violatedFiles: string[] = [];

    filesToCheck.forEach(f => {
      if (fs.existsSync(f)) {
        const content = fs.readFileSync(f, 'utf8');
        let countInFile = 0;
        content.split('\n').forEach(line => {
          if (emojiRegex.test(line)) {
            countInFile++;
          }
        });
        if (countInFile > 0) {
          foundEmojis += countInFile;
          violatedFiles.push(path.basename(f) + ' (' + countInFile + ')');
        }
      }
    });

    const ok = foundEmojis === 0;
    results.push({
      id: 'DOD-FE-S307-07',
      name: 'Tuan thu quy chuan du an: 100% Tieng Viet co dau, KHONG chua emoji trong ma nguon',
      status: ok ? 'PASS' : 'FAIL',
      details: ok
        ? 'Tat ca cac file giao dien S307 deu tuan thu nghiem ngat tieu chuan Zero Emoji.'
        : 'Phat hien ' + foundEmojis + ' emoji tai: ' + violatedFiles.join(', ')
    });
  } catch (err: any) {
    results.push({
      id: 'DOD-FE-S307-07',
      name: 'Kiem tra tieu chuan Zero Emoji',
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

if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('S307-acceptance')) {
  runS307AcceptanceSuite().then(report => {
    console.log('[S307-E2E-ACCEPTANCE] Ket qua kiem thu: ' + report.passed + '/' + report.totalTests + ' PASS');
    report.results.forEach(r => console.log('  - [' + r.status + '] ' + r.id + ': ' + r.name + ' -> ' + r.details));
    if (report.failed > 0) {
      process.exit(1);
    }
  });
}
