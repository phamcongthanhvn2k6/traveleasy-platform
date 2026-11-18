# 📊 Hướng Dẫn Vận Hành & Khởi Chạy Observability Stack — TravelEasy Platform

Hệ thống giám sát toàn diện **3 Trụ Cột Observability (Metrics, Logs, Traces)** chuẩn Enterprise Cloud-Native cho TravelEasy Monolith (Spring Boot 3.3.4 + Java 21).

---

## 1. Danh Mục Thành Phần & Cổng Truy Cập (Port Mapping)

| Thành phần | Cổng Host | Cổng Nội Bộ | Giao thức | Vai trò chính |
|---|:---:|:---:|:---:|---|
| **Grafana** | **`3001`** | `3000` | HTTP | Giao diện hiển thị Dashboard, Log Explore và Trace Waterfall |
| **Prometheus** | **`9090`** | `9090` | HTTP | Thu thập & lưu trữ số liệu (RED Metrics, JVM, HikariCP) |
| **Alertmanager** | **`9093`** | `9093` | HTTP | Điều phối và gửi cảnh báo (Slack / Email / Telegram) |
| **Loki** | **`3100`** | `3100` | HTTP | Lưu trữ log tập trung dung lượng nhẹ với Structured Metadata |
| **Grafana Alloy** | **`12345`** | `12345` | HTTP | Thu thập log container từ Docker Socket và gửi Loki |
| **Tempo** | **`3220`** | `3200` | HTTP | Lưu trữ dấu vết phân tán (Distributed Traces) |
| **OTel Collector** | **`4317 / 4318`** | `4317 / 4318` | gRPC / HTTP | Trạm tiếp nhận OpenTelemetry Traces từ Backend |

> [!NOTE]
> Grafana được cấu hình chạy ở cổng host **`3001`** (thay vì 3000) để không xung đột với cổng `3000` của `traveleasy-frontend`.

---

## 2. Kiến Trúc 3 Trụ Cột Cho Modular Monolith

```text
                           +---------------------------+
                           |  React Frontend (Nginx)   |
                           +-------------+-------------+
                                         |
                                         v
   +--------------------+       +--------+------------------+
   |   MySQL 8.0 DB     |<----->|    TravelEasy Backend     |
   | (HikariCP Pool:12) |       |  Spring Boot 3.3.4 :8080 |
   +--------------------+       +---+----------+--------+---+
                                    |          |        |
                         Actuator   |          | JSON   | OTLP
                          Metrics   |          | Logs   | Traces
                                    v          v        v
                             +----------+  +-------+  +---------------+
                             |Prometheus|  | Alloy |  |OTel Collector |
                             +----+-----+  +---+---+  +-------+-------+
                                  |            |              |
                                  |            v              v
                                  |        +-------+      +-------+
                                  |        | Loki  |      | Tempo |
                                  |        +---+---+      +---+---+
                                  v            v              v
                            +------------------------------------+
                            |         Grafana (Port 3001)        |
                            +------------------------------------+
                                             ^
                                             |
                            +----------------+-------------------+
                            |      Alertmanager (Port 9093)      |
                            +------------------------------------+
```

1. **Metrics**: Backend xuất endpoint `/actuator/prometheus` -> Prometheus tự động scrape mỗi 15s -> Hiển thị trên Grafana Dashboard `TravelEasy Monolith Overview`.
2. **Logs**: Backend ghi log JSON chuẩn Logstash -> Grafana Alloy đọc từ Docker Socket (`/var/run/docker.sock`), trích xuất nhãn low-cardinality (`service_name`, `level`) và đưa `traceId`, `spanId`, `correlationId` vào Loki Structured Metadata.
3. **Traces**: Micrometer Tracing Bridge OTel xuất span qua OTLP HTTP (`:4318/v1/traces`) -> OTel Collector tiếp nhận xuất sang Tempo -> Trực quan hóa Waterfall Call Tree (Controller -> Service -> Repository/DB -> External APIs).

---

## 3. Hướng Dẫn Khởi Chạy

### Cách 1: Khởi Chạy Toàn Bộ Ứng Dụng + Hạ Tầng Giám Sát (Docker Compose)

Khởi động cùng lúc cả MySQL, Backend, Frontend và toàn bộ 7 dịch vụ Observability trên cùng mạng `traveleasy-network`:

```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml up -d
```

Kiểm tra trạng thái các container:
```bash
docker compose -f docker-compose.yml -f docker-compose.observability.yml ps
```

### Cách 2: Khởi Chạy Riêng Hạ Tầng Observability (Khi Chạy Backend Tại Host/IDE)

Dành cho nhà phát triển chạy Spring Boot Backend trực tiếp trong IntelliJ IDEA, VS Code hoặc qua lệnh `./gradlew bootRun`:

1. Khởi động MySQL và cụm Observability:
```bash
# Khởi động cụm giám sát
docker compose -f docker-compose.observability.yml up -d
```

2. Mở file [observability/prometheus/prometheus.yml](file:///c:/Users/LENOVO/Desktop/Rikkei/ojt_ki4/traveleasy-platform/observability/prometheus/prometheus.yml), đổi target scrape thành:
```yaml
    static_configs:
      - targets: ["host.docker.internal:8080"]
```
Khởi động lại Prometheus:
```bash
docker restart traveleasy-prometheus
```

---

## 4. Kiểm Tra & Khai Thác Trên Giao Diện

### 4.1. Truy Cập Grafana
- **Đường dẫn**: [http://localhost:3001](http://localhost:3001)
- **Tài khoản**: `admin` / `admin123@` (hoặc cấu hình qua `.env`)

### 4.2. Xem Dashboard Tổng Quan Hệ Thống
1. Vào **Dashboards** -> chọn thư mục **TravelEasy** -> **TravelEasy Monolith Overview**.
2. Quan sát:
   - **Backend Availability**: Trạng thái sống/chết (UP / DOWN).
   - **RED Metrics**: Request Rate (req/s), HTTP 5xx Error Rate (%), Latency p50 / p95 / p99.
   - **JVM & Runtime**: Heap Memory Used vs Max, Live & Daemon Threads, GC Pause Time, CPU Usage.
   - **HikariCP Pool**: Số lượng kết nối Active, Idle, Pending và Connection Timeouts.

### 4.3. Truy Vết Logs Trên Loki
1. Vào **Explore** -> Chọn Data Source **Loki**.
2. Lọc log backend TravelEasy:
   ```logql
   {service_name="traveleasy-backend"}
   ```
3. Lọc riêng log có mã lỗi:
   ```logql
   {service_name="traveleasy-backend", level="ERROR"}
   ```

### 4.4. Xem Distributed Trace Trên Tempo
1. Vào **Explore** -> Chọn Data Source **Tempo**.
2. Nhập `TraceID` từ Log hoặc tìm các Trace gần nhất trong mục **Search**.
3. Xem chi tiết waterfall biểu diễn thời gian thực thi từng tầng HTTP Request -> Service -> JPA/SQL query -> External HTTP (PayOS, Firebase, Cloudinary).
4. Nhấn trực tiếp nút **"View trace in Tempo"** từ log hiển thị trong Loki để liên kết log sang trace tương ứng.

---

## 5. Dừng Hệ Thống (Không Mất Dữ Liệu)

Dừng toàn bộ container giám sát mà không làm mất dữ liệu Prometheus TSDB, Loki logs và Tempo traces:

```bash
docker compose -f docker-compose.observability.yml down
```

Nếu muốn xóa toàn bộ volumes dữ liệu giám sát:
```bash
docker compose -f docker-compose.observability.yml down -v
```
