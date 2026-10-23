import { useEffect, useRef, memo } from 'react';
import { rand } from './utils';
import type { ShootingStar } from './types';

const SnowCanvas = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;
    let animationId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resizeCanvas = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Render each snow shape and its glow once, then reuse the bitmap.
    const sprites = new Map<string, HTMLCanvasElement>();
    const getSprite = (radius: number, crystal: boolean, glow: boolean) => {
      const r = Math.round(radius * 4) / 4;
      const key = [r, crystal, glow].join(':');
      const cached = sprites.get(key);
      if (cached) return cached;
      const sprite = document.createElement('canvas');
      const size = Math.ceil((r + 16) * 2);
      sprite.width = sprite.height = Math.ceil(size * dpr);
      const brush = sprite.getContext('2d')!;
      brush.scale(dpr, dpr);
      brush.translate(size / 2, size / 2);
      brush.fillStyle = '#ffffff';
      if (glow) {
        brush.shadowBlur = 8;
        brush.shadowColor = 'rgba(255,255,255,0.9)';
      }
      if (crystal && r > 1.4) {
        for (let i = 0; i < 6; i++) {
          brush.rotate(Math.PI / 3);
          brush.fillRect(r * 0.1, -0.5, r, 1);
        }
      } else {
        brush.beginPath();
        brush.arc(0, 0, r, 0, Math.PI * 2);
        brush.fill();
      }
      sprites.set(key, sprite);
      return sprite;
    };

    class Snowflake {
      x: number;
      y: number;
      radius: number;
      baseSpeed: number;
      depth: number;
      swayAmp: number;
      swaySpeed: number;
      angle: number;
      personalWind: number;
      opacity: number;
      crystal: boolean;

      constructor() {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        this.depth = rand(0.4, 1);
        this.x = Math.random() * w;
        this.y = Math.random() * h - h;
        this.radius = rand(0.8, 3.6) * this.depth;
        this.baseSpeed = rand(0.4, 1.2) * (0.6 + this.depth);
        this.swayAmp = rand(0.3, 1.2) * this.depth;
        this.swaySpeed = rand(0.01, 0.03);
        this.angle = Math.random() * Math.PI * 2;
        this.personalWind = rand(-0.15, 0.15);
        this.opacity = rand(0.4, 1);
        this.crystal = Math.random() < 0.15;
      }

      reset() {
        const w = canvas.width / dpr;
        this.y = -10;
        this.x = Math.random() * w;
        this.depth = rand(0.4, 1);
        this.radius = rand(0.8, 3.6) * this.depth;
        this.baseSpeed = rand(0.4, 1.2) * (0.6 + this.depth);
        this.swayAmp = rand(0.3, 1.2) * this.depth;
        this.swaySpeed = rand(0.01, 0.03);
        this.angle = Math.random() * Math.PI * 2;
        this.personalWind = rand(-0.15, 0.15);
        this.opacity = rand(0.4, 1);
        this.crystal = Math.random() < 0.15;
      }

      update(wind: number, step: number) {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        this.angle += this.swaySpeed * step;
        this.y += this.baseSpeed * step;
        this.x += (wind * this.depth + this.personalWind + Math.cos(this.angle) * this.swayAmp) * step;
        if (this.y > h + 12) this.reset();
        if (this.x > w + 10) this.x = -10;
        if (this.x < -10) this.x = w + 10;
      }

      draw() {
        const sprite = getSprite(this.radius, this.crystal, this.depth > 0.8);
        const size = sprite.width / dpr;
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(sprite, this.x - size / 2, this.y - size / 2, size, size);
        ctx.globalAlpha = 1;
      }
    }

    const area = (window.innerWidth * window.innerHeight) || 1;
    const targetDensity = 0.00025;
    const flakeCount = Math.max(180, Math.min(400, Math.floor(area * targetDensity)));
    const snowflakes: Snowflake[] = [];
    for (let i = 0; i < flakeCount; i++) snowflakes.push(new Snowflake());

    const shootingStars: ShootingStar[] = [];
    const trySpawnStar = (step: number) => {
      if (Math.random() < 1 - Math.pow(1 - 0.006, step)) {
        const w = canvas.width / dpr;
        const y = rand(20, (canvas.height / dpr) * 0.3);
        const x = rand(w * 0.6, w);
        shootingStars.push({ x, y, vx: -6 - Math.random() * 4, vy: 1 + Math.random() * 1.5, life: 0, maxLife: 60 });
      }
    };

    const drawShootingStars = (step: number) => {
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx * step;
        s.y += s.vy * step;
        s.life += step;
        const alpha = Math.max(0, 1 - s.life / s.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3);
        ctx.stroke();
        ctx.restore();
        if (s.life >= s.maxLife) shootingStars.splice(i, 1);
      }
    };

    const santa = { x: window.innerWidth + 120, y: 80, speed: 0.6 + Math.random() * 0.4 };
    let t = 0;

    const drawSanta = () => {
      ctx.save();
      ctx.translate(santa.x, santa.y + Math.sin(t / 40) * 6);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.moveTo(-22, 0);
      ctx.lineTo(22, 0);
      ctx.lineTo(26, 5);
      ctx.lineTo(-26, 5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-5, -8, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(26, -6, 12, 6);
      ctx.beginPath();
      ctx.arc(38, -6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(38, -14, 2, 8);
      ctx.fillRect(34, -12, 8, 2);
      ctx.restore();
    };

    let lastTime = 0;
    const animate = (now: number) => {
      animationId = requestAnimationFrame(animate);
      const elapsed = now - lastTime;
      if (lastTime && elapsed < 1000 / 60 - 0.5) return;
      const step = lastTime ? Math.min(elapsed / (1000 / 60), 3) : 1;
      lastTime = now;
      t += step;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const wind = Math.sin(t / 180) * 0.3 + Math.sin(t / 97) * 0.2;

      for (let i = 0; i < snowflakes.length; i++) {
        snowflakes[i].update(wind, step);
        snowflakes[i].draw();
      }

      trySpawnStar(step);
      drawShootingStars(step);

      santa.x -= santa.speed * step;
      if (santa.x < -140) {
        santa.x = w + 140;
        santa.y = 60 + Math.random() * 80;
        santa.speed = 0.6 + Math.random() * 0.4;
      }
      drawSanta();

    };

    const onVisibilityChange = () => {
      cancelAnimationFrame(animationId);
      lastTime = 0;
      if (!document.hidden) animationId = requestAnimationFrame(animate);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    onVisibilityChange();

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      sprites.clear();
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 10 }}
    />
  );
});

SnowCanvas.displayName = 'SnowCanvas';

export default SnowCanvas;
