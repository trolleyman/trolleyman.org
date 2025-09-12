import { drawImage } from "./draw";

abstract class BaseButton {
    protected _x: number | (() => number);
    protected _y: number | (() => number);
    protected img: HTMLImageElement;
    public activate: () => void;

    constructor(x: number | (() => number), y: number | (() => number), img: HTMLImageElement, activate: () => void) {
        this._x = x;
        this._y = y;
        this.img = img;
        this.activate = activate;
    }

    get x(): number {
        if (typeof this._x === "function") return this._x();
        else return this._x;
    }
    set x(x: number | (() => number)) { this._x = x; }

    get y(): number {
        if (typeof this._y === "function") return this._y();
        else return this._y;
    }
    set y(y: number | (() => number)) { this._y = y; }

    intersects(x: number, y: number): boolean {
        return x >= this.x && x < this.x + this.img.width && y >= this.y && y < this.y + this.img.height;
    }

    protected drawDebug(c: CanvasRenderingContext2D, mousePos?: { x: number, y: number }): void {
        const isIntersecting = mousePos ? this.intersects(mousePos.x, mousePos.y) : false;

        // Draw button border - green if intersecting, red otherwise
        c.strokeStyle = isIntersecting ? "green" : "red";
        c.strokeRect(this.x, this.y, this.img.width, this.img.height);

        // Draw mouse position as blue cross
        if (mousePos) {
            c.strokeStyle = "blue";
            c.lineWidth = 2;
            const crossSize = 10;
            c.beginPath();
            c.moveTo(mousePos.x - crossSize, mousePos.y);
            c.lineTo(mousePos.x + crossSize, mousePos.y);
            c.moveTo(mousePos.x, mousePos.y - crossSize);
            c.lineTo(mousePos.x, mousePos.y + crossSize);
            c.stroke();
            c.lineWidth = 1; // Reset line width
        }
    }

    abstract draw(c: CanvasRenderingContext2D, debug?: boolean, mousePos?: { x: number, y: number }): void;
    abstract handleClick(x: number, y: number): boolean;
}

export class Button extends BaseButton {
    constructor(x: number | (() => number), y: number | (() => number), img: HTMLImageElement, f: () => void) {
        super(x, y, img, f);
    }

    draw(c: CanvasRenderingContext2D, debug?: boolean, mousePos?: { x: number, y: number }): void {
        drawImage(c, this.img, this.x, this.y);
        if (debug) {
            this.drawDebug(c, mousePos);
        }
    }

    handleClick(x: number, y: number): boolean {
        if (this.intersects(x, y)) {
            this.activate();
            return true;
        }
        return false;
    }
}

export class DisableButton extends BaseButton {
    protected imgDisabled: HTMLImageElement;
    protected isDisabled: () => boolean;

    constructor(x: number | (() => number), y: number | (() => number), img: HTMLImageElement, imgDisabled: HTMLImageElement, f: () => void, isDisabled: () => boolean) {
        super(x, y, img, f);
        this.imgDisabled = imgDisabled;
        this.isDisabled = isDisabled;
    }

    draw(c: CanvasRenderingContext2D, debug?: boolean, mousePos?: { x: number, y: number }): void {
        if (this.isDisabled())
            drawImage(c, this.imgDisabled, this.x, this.y);
        else
            drawImage(c, this.img, this.x, this.y);
        if (debug) {
            this.drawDebug(c, mousePos);
        }
    }

    handleClick(x: number, y: number): boolean {
        if (this.isDisabled()) {
            return false; // disabled
        }
        if (this.intersects(x, y)) {
            this.activate();
            return true;
        }
        return false;
    }
}