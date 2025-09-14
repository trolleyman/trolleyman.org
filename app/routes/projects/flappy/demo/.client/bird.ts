import type { Game } from './game';
import { Rect } from './rect';

export function calculateAngle(x: number, y: number): number {
  return Math.atan(-y / x);
}

export class Bird {
  posX: number;
  posY: number;
  velX: number;
  velY: number;
  ang: number;
  prevAng: number;
  flapButtonDownPrev: boolean;
  t: number;
  dead: boolean;

  constructor(game: Game) {
    this.posX = 0;
    this.posY = game.getBirdStartY();

    this.velX = 150;
    this.velY = 20;

    this.ang = calculateAngle(this.velX, this.velY);
    this.prevAng = this.ang;

    this.flapButtonDownPrev = false;
    this.t = 0;

    this.dead = false;
  }

  getBB(w: number, h: number) {
    return new Rect(this.posX, this.posY, w, h, this.ang);
  }
}
