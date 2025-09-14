//var line = {x1:0,y1:0,x2:0,y2:0};
//var box = {x:0,y:0,w:0,h:0,rot:0};

export function intersectsRects(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  rot1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number,
  rot2: number,
): boolean {
  // normalize rotations so that r1 isn't rotated.
  // rotations are from the centre of the rects.
  // x and y are relative to the centre of the rect as well.

  // translate so that x1,y1 is the origin
  x2 -= x1;
  y2 -= y1;

  // rotate the point -rot1
  let s = Math.sin(-rot1);
  let c = Math.cos(-rot1);
  let xnew = x2 * c - y2 * s;
  let ynew = x2 * s + y2 * c;
  rot2 -= rot1;

  // translate so that 0,0 is the origin again
  x2 = x1 + xnew;
  y2 = y1 + ynew;

  // calculate extents of rect
  s = Math.sin(rot2);
  const cs = Math.cos(rot2);
  const wd2 = w2 / 2;
  const hd2 = h2 / 2;
  let tl = rotatePoint(s, cs, -wd2, -hd2);
  tl.x += x2;
  tl.y += y2; // top left
  let tr = rotatePoint(s, cs, wd2, -hd2);
  tr.x += x2;
  tr.y += y2; // top right
  let bl = rotatePoint(s, cs, -wd2, hd2);
  bl.x += x2;
  bl.y += y2; // bottom left
  let br = rotatePoint(s, cs, wd2, hd2);
  br.x += x2;
  br.y += y2; // bottom right

  let intersects = false;
  intersects =
    intersects || intersectsRectLine(x1, y1, w1, h1, tl.x, tl.y, tr.x, tr.y); // top
  intersects =
    intersects || intersectsRectLine(x1, y1, w1, h1, bl.x, bl.y, br.x, br.y); // bottom
  intersects =
    intersects || intersectsRectLine(x1, y1, w1, h1, tl.x, tl.y, bl.x, bl.y); // left
  intersects =
    intersects || intersectsRectLine(x1, y1, w1, h1, tr.x, tr.y, br.x, br.y); // right

  return intersects;
}

export function rotatePointX(
  s: number,
  c: number,
  x: number,
  y: number,
): number {
  return x * c - y * s;
}

export function rotatePointY(
  s: number,
  c: number,
  x: number,
  y: number,
): number {
  return x * s + y * c;
}

export function rotatePoint(
  s: number,
  c: number,
  x: number,
  y: number,
): { x: number; y: number } {
  return { x: rotatePointX(s, c, x, y), y: rotatePointY(s, c, x, y) };
}

export function intersectsRectLine(
  x: number,
  y: number,
  w: number,
  h: number,
  lx1: number,
  ly1: number,
  lx2: number,
  ly2: number,
): boolean {
  x -= w / 2;
  y -= h / 2;

  //box.x = x; box.y = y; box.w = w; box.h = h; box.rot = 0;
  //line.x1 = lx1; line.y1 = ly1; line.x2 = lx2; line.y2 = ly2;

  let minX = lx1;
  let maxX = lx2;

  if (lx1 > lx2) {
    minX = lx2;
    maxX = lx1;
  }

  if (maxX > x + w) maxX = x + w;

  if (minX < x) minX = x;

  if (minX > maxX) return false;

  let minY = ly1;
  let maxY = ly2;

  const dx = lx2 - lx1;

  if (Math.abs(dx) > 0.0000001) {
    const a = (ly2 - ly1) / dx;
    const b = ly1 - a * lx1;
    minY = a * minX + b;
    maxY = a * maxX + b;
  }

  if (minY > maxY) {
    const tmp = maxY;
    maxY = minY;
    minY = tmp;
  }

  if (maxY > y + h) maxY = y + h;

  if (minY < y) minY = y;

  if (minY > maxY) return false;

  return true;
}
