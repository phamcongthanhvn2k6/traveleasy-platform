package com.traveleasy.service.common;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name:dkzrqnahy}") String cloudName,
            @Value("${cloudinary.api-key:366548239469314}") String apiKey,
            @Value("${cloudinary.api-secret:uyF3hFZGDfoRx_X2ps10rXNpADg}") String apiSecret) {
        log.info("Khởi tạo CloudinaryService với Cloud Name: {}", cloudName);
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }

    /**
     * Tải ảnh lên Cloudinary theo thư mục phân loại (reviews, banners, promotions, avatars)
     */
    public Map<String, Object> uploadImage(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Tập tin tải lên không được rỗng");
        }

        String targetFolder = "traveleasy";
        if (folder != null && !folder.trim().isEmpty()) {
            targetFolder = "traveleasy/" + folder.trim().toLowerCase();
        }

        Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", targetFolder,
                "resource_type", "image",
                "use_filename", true,
                "unique_filename", true,
                "overwrite", false
        );

        log.info("Đang tải ảnh '{}' ({} bytes) lên Cloudinary thư mục '{}'...",
                file.getOriginalFilename(), file.getSize(), targetFolder);

        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);

        log.info("Tải ảnh lên Cloudinary thành công! URL: {}", uploadResult.get("secure_url"));
        return uploadResult;
    }

    /**
     * Tải ảnh từ URL từ xa lên Cloudinary và lưu vĩnh viễn
     */
    public Map<String, Object> uploadFromUrl(String remoteUrl, String folder, String publicId) throws IOException {
        String targetFolder = (folder != null && !folder.trim().isEmpty()) ? "traveleasy/" + folder.trim().toLowerCase() : "traveleasy/general";
        Map<String, Object> uploadParams = ObjectUtils.asMap(
                "folder", targetFolder,
                "resource_type", "image",
                "overwrite", true
        );
        if (publicId != null && !publicId.isBlank()) {
            uploadParams.put("public_id", publicId);
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(remoteUrl, uploadParams);
        log.info("Đã đồng bộ ảnh từ URL '{}' lên Cloudinary: {}", remoteUrl, uploadResult.get("secure_url"));
        return uploadResult;
    }
}

