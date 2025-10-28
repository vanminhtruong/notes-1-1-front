export type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
};

export interface SnowflakeProps {
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
}
