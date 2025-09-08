
export const MIN_CANVAS_WIDTH = 320;
export const MAX_CANVAS_WIDTH = 10000;
export const MAX_CANVAS_WIDTH_SIZING = 1440;
export const MIN_CANVAS_HEIGHT = 480;
export const MAX_CANVAS_HEIGHT = 915;

export const MAX_LEADERBOARD_WIDTH = 700;
export const LEADERBOARD_THRESHOLD_WIDTH = 410;
export const LEADERBOARD_THRESHOLD_HEIGHT = 650;

export function lerp(min: number, max: number, f: number): number {
    return (max - min) * f + min;
}

export function lerpFloor(min: number, max: number, f: number): number {
    return Math.floor(lerp(min, max, f));
}

export function getPipeSpacing(): number {
    return 150;
}
