### 🚨 [CODE REVIEW & YÊU CẦU SỬA LỖI NGUY HIỂM] - Task [S319] Phân Công Tổ Lái & Lệnh Xuất Bến

Chào Cường (@CuongLiam), qua rà soát bảo mật và hiệu năng trên PR #67, phát hiện **1 lỗ hổng bảo mật cực kỳ nguy hiểm (CVSS 9.8)** và **các lỗi nghẽn dữ liệu nghiêm trọng** cần em sửa ngay:

---

#### 1. 🛑 LỖ HỔNG BẢO MẬT CỰC NGUY HIỂM: Bypass Phân Quyền & IDOR Trong `CompanyTripCrewController`
- **Vị trí**: Hàm `resolveCompanyId` tại dòng 74-86 trong `CompanyTripCrewController.java`:
  ```java
  private Long resolveCompanyId(Authentication authentication, Long busCompanyId) {
      if (authentication != null && authentication.isAuthenticated()) {
          User user = securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.DISPATCHER);
          if (user != null && user.getBusCompanyId() != null) {
              return user.getBusCompanyId();
          }
      }
      if (busCompanyId != null) {
          return busCompanyId; // ❌ CỰC KỲ NGUY HIỂM: Cho phép ghi đè busCompanyId bất kỳ!
      }
      return 14L; // ❌ Tự động fallback sang công ty 14 mà không cần đăng nhập!
  }
  ```
- **Hậu quả**: Khi một hacker hoặc người dùng nặc danh gọi API `POST /api/v1/company/crew/assignments?busCompanyId=1` hoặc `POST /api/v1/company/crew/trips/{id}/dispatch-permit?busCompanyId=1` mà không gửi JWT token (`authentication = null`), hệ thống **KHÔNG HỀ CHẶN**, mà lập tức chấp nhận và thực thi gán tài xế hoặc ký lệnh xuất bến cho nhà xe khác!
- **Khắc phục ngay**:
  ```java
  if (authentication == null || !authentication.isAuthenticated()) {
      throw new AppException(ErrorCode.UNAUTHORIZED, "Yêu cầu đăng nhập để thực hiện chức năng điều hành!");
  }
  User user = securityService.requireStaffRole(authentication, StaffRole.OWNER, StaffRole.DISPATCHER);
  return user.getBusCompanyId();
  ```
  Xóa bỏ hoàn toàn fallback `busCompanyId` từ RequestParam và giá trị hardcode `14L`.

---

#### 2. ⚠️ Tái diễn lỗi N+1 Query trong `getCrewAssignments`
- **Vị trí**: Dòng 37-44 trong `TripCrewServiceImpl.java`:
  ```java
  List<Trip> trips = tripRepository.findByBusCompanyIdWithDetails(busCompanyId);
  return trips.stream()
          .map(trip -> {
              TripCrew crew = tripCrewRepository.findByTripId(trip.getId()).orElse(null); // ❌ 1 + N QUERIES
              return mapToResponse(trip, crew);
          })
          .collect(Collectors.toList());
  ```
- **Hậu quả**: Nếu nhà xe có 100 chuyến xe trong ngày, hệ thống sẽ thực hiện 1 câu query lấy chuyến + 100 câu query riêng lẻ vào bảng `trip_crews`. Điều này đi ngược lại hoàn toàn mục tiêu tối ưu hiệu năng của Sprint 3.
- **Khắc phục**: Dùng query nạp hàng loạt:
  ```java
  List<Long> tripIds = trips.stream().map(Trip::getId).toList();
  Map<Long, TripCrew> crewMap = tripCrewRepository.findByTripIdIn(tripIds).stream()
          .collect(Collectors.toMap(c -> c.getTrip().getId(), c -> c));
  ```

---

#### 3. ⚠️ Bỏ quên tham số `date` gây nạp toàn bộ lịch sử chuyến xe (Nguy cơ OOM)
- **Vị trí**: Phương thức `getCrewAssignments(Long busCompanyId, String date)` nhận tham số `date` từ frontend nhưng **hoàn toàn không dùng trong câu query**.
- **Hậu quả**: Mỗi lần mở trang `/company/crew`, hệ thống nạp toàn bộ hàng chục nghìn chuyến xe từ quá khứ đến tương lai vào RAM để hiển thị. Khi hệ thống chạy thật một vài tháng sẽ dẫn tới tràn bộ nhớ (`OutOfMemoryError`) hoặc treo trình duyệt.
- **Khắc phục**: Thêm điều kiện lọc ngày vào `TripRepository` để chỉ truy vấn các chuyến xe trong ngày được chọn.

---

#### 4. ⚠️ Thiếu kiểm tra tính bất biến (Idempotency) khi Ký lệnh xuất bến
- **Vị trí**: Phương thức `signDispatchPermit`.
- **Vấn đề**: Không kiểm tra xem chuyến xe này đã được ký lệnh trước đó hay chưa (`crew.getStatus().equals("DISPATCH_PERMIT_SIGNED")`).
- **Rủi ro**: Nếu người điều hành ấn ký lệnh nhiều lần, hệ thống sẽ liên tục sinh ra các mã lệnh `permitCode` khác nhau và ghi đè thời gian xuất bến `dispatchedAt`, phá vỡ tính toàn vẹn của biên bản pháp lý khi có thanh tra giao thông.

