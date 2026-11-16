/**
 * Convert backend auth errors to stable i18n keys. Backend responses may be in Vietnamese;
 * never surface them verbatim on translated login/register pages.
 */
type AuthAction = 'login' | 'google' | 'register';

interface AuthHttpError {
  code?: string;
  message?: string;
  response?: {
    status?: number;
    data?: {
      message?: string;
      code?: string;
      errors?: unknown[];
    };
  };
}

export function getAuthErrorKey(error: unknown, action: AuthAction): string {
  const err = error as AuthHttpError | null;
  const status = err?.response?.status;
  const data = err?.response?.data;
  const details = Array.isArray(data?.errors)
    ? data.errors.map((item) => typeof item === 'string' ? item : '').join(' ')
    : '';
  const message = [data?.code, data?.message, details]
    .filter((part) => typeof part === 'string')
    .join(' ').toLowerCase();

  if (/vô hiệu hóa|deactivated|account disabled|bị khóa/.test(message)) {
    return 'auth:errors.deactivated';
  }
  if (/email hoặc mật khẩu không đúng|invalid credentials|invalid email or password|email or password is incorrect|wrong password/.test(message)) {
    return 'auth:errors.invalidCredentials';
  }
  if (/email đã được sử dụng|email.*already (in use|exists|used|registered|taken)|unique.constraint|email.*đã tồn tại/.test(message)) {
    return 'auth:errors.emailAlreadyUsed';
  }
  if (/mật khẩu không được quá 100|password.{0,45}(100|max)/.test(message)) {
    return 'auth:passwordMaxLength';
  }
  if (/tên không được quá 50|name.{0,45}(50|max)/.test(message)) {
    return 'auth:nameMaxLength';
  }
  if (/ngày sinh không hợp lệ|invalid (birth.?date|date of birth)/.test(message)) {
    return 'auth:birthDateInvalid';
  }
  if (/số điện thoại không hợp lệ|invalid phone/.test(message)) {
    return 'auth:phoneInvalid';
  }
  if (/email không hợp lệ|invalid email/.test(message)) {
    return 'auth:emailInvalid';
  }
  if (/mật khẩu phải có ít nhất 6|password.{0,45}(at least 6|min.*6)/.test(message)) {
    return 'auth:passwordMinLength';
  }
  if (/tên phải có ít nhất 2|name.{0,45}(at least 2|min.*2)/.test(message)) {
    return 'auth:nameMinLength';
  }
  if (/dữ liệu không hợp lệ|validation error|invalid data|invalid input/.test(message)) {
    return 'auth:errors.validationFailed';
  }
  if (err?.code === 'ERR_NETWORK' || (!status && /network error|failed to fetch/i.test(err?.message || ''))) {
    return 'auth:errors.networkError';
  }
  if (status && status >= 500) {
    return 'auth:errors.serverError';
  }
  if (action === 'register' && status === 409) {
    return 'auth:errors.emailAlreadyUsed';
  }
  if (action === 'login' && status === 401) {
    return 'auth:errors.invalidCredentials';
  }
  return action === 'register'
    ? 'auth:errors.registerFailed'
    : action === 'google'
      ? 'auth:errors.googleFailed'
      : 'auth:errors.loginFailed';
}
