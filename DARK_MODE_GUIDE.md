# Dark Mode Feature - Hướng Dẫn

## Tổng Quan

Dự án hiện hỗ trợ 3 chế độ theme:
- **Light (Sáng)**: Theme sáng mặc định
- **Dark (Tối)**: Theme tối với màu xám đậm (#0a0a0a, #374151, etc.)
- **Dark Black (Tối Đen)**: Theme tối với màu đen thuần (#000000, #0a0a0a, #1a1a1a)

## Cách Sử Dụng

### Cho Users

1. Click vào biểu tượng theme ở header
2. Chọn một trong 3 options:
   - **Sáng** (Light) - icon Sun
   - **Tối** (Dark) - icon Moon  
   - **Tối Đen** (Dark Black) - icon Palette

Theme được lưu tự động vào localStorage, cookies và database (nếu đã đăng nhập).

## Cấu Trúc Kỹ Thuật

### Backend

**Files đã cập nhật:**
- `Back/src/models/user.model.js`: Thêm `dark-black` vào enum validation
- `Back/src/service/settings-service/settings.appearance.service.js`: Hỗ trợ 3 theme modes
- `Back/src/migrations/update-theme-add-dark-black.js`: Migration để cập nhật DB schema

### Frontend

**Files đã cập nhật:**

1. **Theme Management:**
   - `src/contexts/ThemeContext.tsx`: Quản lý 3 theme modes
   - `src/store/slices/themeSlice.ts`: Redux slice cho theme
   - `src/services/settingsService.ts`: API service types

2. **UI Components:**
   - `src/components/ThemeToggle.tsx`: Dropdown selector thay vì toggle button
   
3. **Styling:**
   - `src/styles/global.scss`: CSS overrides cho dark-black theme
   - `src/components/RichTextEditor/editor.css`: Dark-black styles cho editor
   - `index.html`: Boot script hỗ trợ dark-black initialization

## Implementation Details

### Class Strategy

Khi theme là `dark-black`, HTML element sẽ có **CẢ HAI** classes:
```html
<html class="dark dark-black">
```

**Lý do:**
- Class `dark` → Kích hoạt tất cả Tailwind `dark:*` utilities
- Class `dark-black` → CSS overrides để thay đổi màu từ gray thành black

### CSS Override Approach

File `global.scss` sử dụng selectors như:
```css
.dark-black .dark\:bg-gray-900 {
  background-color: #000000 !important;
}

.dark-black .dark\:bg-gray-800 {
  background-color: #0a0a0a !important;
}
```

Điều này đảm bảo **TẤT CẢ** components hiện tại tự động hoạt động với dark-black mà không cần sửa code.

### Persistence

Theme được lưu ở 3 nơi:
1. **localStorage**: `theme` key
2. **Cookie**: `theme` cookie (1 năm expiry)
3. **Database**: `User.theme` field (nếu authenticated)

### Boot Script

File `index.html` chứa inline script để áp dụng theme TRƯỚC KHI React mount, tránh flash of wrong theme:

```javascript
if (saved === 'dark-black') {
  d.classList.add('dark', 'dark-black');
  document.body.style.backgroundColor = '#000000';
}
```

## Color Palette

### Light Mode
- Background: `#ffffff`
- Text: `#1f2937`

### Dark Mode  
- Background: `#0a0a0a`, `#374151`, `#4b5563`
- Text: `#e5e7eb`, `#f3f4f6`

### Dark Black Mode
- Background: `#000000`, `#0a0a0a`, `#1a1a1a`, `#2a2a2a`
- Text: `#e5e7eb` (giống Dark mode cho readability)
- Borders: `#1a1a1a`

## Testing

### Manual Test
1. Chạy backend: `cd Back && npm run dev`
2. Chạy frontend: `cd Front && npm run dev`
3. Đăng nhập vào app
4. Click theme toggle và chọn từng mode
5. Refresh page để kiểm tra persistence
6. Kiểm tra tất cả pages: Dashboard, Categories, Account, Chat, etc.

### Migration
Chạy migration để cập nhật DB:
```bash
cd Back
# Chạy migration script của bạn
```

## Notes

- **Không cập nhật Admin panel** - Chỉ áp dụng cho Front users app
- Tất cả pages tự động hỗ trợ dark-black do CSS override approach
- RichTextEditor có custom styles cho dark-black mode
- Theme sync realtime qua Socket.IO khi cập nhật
