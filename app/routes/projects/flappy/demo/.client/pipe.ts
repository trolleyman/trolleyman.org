
import { Rect } from './rect';
import { getPipeSpacing } from './sizing';

export const PIPE_START_X = -2000;
export const NUM_PIPES = 20;
const PIPE_H = 2000;

export class Pipe {
    x: number;
    y: number;
    spacing: number;
    passed: boolean = false;
    upperCache: Rect;
    lowerCache: Rect;

    constructor(x: number, y: number, spacing?: number) {
        this.x = x
        this.y = y 
        this.spacing = spacing ?? getPipeSpacing()
        this.upperCache = new Rect(0, 0, 0, 0, 0)
        this.lowerCache = new Rect(0, 0, 0, 0, 0)
    }

    reuse(x: number, y: number, spacing?: number): void {
        this.x = x
        this.y = y
        this.spacing = spacing ?? getPipeSpacing()
        this.upperCache = new Rect(0, 0, 0, 0, 0)
        this.lowerCache = new Rect(0, 0, 0, 0, 0)
    }

    bbUpper(w: number): Rect {
        this.upperCache.reuse(this.x + w/2, this.y + this.spacing + PIPE_H/2, w, PIPE_H, 0);
        return this.upperCache;
    }

    bbLower(w: number): Rect {
        this.lowerCache.reuse(this.x + w/2, this.y / 2, w, this.y, 0);
        return this.lowerCache;
    }
}
