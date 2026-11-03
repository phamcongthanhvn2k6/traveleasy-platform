# 💰 ĐẶC TẢ NGHIỆP VỤ TÀI CHÍNH, ĐỐI SOÁT & KẾT TOÁN NHÀ XE
## HỆ THỐNG QUẢN LÝ NHÀ XE & ĐẶT VÉ XE KHÁCH LIÊN TỈNH TRAVELEASY
### CHUẨN MỰC TÀI CHÍNH CẤP DOANH NGHIỆP (ENTERPRISE FINANCIAL & RECONCILIATION SPECIFICATION)

---

> **MỤC TIÊU TÀI LIỆU:**  
> • Thiết lập khung pháp lý, công thức toán học và quy trình kiểm toán dòng tiền chuẩn xác 100%.  
> • Ngăn chặn triệt để mọi sai sót tính toán, gian lận tài chính, lệch sổ sách kế toán hoặc rủi ro thâm hụt tiền vé.  
> • Đáp ứng tiêu chuẩn kiểm toán thực tế của các sàn thương mại điện tử vận tải hàng đầu (Vexere, Grab, Shopee) và tuân thủ Luật Kế toán Việt Nam.

---

## 1. NGUYÊN TẮC BẤT BIẾN VỀ SỐ HỌC TIỀN TỆ (MONETARY INVARIANTS)

1. **Tuyệt đối cấm sử dụng số thực nhị phân (`float`, `double`):**
   * Trong tính toán tài chính, việc dùng kiểu `double` hay `float` dẫn tới sai số dấu phẩy động nhị phân (ví dụ: `0.1 + 0.2 = 0.30000000000000004`), gây lệch sổ sách sau hàng triệu giao dịch.
   * **Quy chuẩn bắt buộc:**
     * **Java Backend:** Bắt buộc 100% sử dụng `java.math.BigDecimal` với chế độ làm tròn tài chính `RoundingMode.HALF_UP` và scale cố định là `2` cho tỷ lệ, `0` cho số tiền VND.
     * **Cơ sở dữ liệu (MySQL / PostgreSQL):** Bắt buộc sử dụng `DECIMAL(14, 2)` hoặc `DECIMAL(16, 2)`, không dùng `FLOAT` hay `DOUBLE`.
2. **Nguyên tắc Đơn hàng Không Thể Âm (Zero-Negative Invariant):**
   * Số tiền khách phải trả sau khi trừ voucher khuyến mãi không bao giờ được nhỏ hơn 0:
     $$\text{FinalAmount} = \max(0, \text{GrossAmount} - \text{DiscountAmount})$$
3. **Nguyên tắc Bảo toàn Giá trị Vé (Conservation of Value):**
   * Giá trị của từng vé khi sinh ra luôn được phân rã thành các thành phần minh bạch:
     $$\text{TicketPrice} = \text{BasePrice} + \text{DeckSurcharge} + \text{SeatClassSurcharge} + \text{PickupSurcharge}$$
     $$\text{TotalPaidByCustomer} = \sum_{i=1}^{n} \text{TicketPrice}_i - \text{VoucherDiscount} + \text{InsuranceFee}$$

---

## 2. BẢN CHẤT DÒNG TIỀN & CƠ CHẾ KÝ QUỸ TRUNG GIAN (ESCROW MECHANICS)

Hệ thống TravelEasy vận hành theo mô hình **Sàn giao dịch trung gian giữ tiền bảo lãnh (Escrow Settlement Platform)**:

```
[Hành Khách] 
     │ (Thanh toán 100% tiền vé qua VNPAY / VietQR)
     ▼
[Tài Khoản Ký Quỹ Escrow Sàn TravelEasy] ──(Treo bảo lãnh đến khi xe hoàn thành chuyến + 24h)──┐
     │                                                                                        │
     ├─ Trích Hoa hồng Sàn (10%) ────────────────────────────────────────────────────────┐   │
     │                                                                                    │   │
     └─ Giải ngân Thực chi (Net Payout: 90%) ────────────────────────► [Tài Khoản Nhà Xe Đối Tác]
                                                                        (Đã xác minh qua KYB & CCCD)
```

