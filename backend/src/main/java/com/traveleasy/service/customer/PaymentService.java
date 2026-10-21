package com.traveleasy.service.customer;

import com.traveleasy.common.exception.AppException;
import com.traveleasy.common.exception.ErrorCode;
import com.traveleasy.config.VnPayConfig;
import com.traveleasy.dto.payment.PaymentInitRequest;
import com.traveleasy.dto.payment.PaymentInitResponse;
import com.traveleasy.dto.payment.PaymentStatusResponse;
import com.traveleasy.entity.*;
import com.traveleasy.repository.BookingRepository;
import com.traveleasy.repository.PaymentTransactionRepository;
import com.traveleasy.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final TicketRepository ticketRepository;
    private final VnPayConfig vnPayConfig;

    @Transactional
    public PaymentInitResponse initiatePayment(PaymentInitRequest request, String ipAddress) {
        Booking booking = bookingRepository.findByBookingCode(request.getBookingCode())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn đặt vé: " + request.getBookingCode()));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_ERROR, "Đơn đặt vé này đã bị hủy, không thể thanh toán");
        }

        // Tạo mã giao dịch tham chiếu duy nhất
        String randomSuffix = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        String txnRef = "TXN-" + booking.getBookingCode().replace("BK-", "") + "-" + randomSuffix;

        // Lưu bản ghi PaymentTransaction
        PaymentTransaction transaction = PaymentTransaction.builder()
                .txnRef(txnRef)
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .paymentMethod(request.getPaymentMethod())
                .amount(booking.getTotalAmount())
                .status(PaymentStatus.PENDING)
                .orderInfo("Thanh toan ve xe TravelEasy - " + booking.getBookingCode())
                .build();

        paymentTransactionRepository.save(transaction);

        PaymentInitResponse.PaymentInitResponseBuilder responseBuilder = PaymentInitResponse.builder()
                .bookingCode(booking.getBookingCode())
                .txnRef(txnRef)
                .paymentMethod(request.getPaymentMethod())
                .amount(booking.getTotalAmount())
                .status(PaymentStatus.PENDING);

        // Xử lý từng cổng thanh toán
        switch (request.getPaymentMethod()) {
            case VNPAY:
                String vnpayUrl = buildVnPayUrl(booking, txnRef, request.getBankCode(), ipAddress);
                responseBuilder.paymentUrl(vnpayUrl);
                break;

            case VIETQR:
                String vietQrContent = "TRAVELEASY " + booking.getBookingCode();
                String vietQrUrl = String.format(
                        "https://img.vietqr.io/image/MB-0988123456789-compact2.png?amount=%d&addInfo=%s&accountName=%s",
                        booking.getTotalAmount().longValue(),
                        URLEncoder.encode(vietQrContent, StandardCharsets.UTF_8),
                        URLEncoder.encode("CONG TY CP CONG NGHE TRAVELEASY VIET NAM", StandardCharsets.UTF_8)
                );

                responseBuilder.qrCodeUrl(vietQrUrl);
                responseBuilder.bankDetails(PaymentInitResponse.BankTransferDetails.builder()
                        .bankName("MB Bank (Ngân hàng Quân Đội)")
                        .bankCode("MB")
                        .accountNumber("0988123456789")
                        .accountHolder("CONG TY CP CONG NGHE TRAVELEASY VIET NAM")
                        .transferContent(vietQrContent)
                        .amount(booking.getTotalAmount())
                        .build());
                break;

            case MOMO:
            case ZALOPAY:
                // Mô phỏng deep-link ví điện tử
                String walletUrl = "https://test-payment.momo.vn/v2/gateway/pay?orderId=" + txnRef + "&amount=" + booking.getTotalAmount();
                responseBuilder.paymentUrl(walletUrl);
                break;

            case COD:
            default:
                // Thanh toán tiền mặt khi lên xe
                transaction.setStatus(PaymentStatus.PENDING);
                booking.setStatus(BookingStatus.CONFIRMED);
                bookingRepository.save(booking);
                break;
        }

        return responseBuilder.build();
    }

    private String buildVnPayUrl(Booking booking, String txnRef, String bankCode, String ipAddress) {
        String vnpVersion = vnPayConfig.getVnpVersion();
        String vnpCommand = vnPayConfig.getVnpCommand();
        String vnpTmnCode = vnPayConfig.getVnpTmnCode();

        long amount = booking.getTotalAmount().multiply(new BigDecimal(100)).longValue();

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnpVersion);
        vnpParams.put("vnp_Command", vnpCommand);
        vnpParams.put("vnp_TmnCode", vnpTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan ve xe TravelEasy - " + booking.getBookingCode());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getVnpReturnUrl());
        vnpParams.put("vnp_IpAddr", (ipAddress != null && !ipAddress.isBlank() && !"0:0:0:0:0:0:0:1".equals(ipAddress)) ? ipAddress : "127.0.0.1");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        LocalDateTime now = LocalDateTime.now();
        vnpParams.put("vnp_CreateDate", now.format(formatter));
        vnpParams.put("vnp_ExpireDate", now.plusMinutes(15).format(formatter));

        if (bankCode != null && !bankCode.isBlank()) {
            vnpParams.put("vnp_BankCode", bankCode);
        }

        // Tạo Query String và Secure Hash
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();

        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnpParams.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                try {
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                } catch (UnsupportedEncodingException e) {
                    log.error("Error encoding URL params", e);
                }

                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnpSecureHash = VnPayConfig.hmacSHA512(vnPayConfig.getVnpHashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;

        return vnPayConfig.getVnpPayUrl() + "?" + queryUrl;
    }

    @Transactional
    public PaymentStatusResponse processVnPayCallback(Map<String, String> params) {
        String vnpSecureHash = params.get("vnp_SecureHash");
        Map<String, String> fields = new HashMap<>(params);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        String signValue = VnPayConfig.hashAllFields(fields, vnPayConfig.getVnpHashSecret());
        boolean isValidSignature = signValue.equalsIgnoreCase(vnpSecureHash);

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");
        String bankCode = params.get("vnp_BankCode");

        PaymentTransaction transaction = paymentTransactionRepository.findByTxnRef(txnRef)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy giao dịch: " + txnRef));

        Booking booking = bookingRepository.findById(transaction.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn đặt vé"));

        if (!isValidSignature) {
            log.warn("VNPAY Callback: Sai chữ ký xác thực cho TxnRef {}", txnRef);
            transaction.setStatus(PaymentStatus.FAILED);
            transaction.setResponseCode("INVALID_SIGNATURE");
            paymentTransactionRepository.save(transaction);

            return PaymentStatusResponse.builder()
                    .bookingCode(booking.getBookingCode())
                    .txnRef(txnRef)
                    .paymentStatus(PaymentStatus.FAILED)
                    .bookingStatus(booking.getStatus())
                    .amount(transaction.getAmount())
                    .isPaid(false)
                    .message("Chữ ký bảo mật không hợp lệ!")
                    .build();
        }

        if ("00".equals(responseCode)) {
            // Thanh toán thành công
            transaction.setStatus(PaymentStatus.SUCCESS);
            transaction.setTransactionNo(transactionNo);
            transaction.setBankCode(bankCode);
            transaction.setResponseCode(responseCode);
            transaction.setPayDate(LocalDateTime.now());
            paymentTransactionRepository.save(transaction);

            // Kích hoạt vé & Đơn đặt vé
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
            tickets.forEach(t -> t.setStatus(TicketStatus.ISSUED));
            ticketRepository.saveAll(tickets);

            log.info("VNPAY Callback: Thanh toán thành công cho đơn {}", booking.getBookingCode());

            return PaymentStatusResponse.builder()
                    .bookingCode(booking.getBookingCode())
                    .txnRef(txnRef)
                    .paymentStatus(PaymentStatus.SUCCESS)
                    .bookingStatus(BookingStatus.CONFIRMED)
                    .paymentMethod(transaction.getPaymentMethod())
                    .amount(transaction.getAmount())
                    .transactionNo(transactionNo)
                    .payDate(transaction.getPayDate())
                    .isPaid(true)
                    .message("Thanh toán thành công qua VNPAY!")
                    .build();
        } else {
            // Thanh toán thất bại hoặc khách hủy
            transaction.setStatus(PaymentStatus.FAILED);
            transaction.setResponseCode(responseCode);
            paymentTransactionRepository.save(transaction);

            return PaymentStatusResponse.builder()
                    .bookingCode(booking.getBookingCode())
                    .txnRef(txnRef)
                    .paymentStatus(PaymentStatus.FAILED)
                    .bookingStatus(booking.getStatus())
                    .amount(transaction.getAmount())
                    .transactionNo(transactionNo)
                    .isPaid(false)
                    .message("Giao dịch thanh toán VNPAY không thành công (Mã lỗi: " + responseCode + ")")
                    .build();
        }
    }

    @Transactional
    public PaymentStatusResponse confirmVietQrTransfer(String bookingCode, String manualRef) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn đặt vé: " + bookingCode));

        PaymentTransaction transaction = paymentTransactionRepository.findFirstByBookingCodeOrderByCreatedAtDesc(bookingCode)
                .orElseGet(() -> {
                    PaymentTransaction newTxn = PaymentTransaction.builder()
                            .txnRef("TXN-VQR-" + bookingCode.replace("BK-", "") + "-" + (System.currentTimeMillis() % 100000))
                            .bookingId(booking.getId())
                            .bookingCode(booking.getBookingCode())
                            .paymentMethod(PaymentMethod.VIETQR)
                            .amount(booking.getTotalAmount())
                            .status(PaymentStatus.PENDING)
                            .build();
                    return paymentTransactionRepository.save(newTxn);
                });

        transaction.setStatus(PaymentStatus.SUCCESS);
        transaction.setTransactionNo(manualRef != null ? manualRef : "VQR-" + System.currentTimeMillis());
        transaction.setBankCode("MB");
        transaction.setResponseCode("00");
        transaction.setPayDate(LocalDateTime.now());
        paymentTransactionRepository.save(transaction);

        // Kích hoạt vé
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        tickets.forEach(t -> t.setStatus(TicketStatus.ISSUED));
        ticketRepository.saveAll(tickets);

        log.info("VietQR Confirm: Xác nhận thanh toán thành công cho đơn {}", bookingCode);

        return PaymentStatusResponse.builder()
                .bookingCode(bookingCode)
                .txnRef(transaction.getTxnRef())
                .paymentStatus(PaymentStatus.SUCCESS)
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentMethod(PaymentMethod.VIETQR)
                .amount(transaction.getAmount())
                .transactionNo(transaction.getTransactionNo())
                .payDate(transaction.getPayDate())
                .isPaid(true)
                .message("Xác nhận chuyển khoản VietQR thành công!")
                .build();
    }

    @Transactional(readOnly = true)
    public PaymentStatusResponse getPaymentStatus(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn đặt vé: " + bookingCode));

        Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository.findFirstByBookingCodeOrderByCreatedAtDesc(bookingCode);

        boolean isPaid = booking.getStatus() == BookingStatus.CONFIRMED;

        return PaymentStatusResponse.builder()
                .bookingCode(bookingCode)
                .txnRef(transactionOpt.map(PaymentTransaction::getTxnRef).orElse(null))
                .paymentStatus(transactionOpt.map(PaymentTransaction::getStatus).orElse(isPaid ? PaymentStatus.SUCCESS : PaymentStatus.PENDING))
                .bookingStatus(booking.getStatus())
                .paymentMethod(booking.getPaymentMethod())
                .amount(booking.getTotalAmount())
                .transactionNo(transactionOpt.map(PaymentTransaction::getTransactionNo).orElse(null))
                .payDate(transactionOpt.map(PaymentTransaction::getPayDate).orElse(null))
                .isPaid(isPaid)
                .message(isPaid ? "Đã thanh toán thành công" : "Đang chờ thanh toán")
                .build();
    }
}
