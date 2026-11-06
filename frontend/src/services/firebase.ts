// ============================================================
// FILE: services/firebase.ts
// (Tham khảo firebase-auth-lab - src/config/firebase.ts)
//
// NGHIỆP VỤ TỔNG QUAN:
//   Đây là file CẤU HÌNH TRUNG TÂM - cầu nối duy nhất giữa
//   Frontend React và Firebase project trên cloud.
//   Mọi tính năng auth (Google, Phone OTP) đều phải đi qua
//   object `auth` được khởi tạo từ đây.
//
// Cấu hình đọc từ biến môi trường Vite (VITE_FIREBASE_*) -
// xem .env.example để biết danh sách biến cần đặt.
// ============================================================

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Object chứa "địa chỉ" của Firebase project trên cloud.
// apiKey ở đây KHÔNG phải secret key bảo mật, nó chỉ là identifier public;
// bảo mật thực sự nằm ở Firebase Security Rules & Backend verify ID Token.
// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
// };

const firebaseConfig = {
  apiKey: "AIzaSyBPPQ-ytlbrGLgmzmmCagg7XdevNywWmk0",
  authDomain: "fir-traveleasy-platform.firebaseapp.com",
  projectId: "fir-traveleasy-platform",
  storageBucket: "fir-traveleasy-platform.firebasestorage.app",
  messagingSenderId: "872963478542",
  appId: "1:872963478542:web:2c51cf9055470f1b0f185f"
};

// Kiểm tra cấu hình: nếu thiếu biến env thì cảnh báo thay vì crash app
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

// Khởi tạo Firebase App instance - chỉ được gọi DUY NHẤT 1 lần trong toàn bộ app
const app = initializeApp(firebaseConfig);

// Export `auth`: Object Auth chính - trái tim của hệ thống đăng nhập.
// Mọi component dùng Firebase để:
//   + signInWithPopup (Google), signInWithPhoneNumber (OTP), signOut
//   + Lấy ID Token để gọi backend verify
export const auth = getAuth(app);

// Export `googleProvider`: cấu hình đăng nhập Google đã khởi tạo sẵn.
export const googleProvider = new GoogleAuthProvider();

// NGHIỆP VỤ TESTING / DEV MODE:
//   - Tắt reCAPTCHA khi chạy localhost để test Phone OTP nhanh với số test
//     (+16505553434, mã cố định) mà không cần tick captcha, không tốn quota SMS.
//   - CỰC KỲ QUAN TRỌNG: KHÔNG BAO GIỜ bật ở production (import.meta.env.PROD là false ở đây).
if (import.meta.env.DEV) {
  (auth.settings as any).appVerificationDisabledForTesting = true;
}