1. **Vé Online (VNPAY, PayOS, VietQR, Thẻ):**
   * Tiền của khách chạy thẳng vào **Tài khoản Ký quỹ Trung gian của Sàn (TravelEasy Escrow Account)**.
   * Số tiền này **chưa thuộc quyền sở hữu của Nhà xe**, mà được Sàn "treo" bảo lãnh. Nếu nhà xe hủy chuyến hoặc không đón khách, Sàn trích quỹ Escrow hoàn trả 100% cho hành khách ngay lập tức mà không cần chờ nhà xe chuyển lại.
2. **Vé Tiền Mặt khi lên xe (COD):**
   * Nhà xe hoặc tài xế trực tiếp thu 100% tiền mặt từ hành khách tại bến.
   * Sàn chưa thu được tiền hoa hồng sàn (Commission 10%) trên các vé COD này $\rightarrow$ Hệ thống ghi nhận một khoản **Nợ phải thu hoa hồng sàn** đối với nhà xe.

---

## 3. CÔNG THỨC TOÁN HỌC KẾT TOÁN TIỀN CHO NHÀ XE (SETTLEMENT FORMULA)

Tại thời điểm khóa sổ kỳ đối soát, số tiền thực chi chuyển khoản cho nhà xe (**Net Payout**) được tính toán tự động theo công thức bất biến:

$$\mathbf{NetPayout} = \mathbf{A} - \mathbf{B} - \mathbf{C} - \mathbf{D} - \mathbf{E} + \mathbf{F}$$

### Giải thích chi tiết các biến số:

* $\mathbf{A}$ (**Doanh thu Vé Online Sàn đã thu hộ - Gross Online Revenue**):  
  Tổng tiền vé khách đã thanh toán thành công qua VNPAY, VietQR, PayOS của các chuyến xe đã hoàn thành trong kỳ:
  $$A = \sum \text{Amount}_{\text{Online Tickets}}$$

* $\mathbf{B}$ (**Phí Hoa hồng Sàn thu trên Vé Online - Platform Commission on Online**):  
  Khoản phí dịch vụ sàn được hưởng trên các vé online theo tỷ lệ hợp đồng ký kết (mặc định 10%):
  $$B = \sum (\text{Price}_{\text{Online Ticket}} \times \text{CommissionRate})$$

* $\mathbf{C}$ (**Phí Hoa hồng Sàn thu bù trên Vé COD - COD Commission Offset**):  
  Nhà xe đã tự thu 100% tiền mặt từ khách đi vé COD. Sàn cấn trừ khoản hoa hồng sàn của các vé COD này trực tiếp vào tiền vé online đang giữ hộ:
  $$C = \sum (\text{Price}_{\text{COD Ticket}} \times \text{CommissionRate})$$

* $\mathbf{D}$ (**Tiền Vé Hoàn Hủy Hợp Lệ - Refund Deduction**):  
  Tổng số tiền vé mà khách hàng đã hủy vé hợp lệ theo chính sách `CancellationPolicy` mà Sàn đã hoàn trả lại cho khách từ quỹ Escrow:
  $$D = \sum \text{RefundedAmountToPassengers}$$

* $\mathbf{E}$ (**Tiền Phạt Vi Phạm Quy Chế & Bồi Thường Sự Cố - Penalty & Compensation**):  
  Các khoản giảm trừ do lỗi vận hành từ phía nhà xe:
  * Nhà xe tự ý hủy chuyến bỏ rơi khách: Phạt bồi hoàn $150\%$ tiền vé cho khách (Khoản phạt $50\%$ trừ vào kỳ kết toán).
  * Đón khách trễ quá 60 phút không báo trước, tự ý đổi loại xe từ VIP Limousine xuống xe thường, hoặc tài xế thu thêm tiền phụ thu trái phép.
  $$E = \sum \text{PenaltyAmount}$$

* $\mathbf{F}$ (**Tiền Sàn Trợ Giá Khuyến Mãi - Voucher Marketing Subsidy**):  
  Nếu hành khách áp dụng mã giảm giá do chính Sàn TravelEasy tài trợ (chi phí Marketing của sàn, ví dụ: mã tân thủ `HELLOTRAVEL` giảm 50.000đ): Khách chỉ trả ít hơn, nhưng Sàn **bù đủ 100% số tiền 50.000đ này cho nhà xe**:
  $$F = \sum \text{DiscountAmount}_{\text{Platform Sponsored Vouchers}}$$

---

## 4. MÔ HÌNH HỆ THỐNG KẾ TOÁN KÉP (DOUBLE-ENTRY GENERAL LEDGER)

Mọi nghiệp vụ tài chính phát sinh đều được ghi nhận song song 2 vế cân bằng theo Luật Kế toán:

