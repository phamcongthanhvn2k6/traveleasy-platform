import api from './api';

export interface UploadResult {
  url: string;
  publicId?: string;
  format?: string;
  width?: number;
  height?: number;
  fileName?: string;
}

export const uploadService = {
  /**
   * Tải 1 ảnh lên Cloudinary qua Backend endpoint POST /api/v1/upload/image
   * @param file File ảnh được chọn từ máy khách
   * @param folder Thư mục trên Cloudinary: 'reviews' | 'banners' | 'promotions' | 'avatars'
   * @returns URL an toàn (https://res.cloudinary.com/...)
   */
  async uploadImage(file: File, folder: string = 'general'): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.success && response.data.data) {
      return {
        url: response.data.data.url,
        publicId: response.data.data.publicId,
        format: response.data.data.format,
        width: response.data.data.width,
        height: response.data.data.height,
      };
    }

    throw new Error(response.data?.message || 'Tải ảnh lên Cloudinary thất bại');
  },

  /**
   * Tải nhiều ảnh cùng lúc lên Cloudinary
   */
  async uploadMultipleImages(files: File[], folder: string = 'reviews'): Promise<UploadResult[]> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('folder', folder);

    const response = await api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data.map((item: any) => ({
        url: item.url,
        publicId: item.publicId,
        fileName: item.fileName,
      }));
    }

    throw new Error(response.data?.message || 'Tải nhiều ảnh lên Cloudinary thất bại');
  },
};

export default uploadService;

