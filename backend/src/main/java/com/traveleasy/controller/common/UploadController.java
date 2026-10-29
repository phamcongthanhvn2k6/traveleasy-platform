package com.traveleasy.controller.common;

import com.traveleasy.common.dto.ApiResponse;
import com.traveleasy.service.common.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Cloudinary Image Upload API", description = "Tải ảnh trực tiếp lên Cloudinary cho Đánh giá khách hàng & Khuyến mại/Banner Admin")
public class UploadController {

    private final CloudinaryService cloudinaryService;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/bmp"
    );

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải một ảnh lên Cloudinary (hỗ trợ phân loại thư mục reviews, banners, promotions)")
    public ApiResponse<Map<String, Object>> uploadSingleImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder) {

        if (file == null || file.isEmpty()) {
            return ApiResponse.error("Vui lòng chọn tập tin ảnh hợp lệ!");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ApiResponse.error("Dung lượng ảnh vượt quá giới hạn cho phép (Tối đa 10MB)!");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            return ApiResponse.error("Định dạng tập tin không được hỗ trợ! Vui lòng chọn ảnh JPG, PNG, WEBP, GIF.");
        }

        try {
            Map<String, Object> uploadResult = cloudinaryService.uploadImage(file, folder);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("url", uploadResult.get("secure_url"));
            responseData.put("publicId", uploadResult.get("public_id"));
            responseData.put("format", uploadResult.get("format"));
            responseData.put("width", uploadResult.get("width"));
            responseData.put("height", uploadResult.get("height"));
            responseData.put("bytes", uploadResult.get("bytes"));
            responseData.put("folder", folder);

            return ApiResponse.success("Tải ảnh lên Cloudinary thành công", responseData);
        } catch (Exception e) {
            log.error("Lỗi khi tải ảnh lên Cloudinary: ", e);
            return ApiResponse.error("Không thể tải ảnh lên dịch vụ Cloudinary: " + e.getMessage());
        }
    }

    @PostMapping(value = "/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải nhiều ảnh cùng lúc lên Cloudinary (dành cho bộ sưu tập đánh giá thực tế)")
    public ApiResponse<List<Map<String, Object>>> uploadMultipleImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "folder", defaultValue = "reviews") String folder) {

        if (files == null || files.length == 0) {
            return ApiResponse.error("Vui lòng chọn ít nhất một tập tin ảnh!");
        }

        if (files.length > 10) {
            return ApiResponse.error("Chỉ được tải lên tối đa 10 ảnh trong một lần!");
        }

        List<Map<String, Object>> results = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (int i = 0; i < files.length; i++) {
            MultipartFile file = files[i];
            if (file == null || file.isEmpty()) continue;

            if (file.getSize() > MAX_FILE_SIZE) {
                errors.add("Ảnh " + file.getOriginalFilename() + " vượt quá dung lượng 10MB");
                continue;
            }

            try {
                Map<String, Object> uploadResult = cloudinaryService.uploadImage(file, folder);
                Map<String, Object> item = new HashMap<>();
                item.put("url", uploadResult.get("secure_url"));
                item.put("publicId", uploadResult.get("public_id"));
                item.put("fileName", file.getOriginalFilename());
                results.add(item);
            } catch (Exception e) {
                errors.add("Lỗi tải ảnh " + file.getOriginalFilename() + ": " + e.getMessage());
            }
        }

        if (results.isEmpty() && !errors.isEmpty()) {
            return ApiResponse.error("Tất cả ảnh tải lên đều thất bại: " + String.join(", ", errors));
        }

        return ApiResponse.success("Đã tải lên thành công " + results.size() + " ảnh lên Cloudinary", results);
    }
}