$$\sum \text{Nợ (Debit)} = \sum \text{Có (Credit)}$$

### Danh mục Hệ thống Tài khoản Tổng hợp Sàn:
* **TK 112 (Tiền gửi Ngân hàng Ký quỹ Escrow):** Tiền thực tế đang nằm trong tài khoản ngân hàng ký quỹ của TravelEasy.
* **TK 131 (Phải thu Khách hàng / Cổng thanh toán):** Tiền đang chờ VNPAY / PayOS chuyển về tài khoản Sàn.
* **TK 331 (Phải trả Đối tác Nhà xe):** Nghĩa vụ tài chính Sàn phải trả lại cho từng nhà xe sau khi hoàn tất chuyến đi.
* **TK 511 (Doanh thu Hoa hồng Dịch vụ Sàn):** Doanh thu thực tế mà TravelEasy được hưởng hợp pháp (10% hoa hồng).
* **TK 641 (Chi phí Bán hàng & Trợ giá Khuyến mãi):** Chi phí Sàn tự bỏ ra để trợ giá voucher cho hành khách.
* **TK 338 (Phải trả khác - Tiền bồi thường & Tranh chấp):** Quỹ giữ tiền bồi thường hoặc các khoản chờ phân định khiếu nại.

### Ma trận Định khoản 4 Nghiệp vụ Kinh tế Cốt lõi:

| STT | Nghiệp vụ phát sinh | Định khoản Nợ (Debit) | Định khoản Có (Credit) | Giải thích số học cân bằng |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Khách thanh toán vé Online 1.000.000đ | **Nợ TK 112:** 1.000.000đ | **Có TK 331 (Nhà xe):** 900.000đ<br>**Có TK 511 (Sàn):** 100.000đ | Tiền vào ngân hàng 1tr; phân bổ 900k trả nhà xe, 100k doanh thu sàn. |
| **2** | Khách đi vé COD 500.000đ (Nhà xe tự thu tiền) | **Nợ TK 331 (Nhà xe):** 50.000đ | **Có TK 511 (Sàn):** 50.000đ | Giảm nghĩa vụ phải trả nhà xe 50k để thu bù phí sàn. |
| **3** | Khách dùng Voucher Sàn giảm 50.000đ cho vé 500k | **Nợ TK 112:** 450.000đ<br>**Nợ TK 641 (Sàn chịu):** 50.000đ | **Có TK 331 (Nhà xe):** 450.000đ<br>**Có TK 511 (Sàn):** 50.000đ | Khách trả 450k; Sàn tự bù 50k marketing; Nhà xe vẫn nhận đủ quyền lợi. |
| **4** | Sàn giải ngân chuyển khoản thanh toán cho Nhà xe | **Nợ TK 331 (Nhà xe):** `NetPayout` | **Có TK 112 (Ngân hàng):** `NetPayout` | Giảm nợ nhà xe về 0.00đ; tiền rời tài khoản ngân hàng ký quỹ. |

---

## 5. THUẬT TOÁN ĐỐI SOÁT TỰ ĐỘNG 3 CHIỀU (THREE-WAY RECONCILIATION ALGORITHM)

Vào lúc 02:00 sáng mỗi ngày, dịch vụ tự động `DailyFinancialReconciliationJob` kích hoạt đối chiếu chéo giữa **3 nguồn dữ liệu độc lập**:

```
                       ┌─────────────────────────┐
                       │  Nguồn 1: Sổ cái CSDL   │
                       │     TravelEasy DB       │
                       └────────────┬────────────┘
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
┌─────────────────────────────┐           ┌─────────────────────────────┐
│    Nguồn 2: Báo cáo Sao kê  │           │   Nguồn 3: Sao kê Bút toán  │
│   Cổng VNPAY / PayOS API    │◄─────────►│  Tài khoản Ngân hàng Sàn    │
└─────────────────────────────┘           └─────────────────────────────┘
```

### Thuật toán phân loại & xử lý sai lệch:

1. **Khớp Hoàn Toàn (Match 100%):**  
   Mã đơn `BookingCode`, Mã giao dịch `TxnRef`, Số tiền `Amount`, và Trạng thái `Status` trùng khớp tuyệt đối trên cả 3 nguồn $\rightarrow$ Ghi nhận `ReconciliationStatus = VERIFIED`.
