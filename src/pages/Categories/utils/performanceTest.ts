/**
 * Performance testing utilities for Categories
 * Sử dụng để đo thời gian thực thi các thao tác
 */

export const measurePerformance = {
  start(label: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  },

  end(label: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`);
      try {
        performance.measure(label, `${label}-start`, `${label}-end`);
        const measure = performance.getEntriesByName(label)[0];
        console.log(`⏱️ ${label}: ${measure.duration.toFixed(2)}ms`);
        performance.clearMarks(`${label}-start`);
        performance.clearMarks(`${label}-end`);
        performance.clearMeasures(label);
        return measure.duration;
      } catch (e) {
        console.warn('Performance measurement failed:', e);
      }
    }
    return 0;
  },

  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(label);
    }
  }
};

// Thêm vào console để dễ debug
if (typeof window !== 'undefined') {
  (window as any).measurePerformance = measurePerformance;
}
