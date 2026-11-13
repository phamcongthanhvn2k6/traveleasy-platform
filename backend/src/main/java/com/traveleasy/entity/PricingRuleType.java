package com.traveleasy.entity;

/**
 * Phân loại quy tắc định giá vé xe.
 */
public enum PricingRuleType {
    HOLIDAY_SURCHARGE,    // Phụ thu dịp Lễ Tết (+20%)
    WEEKEND_SURCHARGE,    // Phụ thu các ngày cuối tuần (+10%)
    FLASH_SALE,           // Giảm giá kích cầu giờ chót (-15%)
    CUSTOM                // Quy tắc tùy chỉnh khác
}
