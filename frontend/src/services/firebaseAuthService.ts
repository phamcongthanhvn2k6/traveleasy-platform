// ============================================================
// FILE: services/firebaseAuthService.ts
// (Tham khảo firebase-auth-lab - features/auth/AuthProvider.tsx)
//
// NGHIỆP VỤ TỔNG QUAN:
//   Cầu nối giữa Firebase Auth (client) và Backend TravelEasy (JWT flow hiện có):
//   1. Google:  signInWithPopup → lấy Firebase ID Token
//               → POST /auth/firebase/google { idToken }
//               → nhận AuthResponse (JWT nội bộ) → lưu localStorage như login thường.
//   2. Phone:   signInWithPhoneNumber + RecaptchaVerifier → confirm OTP
//               → POST /auth/firebase/phone { idToken } → cùng flow như trên.
//
// LƯU Ý: Frontend KHÔNG tự quyết định "ai là ai" - Firebase chỉ xác minh danh tính,
// Backend mới là nơi lưu hồ sơ nghiệp vụ (User, Role CUSTOMER, status) và cấp JWT.
// ============================================================

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import api from './api';

// Kiểu dữ liệu khớp với AuthResponse của backend
export interface AuthResponseData {
  token: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  busCompanyId: number | null;
}

// ==================== GOOGLE SIGN-IN ====================

/**
 * BƯỚC 1: Mở popup Google OAuth qua Firebase.
 * BƯỚC 2: Lấy ID Token từ kết quả đăng nhập.
 * BƯỚC 3: Gửi ID Token lên backend để verify + cấp JWT nội bộ.
 */
export async function loginWithGoogle(): Promise<AuthResponseData> {
  // B1: Popup Google - Firebase tự xử lý toàn bộ OAuth flow
  const result = await signInWithPopup(auth, googleProvider);

  // B2: ID Token là JWT do Firebase cấp, chứa claims: email, name, picture, user_id...
  const idToken = await result.user.getIdToken();

  // B3: Backend verify token bằng Firebase Admin SDK rồi trả về AuthResponse
  const res = await api.post('/auth/firebase/google', { idToken });

  if (!res.data?.success || !res.data?.data) {
    throw new Error(res.data?.message || 'Đăng nhập Google không thành công');
  }
  return res.data.data as AuthResponseData;
}

// ==================== PHONE OTP ====================

let confirmationResult: ConfirmationResult | null = null;

/**
 * BƯỚC 1 CỦA PHONE AUTH - Gửi OTP qua SMS:
 *   - phoneNumber: dạng E.164 (vd +84912345678).
 *   - containerOrVerifier: element id chứa reCAPTCHA invisible
 *     (Firebase bắt buộc có RecaptchaVerifier để chống bot spam OTP).
 *   - Kết quả (ConfirmationResult - chứa phiên + hàm confirm) được lưu module-level.
 */
export async function sendPhoneOtp(
  phoneNumber: string,
  containerOrVerifier: string | RecaptchaVerifier
): Promise<void> {
  const appVerifier =
    containerOrVerifier instanceof RecaptchaVerifier
      ? containerOrVerifier
      : new RecaptchaVerifier(auth, containerOrVerifier, { size: 'invisible' });

  await appVerifier.render();

  // Firebase kiểm tra reCAPTCHA rồi gửi SMS chứa mã OTP (6 số) tới số điện thoại
  confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
}

/**
 * BƯỚC 2 CỦA PHONE AUTH - Xác minh OTP người dùng nhập:
 *   - Nếu đúng: user được đăng nhập Firebase → lấy ID Token → gọi backend
 *     POST /auth/firebase/phone → nhận AuthResponse JWT nội bộ.
 *   - Nếu sai: throw error (component gọi sẽ hiển thị "OTP không đúng").
 */
export async function verifyPhoneOtp(verificationCode: string): Promise<AuthResponseData> {
  if (!confirmationResult) {
    throw new Error('Chưa gửi mã OTP. Vui lòng yêu cầu mã trước khi xác minh.');
  }

  await confirmationResult.confirm(verificationCode);

  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Không tìm thấy phiên đăng nhập sau khi xác minh OTP');
  }

  const idToken = await currentUser.getIdToken();
  const res = await api.post('/auth/firebase/phone', { idToken });

  if (!res.data?.success || !res.data?.data) {
    throw new Error(res.data?.message || 'Đăng nhập OTP không thành công');
  }
  return res.data.data as AuthResponseData;
}

/**
 * Đăng xuất khỏi Firebase (xóa session client).
 * Gọi khi user logout khỏi TravelEasy để phiên Firebase không bị treo.
 */
export async function signOutFirebase(): Promise<void> {
  try {
    await auth.signOut();
  } catch {
    // Không sao nếu fail (chưa đăng nhập Firebase)
  }
  confirmationResult = null;
}

