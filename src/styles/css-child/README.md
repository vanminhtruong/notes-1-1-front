# CSS Module Scoping Strategy

## 📖 Tổng quan

Folder này chứa các SCSS modules cho dark theme system. Mỗi module được tổ chức theo chức năng và có scoping strategy riêng để tránh CSS conflicts.

## 📁 Cấu trúc Module

### 🔵 Base Modules (Global - Không cần scope)
Các module này áp dụng cho toàn bộ app:

- **`_base-backgrounds.module.scss`** - Base backgrounds, gray families
- **`_borders.module.scss`** - Border colors
- **`_gradients.module.scss`** - Gradient styles
- **`_buttons.module.scss`** - Button styles
- **`_inputs.module.scss`** - Input/textarea styles
- **`_colors.module.scss`** - Text colors, accent colors

### 🔴 Component Modules (Scoped - CẦN scope riêng)
Các module này dành cho component cụ thể và **BẮT BUỘC** phải có scope:

| Module | Scope Class | Component |
|--------|-------------|-----------|
| `_pinned-banner.module.scss` | `.pinner` | `PinnedMessageBanner.tsx` |
| `_chat-messages.module.scss` | `.message-bubble` | `MessageBubble.tsx` |

## 🎯 Scoping Strategy

### ✅ Khi nào CẦN scope?

Thêm scope class khi module chứa styles cho:
- Component cụ thể (không phải base styles)
- Có selector có thể conflict với component khác
- Ví dụ: `.rounded-xl`, `.text-gray-900`, `.bg-blue-500`

### ❌ Khi nào KHÔNG cần scope?

Không cần scope khi:
- Base styles áp dụng toàn app
- Generic utility overrides
- Ví dụ: `.dark:bg-gray-900`, `input:focus`, `button:hover`

## 📝 Cách thêm Component Module mới

### Bước 1: Thêm scope class vào Component

```tsx
// ❌ TRƯỚC - Không có scope
<div className="my-component ...">

// ✅ SAU - Có scope
<div className="my-comp my-component ...">
```

### Bước 2: Tạo Module file

```scss
/**
 * My Component Module
 * SCOPED with .my-comp class to avoid conflicts
 */

@mixin apply-my-component($theme-class, $bg-card, ...) {
  // Tất cả selector phải bắt đầu với scope class
  .#{$theme-class} .my-comp .some-class {
    // styles
  }
  
  .#{$theme-class} .my-comp .another-class {
    // styles
  }
}
```

### Bước 3: Import vào `_theme-variants.scss`

```scss
// 1. Import module
@import './css-child/my-component.module';

// 2. Gọi mixin trong generate-dark-theme
@mixin generate-dark-theme(...) {
  @include apply-my-component($theme-class, $bg-card, ...);
}
```

## ⚠️ Lưu ý quan trọng

### 1. **Tất cả selector PHẢI có scope**
```scss
// ❌ SAU - Có thể conflict
.#{$theme-class} .text-blue-900 { ... }

// ✅ ĐÚNG - An toàn
.#{$theme-class} .my-comp .text-blue-900 { ... }
```

### 2. **Scope class phải ngắn gọn**
- ✅ `.pinner`, `.message-bubble`, `.chat-header`
- ❌ `.pinned-message-banner-component`

### 3. **Đặt tên scope class rõ ràng**
- Phải thể hiện được component nào
- Không trùng với Tailwind classes
- Dùng kebab-case

### 4. **Document scope trong comment**
```scss
/**
 * Component Module
 * SCOPED with .scope-name class to avoid conflicts
 */
```

## 🔍 Kiểm tra Conflicts

Để kiểm tra xem có conflict không:

```bash
# Tìm selector không có scope trong component modules
grep -E "^\s*\.#{.*} \.[^p|^m]" _pinned-banner.module.scss
grep -E "^\s*\.#{.*} \.[^p|^m]" _chat-messages.module.scss
```

## 📊 Ví dụ Hoàn chỉnh

### Component: NotificationBell.tsx
```tsx
export const NotificationBell = () => {
  return (
    <div className="notif-bell ...">
      <button className="...">
        <Bell />
      </button>
    </div>
  );
};
```

### Module: _notification.module.scss
```scss
/**
 * Notification Bell Module  
 * SCOPED with .notif-bell class
 */

@mixin apply-notification($theme-class, $bg-card, $text-muted) {
  // Bell icon color
  .#{$theme-class} .notif-bell .bell-icon {
    color: $text-muted !important;
  }
  
  // Badge background
  .#{$theme-class} .notif-bell .badge {
    background-color: #ef4444 !important;
  }
  
  // Dropdown menu
  .#{$theme-class} .notif-bell .dropdown {
    background-color: $bg-card !important;
  }
}
```

## 🎨 Best Practices

1. ✅ **Một component = Một scope class**
2. ✅ **Scope class ở root element của component**
3. ✅ **Tất cả styles trong module phải dưới scope**
4. ✅ **Document rõ ràng trong comments**
5. ✅ **Test kỹ không conflict với component khác**

## 📚 Tài liệu tham khảo

- [BEM Methodology](http://getbem.com/)
- [CSS Scoping](https://developer.mozilla.org/en-US/docs/Web/CSS/:scope)
- [SCSS Mixins](https://sass-lang.com/documentation/at-rules/mixin)
