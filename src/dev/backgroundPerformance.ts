// Loaded only in development with ?backgroundPerf=1. Measures the real page
// without reading account data or changing animation settings.
export function mountBackgroundPerformance() {
  const panel = document.createElement('aside');
  panel.setAttribute('aria-label', 'Kiểm tra hiệu năng nền');
  Object.assign(panel.style, {
    position: 'fixed', right: '12px', bottom: '12px', zIndex: '2147483647',
    padding: '12px', borderRadius: '8px', background: '#111', color: '#fff',
    width: '300px', font: '12px monospace', border: '1px solid #555',
  });
  const button = document.createElement('button');
  button.textContent = 'Đo hiệu năng 6 giây';
  Object.assign(button.style, { padding: '8px', background: '#245a49', color: '#fff' });
  const output = document.createElement('output');
  output.setAttribute('aria-label', 'Kết quả hiệu năng');
  Object.assign(output.style, { display: 'block', marginTop: '8px', whiteSpace: 'pre-wrap' });
  output.textContent = 'Bật/tắt nền ở menu giao diện rồi bấm đo.';
  panel.append(button, output);
  document.body.append(panel);

  button.onclick = () => {
    button.disabled = true;
    output.textContent = 'Đang đo…';
    const frames: number[] = [];
    let previous = 0;
    let started = 0;
    const theme = document.querySelector('[data-background-theme]')?.getAttribute('data-background-theme') ?? 'none';
    const sample = (now: number) => {
      if (!started) started = now;
      if (previous) frames.push(now - previous);
      previous = now;
      if (now - started < 6000) {
        requestAnimationFrame(sample);
        return;
      }
      const sorted = [...frames].sort((a, b) => a - b);
      output.textContent = JSON.stringify({
        theme,
        viewport: [window.innerWidth, window.innerHeight],
        fps: Math.round(frames.length * 1000 / (now - started)),
        p95ms: Number(sorted[Math.floor(sorted.length * 0.95)]?.toFixed(1)),
        framesOver33ms: frames.filter(ms => ms > 33.4).length,
        activeScenes: document.querySelectorAll('[data-background-theme]').length,
        canvases: document.querySelectorAll('canvas').length,
      }, null, 2);
      button.disabled = false;
    };
    requestAnimationFrame(sample);
  };
}
