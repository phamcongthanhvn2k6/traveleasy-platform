import axios, { AxiosResponse } from 'axios';
import { toast } from '../context/ToastContext';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('traveleasy_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      toast.error('Không thể kết nối đến máy chủ Backend (Port 8080). Vui lòng kiểm tra kết nối mạng!', 'Lỗi Kết Nối');
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// CLIENT-SIDE SWR (STALE-WHILE-REVALIDATE) HTTP CACHING LAYER
// Tăng tốc chuyển trang mượt mà tức thì (0ms) khi quay lại trang cũ
// ============================================================================

interface CacheItem {
  response: AxiosResponse<any>;
  timestamp: number;
}

const memoryCache = new Map<string, CacheItem>();
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 phút TTL

export const clearApiCache = (keyword?: string) => {
  if (!keyword) {
    memoryCache.clear();
  } else {
    for (const key of memoryCache.keys()) {
      if (key.includes(keyword)) {
        memoryCache.delete(key);
      }
    }
  }
};

// Lưu hàm gốc của Axios
const originalGet = api.get.bind(api);
const originalPost = api.post.bind(api);
const originalPut = api.put.bind(api);
const originalPatch = api.patch.bind(api);
const originalDelete = api.delete.bind(api);

// Mở rộng api.get với cơ chế Cache-First SWR
api.get = (async (url: string, config?: any): Promise<any> => {
  if (config?.skipCache) {
    return originalGet(url, config);
  }

  const queryParams = config?.params ? JSON.stringify(config.params) : '';
  const cacheKey = `GET:${url}:${queryParams}`;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);
  const ttl = config?.ttl || DEFAULT_TTL_MS;

  // 1. Instant Cache Hit: Trả về kết quả ngay lập tức (0ms) nếu còn trong TTL
  if (cached && (now - cached.timestamp < ttl)) {
    // 2. Chạy ngầm cập nhật dữ liệu mới nếu cache đã cũ hơn 30 giây (Stale-While-Revalidate)
    if (now - cached.timestamp > 30_000) {
      originalGet(url, config)
        .then((fresh: any) => {
          memoryCache.set(cacheKey, { response: fresh, timestamp: Date.now() });
        })
        .catch(() => {});
    }
    return Promise.resolve(cached.response);
  }

  // 3. Nếu chưa có cache -> Gọi Backend thực tế và lưu vào RAM
  const response = await originalGet(url, config);
  memoryCache.set(cacheKey, { response, timestamp: Date.now() });
  return response;
}) as any;

// Tự động xóa cache tương ứng khi người dùng thực hiện tạo mới / sửa / xóa dữ liệu
api.post = (async (url: string, data?: any, config?: any): Promise<any> => {
  const res = await originalPost(url, data, config);
  clearApiCache();
  return res;
}) as any;

api.put = (async (url: string, data?: any, config?: any): Promise<any> => {
  const res = await originalPut(url, data, config);
  clearApiCache();
  return res;
}) as any;

api.patch = (async (url: string, data?: any, config?: any): Promise<any> => {
  const res = await originalPatch(url, data, config);
  clearApiCache();
  return res;
}) as any;

api.delete = (async (url: string, config?: any): Promise<any> => {
  const res = await originalDelete(url, config);
  clearApiCache();
  return res;
}) as any;

export default api;
