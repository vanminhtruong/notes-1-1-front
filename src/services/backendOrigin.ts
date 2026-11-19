import { Capacitor } from '@capacitor/core';

/** The packaged Android app cannot use the phone's localhost as the PC backend. */
export const ANDROID_BACKEND_STORAGE_KEY = 'planthub.android.backendOrigin';
export const isNativeApp = Capacitor.isNativePlatform();

export function getAndroidBackendOrigin(): string {
  if (!isNativeApp || typeof window === 'undefined') return '';
  // An APK built with an explicit production backend must not inherit a stale
  // address saved by an older installation on the same device.
  const bundledOrigin = String(import.meta.env.VITE_ANDROID_BACKEND_HTTP_URL || '').trim();
  if (bundledOrigin) return bundledOrigin;
  try {
    return localStorage.getItem(ANDROID_BACKEND_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function getBackendOrigin(): string {
  if (isNativeApp) return getAndroidBackendOrigin();
  const envBase = import.meta.env.VITE_BACKEND_HTTP_URL as string | undefined;
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return envBase || `http://${hostname}:3000`;
}

export function validateAndroidBackendOrigin(input: string): string {
  const raw = input.trim();
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('Vui lòng nhập URL đầy đủ, ví dụ https://server.example.com');
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('Máy chủ Android phải sử dụng HTTPS để bảo vệ tài khoản và tin nhắn.');
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') {
    throw new Error('Chỉ nhập địa chỉ gốc HTTPS của backend, không thêm đường dẫn hay tham số.');
  }
  return parsed.origin;
}

export function saveAndroidBackendOrigin(origin: string): void {
  localStorage.setItem(ANDROID_BACKEND_STORAGE_KEY, validateAndroidBackendOrigin(origin));
}
