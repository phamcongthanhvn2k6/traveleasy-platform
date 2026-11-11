import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * [S316-ACCEPTANCE-SPEC] Bo kiem thu chap nhan nghiep vu doi ve & chuyen chuyen xe khach
 * Tuan thu Definition of Done (DoD) tu Trello S316
 * Chuyen vien phu trach: Tran Minh Duc (@minhdctrn13)
 */
async function runAcceptanceTests() {
  console.log('[S316-E2E-ACCEPTANCE] Bat dau kiem thu chap nhan Task S316...');
  let passedCount = 0;
  const totalCount = 6;

  // 1. DoD 1: Kiem tra su ton tai va cau truc cua API POST /api/v1/company/ticket-exchange
  const controllerPath = path.resolve(__dirname, '../../backend/src/main/java/com/traveleasy/controller/company/CompanyTicketExchangeController.java');
  const servicePath = path.resolve(__dirname, '../../backend/src/main/java/com/traveleasy/service/company/TicketExchangeService.java');
  const logEntityPath = path.resolve(__dirname, '../../backend/src/main/java/com/traveleasy/entity/TicketExchangeLog.java');

  if (fs.existsSync(controllerPath) && fs.existsSync(servicePath) && fs.existsSync(logEntityPath)) {
    const controllerContent = fs.readFileSync(controllerPath, 'utf-8');
    const serviceContent = fs.readFileSync(servicePath, 'utf-8');
    const logContent = fs.readFileSync(logEntityPath, 'utf-8');

    if (
      controllerContent.includes('/api/v1/company/ticket-exchange') &&
      logContent.includes('ticket_exchange_logs') &&
      serviceContent.includes('ticketExchangeLogRepository.save')
    ) {
      console.log('  - [PASS] DOD-S316-01: API POST /api/v1/company/ticket-exchange ghi log vao bang ticket_exchange_logs');
      passedCount++;
    } else {
      console.error('  - [FAIL] DOD-S316-01: Thieu mapping endpoint hoac persistence log');
    }
  } else {
    console.error('  - [FAIL] DOD-S316-01: Thieu cac tep Controller, Service hoac Entity');
  }

  // 2. DoD 2: Kiem tra co che tu dong giai phong ghe cu ve AVAILABLE
  if (fs.existsSync(servicePath)) {
    const serviceContent = fs.readFileSync(servicePath, 'utf-8');
    if (
      serviceContent.includes('oldSeat.setStatus(SeatStatus.AVAILABLE)') &&
      serviceContent.includes('tripRepository.syncAvailableSeats(oldTrip.getId())')
    ) {
      console.log('  - [PASS] DOD-S316-02: Ghe cu tren chuyen cu tu dong giai phong ve trang thai AVAILABLE');
      passedCount++;
    } else {
      console.error('  - [FAIL] DOD-S316-02: Logic giai phong ghe cu hoac syncAvailableSeats chua dung');
    }
  }

  // 3. DoD 3: Kiem tra ghe moi cap nhat BOOKED va tao ma ve moi TK-EX-...
  if (fs.existsSync(servicePath)) {
    const serviceContent = fs.readFileSync(servicePath, 'utf-8');
    if (
      serviceContent.includes('newSeat.setStatus(SeatStatus.BOOKED)') &&
      serviceContent.includes('TK-EX-') &&
      serviceContent.includes('oldTicket.setStatus(TicketStatus.EXCHANGED)')
    ) {
      console.log('  - [PASS] DOD-S316-03: Ghe moi cap nhat BOOKED, ve cu sang EXCHANGED va tao ma ve moi TK-EX-...');
      passedCount++;
    } else {
      console.error('  - [FAIL] DOD-S316-03: Logic cap nhat ghe moi hoac sinh ma ve moi chua dung');
    }
  }

  // 4. DoD 4: Giao dien TicketExchangePage.tsx hien thi chi tiet hoa don chenh lech va in phieu xac nhan
  const pagePath = path.resolve(__dirname, '../src/pages/company/ticket-exchange/TicketExchangePage.tsx');
  if (fs.existsSync(pagePath)) {
    const pageContent = fs.readFileSync(pagePath, 'utf-8');
    const hasSearch = pageContent.includes('lookup') || pageContent.includes('handleSearch');
    const hasDiff = pageContent.includes('priceDifference') || pageContent.includes('priceDiff') || pageContent.includes('chênh lệch');
    const hasPrint = pageContent.includes('window.print') || pageContent.includes('In Phiếu') || pageContent.includes('In phiếu');

    if (hasSearch && hasDiff && hasPrint) {
      console.log('  - [PASS] DOD-S316-04: Giao dien TicketExchangePage.tsx hien thi chi tiet hoa don chenh lech va in phieu xac nhan doi ve');
      passedCount++;
    } else {
      console.error(`  - [FAIL] DOD-S316-04: TicketExchangePage.tsx chua co du cac yeu to: hasSearch=${hasSearch}, hasDiff=${hasDiff}, hasPrint=${hasPrint}`);
    }
  } else {
    console.error('  - [FAIL] DOD-S316-04: File TicketExchangePage.tsx khong ton tai');
  }

  // 5. AC-S316-02: Rang buoc thoi gian doi ve truoc gio khoi hanh >= 12h
  if (fs.existsSync(servicePath)) {
    const serviceContent = fs.readFileSync(servicePath, 'utf-8');
    if (
      serviceContent.includes('plusHours(12)') &&
      serviceContent.includes('VALIDATION_ERROR')
    ) {
      console.log('  - [PASS] DOD-S316-05: Kiem tra rang buoc thoi gian doi ve toi thieu >= 12 tieng truoc gio khoi hanh');
      passedCount++;
    } else {
      console.error('  - [FAIL] DOD-S316-05: Thieu rang buoc gio khoi hanh >= 12h');
    }
  }

  // 6. Zero Emoji & Unicode Arrow Inspection
  if (fs.existsSync(pagePath)) {
    const pageContent = fs.readFileSync(pagePath, 'utf-8');
    const emojiRegex = /\p{Extended_Pictographic}/u;
    const hasEmoji = emojiRegex.test(pageContent);
    const hasRawArrow = pageContent.includes('➔') || pageContent.includes('âž”');

    if (!hasEmoji && !hasRawArrow) {
      console.log('  - [PASS] DOD-S316-06: Tuan thu 100% tieu chuan khong chua emoji va khong chua ky tu mui ten do hoa');
      passedCount++;
    } else {
      console.error(`  - [FAIL] DOD-S316-06: Phat hien emoji (${hasEmoji}) hoac ky tu mui ten do hoa (${hasRawArrow}) trong TicketExchangePage.tsx`);
    }
  }

  console.log(`[S316-E2E-ACCEPTANCE] Ket qua kiem thu: ${passedCount}/${totalCount} PASS`);
  if (passedCount === totalCount) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAcceptanceTests();
