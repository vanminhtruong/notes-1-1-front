# Hướng dẫn cấu hình Google OAuth

## Lỗi "unknown_reason" đã được khắc phục

Hệ thống đã được cập nhật để tự động chuyển sang **OAuth popup flow** khi Google One Tap gặp lỗi `unknown_reason` hoặc các lỗi khác liên quan đến FedCM.

## Cấu hình Google Cloud Console

Để đăng nhập Google hoạt động đúng, bạn cần cấu hình trong Google Cloud Console:

### 1. Truy cập Google Cloud Console
- Đi đến: https://console.cloud.google.com/
- Chọn project của bạn (hoặc tạo project mới)

### 2. Bật Google+ API
- Vào **APIs & Services** > **Library**
- Tìm "Google+ API" và bật nó
- Hoặc tìm "Google Identity Toolkit API" và bật

### 3. Tạo OAuth 2.0 Client ID
- Vào **APIs & Services** > **Credentials**
- Click **Create Credentials** > **OAuth client ID**
- Chọn **Web application**

### 4. Cấu hình Authorized JavaScript origins
Thêm các origin sau:
```
http://localhost:5173
http://localhost:3000
https://yourdomain.com (nếu đã deploy)
```

### 5. Cấu hình Authorized redirect URIs
Thêm các URI sau:
```
http://localhost:5173/auth/google/callback
http://localhost:3000/auth/google/callback
https://yourdomain.com/auth/google/callback (nếu đã deploy)
```

### 6. Lấy Client ID
- Sau khi tạo xong, copy **Client ID**
- Paste vào file `.env`:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

## Cách hoạt động của hệ thống mới

### Phương thức 1: Google One Tap (Ưu tiên)
- Hệ thống sẽ thử sử dụng Google One Tap trước
- Đây là phương thức hiện đại, dùng FedCM API

### Phương thức 2: OAuth Popup (Fallback)
- Nếu One Tap thất bại với các lỗi sau, tự động chuyển sang popup:
  - `unknown_reason`
  - `suppressed_by_user`
  - `blocked_by_settings`
- Popup sẽ mở window Google login
- Sau khi đăng nhập, token sẽ được gửi về page chính

## Các trường hợp lỗi thường gặp

### Lỗi: "Origin không khớp"
**Giải pháp:** Thêm `http://localhost:5173` vào **Authorized JavaScript origins**

### Lỗi: "Redirect URI không hợp lệ"
**Giải pháp:** Thêm `http://localhost:5173/auth/google/callback` vào **Authorized redirect URIs**

### Lỗi: "Popup bị chặn"
**Giải pháp:** 
- Cho phép popup trong trình duyệt
- Chrome: Click icon popup bên phải address bar
- Chọn "Always allow popups from localhost:5173"

### Lỗi: "FedCM bị chặn"
**Giải pháp:** Hệ thống sẽ tự động chuyển sang popup, không cần xử lý

## Testing

1. Khởi động dev server:
```bash
npm run dev
```

2. Truy cập: http://localhost:5173/login

3. Click nút "Google" để test đăng nhập

4. Nếu One Tap không hoạt động, hệ thống tự động mở popup

## Lưu ý quan trọng

- ⚠️ **Không commit file .env** lên Git (đã có trong .gitignore)
- ✅ Client ID có thể public (không phải secret)
- ✅ Popup fallback hoạt động với tất cả trình duyệt
- ✅ FedCM chỉ hoạt động trên Chrome/Edge 108+

## Flow xử lý

```
User click "Google Login"
    ↓
Try Google One Tap (FedCM)
    ↓
Success? → Login
    ↓
Failed? → Check reason
    ↓
unknown_reason/blocked? → Open OAuth Popup
    ↓
User login in popup
    ↓
Redirect to /auth/google/callback
    ↓
Parse id_token from URL hash
    ↓
Send token to opener window
    ↓
Login success → Navigate to /dashboard
```

## Backend API

Đảm bảo backend có endpoint:
```
POST /auth/google
Body: { idToken: "..." }
Response: { token: "...", user: {...} }
```

Backend phải verify id_token với Google để đảm bảo tính bảo mật.
