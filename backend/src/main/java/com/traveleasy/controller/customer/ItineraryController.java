package com.traveleasy.controller.customer;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.entity.ItineraryEntity;
import com.traveleasy.repository.ItineraryRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/itineraries")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Itinerary Controller", description = "Quản lý Cẩm nang & Lịch trình du lịch toàn sàn")
public class ItineraryController {

    private final ItineraryRepository itineraryRepository;

    @GetMapping
    @Operation(summary = "Lấy toàn bộ danh sách kịch bản lịch trình du lịch")
    public ApiResponse<List<ItineraryEntity>> getAllItineraries() {
        return ApiResponse.success(itineraryRepository.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết kịch bản theo ID")
    public ApiResponse<ItineraryEntity> getItineraryById(@PathVariable String id) {
        return itineraryRepository.findById(id)
                .map(ApiResponse::success)
                .orElseGet(() -> ApiResponse.error(404, "Không tìm thấy lịch trình"));
    }

    @PostMapping
    @Operation(summary = "Thêm mới hoặc cập nhật một kịch bản lịch trình du lịch")
    public ApiResponse<ItineraryEntity> saveItinerary(@RequestBody ItineraryEntity entity) {
        if (entity.getUpdatedAt() == null) {
            entity.setUpdatedAt(OffsetDateTime.now());
        }
        ItineraryEntity saved = itineraryRepository.save(entity);
        return ApiResponse.success("Lưu kịch bản lịch trình thành công", saved);
    }

    @PostMapping("/bulk-sync")
    @Operation(summary = "Đồng bộ hàng loạt kịch bản lịch trình từ hệ thống")
    public ApiResponse<List<ItineraryEntity>> bulkSync(@RequestBody List<ItineraryEntity> list) {
        if (list != null && !list.isEmpty()) {
            for (ItineraryEntity item : list) {
                if (item.getUpdatedAt() == null) {
                    item.setUpdatedAt(OffsetDateTime.now());
                }
            }
            List<ItineraryEntity> saved = itineraryRepository.saveAll(list);
            return ApiResponse.success("Đồng bộ danh sách kịch bản lịch trình thành công", saved);
        }
        return ApiResponse.success("Danh sách rỗng", List.of());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa một kịch bản lịch trình")
    public ApiResponse<Void> deleteItinerary(@PathVariable String id) {
        if (itineraryRepository.existsById(id)) {
            itineraryRepository.deleteById(id);
            return ApiResponse.success("Đã xóa kịch bản lịch trình", null);
        }
        return ApiResponse.error(404, "Không tìm thấy kịch bản lịch trình");
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Bật / Tắt trạng thái kích hoạt của kịch bản")
    public ApiResponse<ItineraryEntity> toggleStatus(@PathVariable String id) {
        return itineraryRepository.findById(id)
                .map(entity -> {
                    entity.setIsActive(!Boolean.TRUE.equals(entity.getIsActive()));
                    entity.setUpdatedAt(OffsetDateTime.now());
                    return ApiResponse.success("Đã cập nhật trạng thái", itineraryRepository.save(entity));
                })
                .orElseGet(() -> ApiResponse.error(404, "Không tìm thấy kịch bản"));
    }
}
