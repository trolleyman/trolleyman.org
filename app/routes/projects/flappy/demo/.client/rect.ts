import { intersectsRects } from './intersection';
import { getDPR } from './sizing';

export class Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  rot: number;

  constructor(x: number, y: number, w: number, h: number, rot: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.rot = rot;
  }

  reuse(x: number, y: number, w: number, h: number, rot: number): void {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.rot = rot;
  }

  draw(c: CanvasRenderingContext2D): void {
    // center x & y
    const offsetX = -this.w / 2;
    const offsetY = -this.h / 2;
    const y = c.canvas.height / getDPR() - this.y;

    c.translate(this.x, y);
    c.rotate(this.rot);
    c.translate(offsetX, offsetY);
    c.strokeRect(0, 0, this.w, this.h);
    c.translate(-offsetX, -offsetY);
    c.rotate(-this.rot); // faster than c.save(); c.restore();
    c.translate(-this.x, -y);
  }

  intersects(r: Rect): boolean {
    return intersectsRects(
      this.x,
      this.y,
      this.w,
      this.h,
      this.rot,
      r.x,
      r.y,
      r.w,
      r.h,
      r.rot,
    );
  }
}