2. **Phát hiện Giao dịch Bóng Ma (Phantom Booking):**  
   * Dấu hiệu: Database sàn ghi nhận `CONFIRMED`, nhưng cổng VNPAY và Ngân hàng không có dòng tiền.
   * Nguyên nhân: Khách hàng dùng công cụ can thiệp request hoặc lỗi giả lập.
   * Xử lý: **Lập tức đóng băng vé**, thu hồi mã QR, chặn không cho check-in lên xe và gắn cờ cảnh báo đỏ gửi Kế toán trưởng.
3. **Phát hiện Tiền Rơi (Orphan Payment):**  
   * Dấu hiệu: Ngân hàng và VNPAY đã trừ tiền khách thành công, nhưng Database sàn vẫn ở trạng thái `PENDING_PAYMENT` (do nghẽn mạng webhook).
   * Xử lý: Thuật toán tự động kích hoạt vé sang `CONFIRMED`, phát hành vé điện tử qua SMS/Email cho khách và bù bút toán vào sổ cái.
4. **Phát hiện Sai Lệch Số Tiền (Amount Mismatch):**  
   * Dấu hiệu: Có giao dịch nhưng số tiền lệch nhau dù chỉ 1 đồng.
   * Xử lý: Đưa vào danh sách `DISPUTED_TRANSACTIONS`, tạm dừng kết toán chuyến xe đó chờ kế toán kiểm tra thủ công.

---

## 6. QUY TRÌNH PHÊ DUYỆT KIỂM TOÁN KÉP (DUAL-CONTROL / MAKER-CHECKER)

Để phòng chống rủi ro tham ô hoặc sai sót cá nhân, hệ thống áp dụng nguyên tắc **"Bốn Mắt" (Dual-Control)**:

1. **Người Lập (Maker - Kế toán viên sàn):**  
   * Kiểm tra bảng kê kỳ kết toán, rà soát danh sách vé hủy, các khoản phạt và trợ giá voucher.
   * Bấm nút "Trình duyệt Kỳ kết toán" $\rightarrow$ Chuyển trạng thái sang `PENDING_APPROVAL`.
2. **Người Duyệt (Checker - Kế toán trưởng hoặc Giám đốc Sàn):**  
   * Kiểm tra độc lập tính hợp lệ của bảng kê.
   * Bấm nút "Phê duyệt Giải ngân" $\rightarrow$ Chuyển trạng thái sang `AUDIT_APPROVED`.
   * **Ràng buộc hệ thống:** `maker_id != checker_id` (Tài khoản lập bảng kê không thể tự bấm duyệt chi).
3. **Bảo Mật Tài Khoản Thụ Hưởng (KYB Escrow Lockdown):**  
   * Lệnh giải ngân **chỉ được chuyển về duy nhất Số tài khoản ngân hàng ký quỹ (`escrow_bank_account`)** của chính doanh nghiệp nhà xe hoặc người đại diện pháp luật đã được thẩm định qua ảnh chụp CCCD 2 mặt và Giấy ĐKKD ở khâu duyệt hồ sơ KYB.
   * Giao diện Admin **tuyệt đối không có ô nhập số tài khoản ngân hàng mới khi giải ngân** $\rightarrow$ Ngăn chặn triệt để nguy cơ nhân viên gian lận tự ý đổi sang số tài khoản cá nhân để biển thủ công quỹ.

---

## 7. CẤU TRÚC BẢNG CƠ SỞ DỮ LIỆU ĐỐI SOÁT VÀ SỔ CÁI BẤT BIẾN

