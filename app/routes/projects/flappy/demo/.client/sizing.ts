export const MAX_LEADERBOARD_WIDTH = 700;
export const LEADERBOARD_THRESHOLD_WIDTH = 410;
export const LEADERBOARD_THRESHOLD_HEIGHT = 650;
export const LEADERBOARD_SMALLER_THRESHOLD_HEIGHT = 500;

export function getDPR(): number {
  return window.devicePixelRatio || 1;
}

export function lerp(min: number, max: number, f: number): number {
  return (max - min) * f + min;
}

export function lerpFloor(min: number, max: number, f: number): number {
  return Math.floor(lerp(min, max, f));
}

export function getPipeSpacing(): number {
  return 150;
}
