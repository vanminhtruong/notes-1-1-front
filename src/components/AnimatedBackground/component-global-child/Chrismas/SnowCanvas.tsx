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

      update(wind: number) {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        this.angle += this.swaySpeed;
        this.y += this.baseSpeed;
        this.x += wind * this.depth + this.personalWind + Math.cos(this.angle) * this.swayAmp;
        if (this.y > h + 12) this.reset();
        if (this.x > w + 10) this.x = -10;
        if (this.x < -10) this.x = w + 10;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        if (this.depth > 0.8) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(255,255,255,0.9)';
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fillStyle = '#ffffff';
        if (this.crystal && this.radius > 1.4) {
          const r = this.radius;
          ctx.translate(this.x, this.y);
          for (let i = 0; i < 6; i++) {
            ctx.rotate(Math.PI / 3);
            ctx.fillRect(r * 0.1, -0.5, r, 1);
          }
        } else {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    const area = (window.innerWidth * window.innerHeight) || 1;
    const targetDensity = 0.00025;
    const flakeCount = Math.max(180, Math.min(400, Math.floor(area * targetDensity)));
    const snowflakes: Snowflake[] = [];
    for (let i = 0; i < flakeCount; i++) snowflakes.push(new Snowflake());

    const shootingStars: ShootingStar[] = [];
    const trySpawnStar = () => {
      if (Math.random() < 0.006) {
        const w = canvas.width / dpr;
        const y = rand(20, (canvas.height / dpr) * 0.3);
        const x = rand(w * 0.6, w);
        shootingStars.push({ x, y, vx: -6 - Math.random() * 4, vy: 1 + Math.random() * 1.5, life: 0, maxLife: 60 });
      }
    };

    const drawShootingStars = () => {
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
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

    const animate = () => {
      t++;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      const wind = Math.sin(t / 180) * 0.3 + Math.sin(t / 97) * 0.2;

      for (let i = 0; i < snowflakes.length; i++) {
        snowflakes[i].update(wind);
        snowflakes[i].draw();
      }

      trySpawnStar();
      drawShootingStars();

      santa.x -= santa.speed;
      if (santa.x < -140) {
        santa.x = w + 140;
        santa.y = 60 + Math.random() * 80;
        santa.speed = 0.6 + Math.random() * 0.4;
      }
      drawSanta();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
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