```sql
-- 1. Kỳ kết toán đối soát tổng thể (Settlement Periods)
CREATE TABLE settlement_periods (
  id                      CHAR(36)       NOT NULL DEFAULT (UUID()),
  settlement_code         VARCHAR(50)    NOT NULL, -- Mã kỳ: STL-202611-FUTA-01
  bus_company_id          CHAR(36)       NOT NULL,
  period_start_date       DATE           NOT NULL,
  period_end_date         DATE           NOT NULL,
  total_online_revenue    DECIMAL(14,2)  NOT NULL DEFAULT 0.00, -- A: Thu hộ online
  platform_commission_fee DECIMAL(14,2)  NOT NULL DEFAULT 0.00, -- B: Hoa hồng sàn vé online
  cod_commission_offset   DECIMAL(14,2)  NOT NULL DEFAULT 0.00, -- C: Hoa hồng bù từ vé COD
  refund_deduction        DECIMAL(14,2)  NOT NULL DEFAULT 0.00, -- D: Khấu trừ hoàn hủy
  penalty_deduction       DECIMAL(14,2)  NOT NULL DEFAULT 0.00, -- E: Khấu trừ phạt vi phạm
  voucher_subsidy         DECIMAL(14,2)  NOT NULL DEFAULT 0.00, -- F: Sàn trợ giá voucher
  net_payout_amount       DECIMAL(14,2)  NOT NULL DEFAULT 0.00, -- Thực chi (A - B - C - D - E + F)
  status                  VARCHAR(30)    NOT NULL DEFAULT 'DRAFT', 
  -- Statuses: DRAFT, PENDING_PARTNER, CONFIRMED, DISPUTED, AUDIT_APPROVED, PAID, CANCELLED
  bank_account_number     VARCHAR(50)    NOT NULL, -- Snapshot số TK đã duyệt KYB
  bank_account_owner      VARCHAR(100)   NOT NULL, -- Tên chủ TK khớp pháp nhân/CCCD
  bank_name               VARCHAR(100)   NOT NULL,
  created_by              VARCHAR(100)   NOT NULL, -- Maker (Email kế toán lập)
  approved_by             VARCHAR(100)   NULL,     -- Checker (Email kế toán trưởng duyệt)
  payout_tx_hash          VARCHAR(100)   NULL,     -- Mã bút toán ngân hàng Napas/VietQR
  paid_at                 DATETIME(3)    NULL,
  created_at              DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_settlement_code (settlement_code),
  KEY idx_settlement_company (bus_company_id),
  CONSTRAINT fk_settlement_company FOREIGN KEY (bus_company_id) REFERENCES bus_companies (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Chi tiết từng vé trong kỳ đối soát (Settlement Items)
CREATE TABLE settlement_items (
  id                      CHAR(36)       NOT NULL DEFAULT (UUID()),
  settlement_id           CHAR(36)       NOT NULL,
  trip_id                 BIGINT         NOT NULL,
  ticket_id               CHAR(36)       NOT NULL,
  ticket_code             VARCHAR(50)    NOT NULL,
  ticket_price            DECIMAL(12,2)  NOT NULL,
  payment_method          VARCHAR(20)    NOT NULL, -- VNPAY, VIETQR, PAYOS, COD
  commission_rate         DECIMAL(5,2)   NOT NULL, -- % hoa hồng (VD: 10.00)
  commission_amount       DECIMAL(12,2)  NOT NULL,
  item_type               VARCHAR(20)    NOT NULL DEFAULT 'TICKET', -- TICKET, REFUND, PENALTY, VOUCHER
  settlement_status       VARCHAR(20)    NOT NULL DEFAULT 'INCLUDED', -- INCLUDED, EXCLUDED, DISPUTED
  PRIMARY KEY (id),
  KEY idx_item_settlement (settlement_id),
  KEY idx_item_ticket (ticket_id),
  CONSTRAINT fk_settlement_item FOREIGN KEY (settlement_id) REFERENCES settlement_periods (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Sổ cái kế toán bất biến (Append-Only Financial Ledger)
CREATE TABLE financial_ledger_entries (
  id                      CHAR(36)       NOT NULL DEFAULT (UUID()),
  entry_code              VARCHAR(50)    NOT NULL, -- Mã bút toán: BT-20261115-XXXXX
  reference_id            VARCHAR(100)   NOT NULL, -- Liên kết BookingCode hoặc SettlementCode
  debit_account           VARCHAR(20)    NOT NULL, -- Tài khoản ghi Nợ (112, 131, 331...)
  credit_account          VARCHAR(20)    NOT NULL, -- Tài khoản ghi Có (331, 511, 641...)
  amount                  DECIMAL(14,2)  NOT NULL, -- Số tiền phát sinh
  currency                VARCHAR(10)    NOT NULL DEFAULT 'VND',
  description             TEXT           NOT NULL,
  balance_before          DECIMAL(14,2)  NOT NULL,
  balance_after           DECIMAL(14,2)  NOT NULL,
  created_at              DATETIME(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_entry_code (entry_code),
  KEY idx_ledger_ref (reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Sổ cái kế toán kép bất biến: Cấm UPDATE và DELETE, chỉ cho phép INSERT.';
```

---
*Tài liệu này là căn cứ tối cao phục vụ kiểm toán tài chính, thiết kế chức năng Sprint Đối soát & Báo cáo tốt nghiệp OJT của Nhóm 7.*
