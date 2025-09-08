import { drawImage } from "./draw";

export class Button {
    private _x: number | (() => number);
    private _y: number | (() => number);
    img: HTMLImageElement;
    f: () => void;

    constructor(x: number | (() => number), y: number | (() => number), img: HTMLImageElement, f: () => void) {
        this._x = x; // this can be a function
        this._y = y; // this can also be a function
        this.img = img;
        this.f = f;
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

    draw(c: CanvasRenderingContext2D, debug?: boolean, mousePos?: { x: number, y: number }): void {
        drawImage(c, this.img, this.x, this.y);
        if (debug) {
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
    }

    handleClick(x: number, y: number): boolean {
        if (this.intersects(x, y)) {
            this.f();
            return true;
        }
        return false;
    }
}

export class DisableButton {
    private _x: number | (() => number);
    private _y: number | (() => number);
    img: HTMLImageElement;
    imgDisabled: HTMLImageElement;
    f: () => void;
    isDisabled: () => boolean;

    constructor(x: number | (() => number), y: number | (() => number), img: HTMLImageElement, imgDisabled: HTMLImageElement, f: () => void, isDisabled: () => boolean) {
        this._x = x;
        this._y = y;
        this.img = img;
        this.imgDisabled = imgDisabled;
        this.f = f;
        this.isDisabled = isDisabled;
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

    draw(c: CanvasRenderingContext2D, debug?: boolean, mousePos?: { x: number, y: number }): void {
        if (this.isDisabled())
            drawImage(c, this.imgDisabled, this.x, this.y);
        else
            drawImage(c, this.img, this.x, this.y);
        if (debug) {
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
    }

    handleClick(x: number, y: number): boolean {
        if (this.isDisabled()) {
            return false; // disabled
        }
        if (this.intersects(x, y)) {
            this.f();
            return true;
        }
        return false;
    }
}