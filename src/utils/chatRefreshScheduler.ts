// Merge invalidations, never run two copies of the same loader concurrently,
// and keep one trailing refresh when data changes during an in-flight request.
export function createChatRefreshScheduler(delay = 250) {
  const pending = new Map<string, { run: () => unknown; dirty: boolean; running: boolean; timer?: ReturnType<typeof setTimeout> }>();
  let disposed = false;
  const flush = async (key: string) => {
    const job = pending.get(key);
    if (!job || disposed) return;
    job.timer = undefined;
    job.running = true;
    job.dirty = false;
    try { await job.run(); } catch { /* Loaders own user-facing errors. */ }
    finally {
      job.running = false;
      if (!disposed && job.dirty) job.timer = setTimeout(() => void flush(key), delay);
      else pending.delete(key);
    }
  };
  return {
    schedule(key: string, run: () => unknown) {
      if (disposed) return;
      const existing = pending.get(key);
      if (existing) { existing.run = run; existing.dirty = true; return; }
      const job = { run, dirty: true, running: false, timer: setTimeout(() => void flush(key), delay) };
      pending.set(key, job);
    },
    dispose() {
      disposed = true;
      for (const job of pending.values()) clearTimeout(job.timer);
      pending.clear();
    },
  };
}
