import { useState, type FormEvent } from 'react';
import { getAndroidBackendOrigin, saveAndroidBackendOrigin, validateAndroidBackendOrigin } from '@/services/backendOrigin';

export default function AndroidServerSetup() {
  const [input, setInput] = useState(getAndroidBackendOrigin);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChecking(true);
    setError('');
    try {
      const origin = validateAndroidBackendOrigin(input);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(`${origin}/api/health`, {
          method: 'GET',
          credentials: 'omit',
          cache: 'no-store',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Địa chỉ này không trả về trạng thái máy chủ PlantHub.');
        const body = await response.json();
        if (body?.status !== 'ok') throw new Error('Không xác nhận được API PlantHub.');
      } finally {
        window.clearTimeout(timeout);
      }
      saveAndroidBackendOrigin(origin);
      window.location.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không kết nối được máy chủ.');
      setChecking(false);
    }
  }

  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-gray-50 dark:bg-black px-4 py-8 text-gray-900 dark:text-white">
      <section className="w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl dark:bg-emerald-950">🌱</div>
        <h1 className="text-2xl font-bold">Kết nối PlantHub</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
          Nhập địa chỉ HTTPS của backend PlantHub mà điện thoại có thể truy cập.
          Nếu sử dụng Tailscale, hãy kết nối Tailscale trên điện thoại trước.
        </p>
        <form className="mt-6 space-y-4" onSubmit={connect}>
          <div>
            <label htmlFor="plant-backend-url" className="mb-2 block text-sm font-medium">Địa chỉ máy chủ</label>
            <input
              id="plant-backend-url"
              type="url"
              inputMode="url"
              value={input}
              onChange={event => setInput(event.target.value)}
              placeholder="https://server.example.com"
              required
              autoCapitalize="none"
              autoComplete="url"
              spellCheck={false}
              className="w-full min-w-0 rounded-xl border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>}
          <button disabled={checking} type="submit" className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
            {checking ? 'Đang kiểm tra kết nối…' : 'Kết nối và tiếp tục'}
          </button>
        </form>
        <p className="mt-5 text-xs leading-5 text-gray-500 dark:text-gray-400">
          Không nhập localhost hoặc địa chỉ web frontend. Chỉ địa chỉ backend, không thêm /api/v1.
          Địa chỉ được lưu trên điện thoại, không gửi cho dịch vụ bên ngoài.
        </p>
      </section>
    </main>
  );
}
