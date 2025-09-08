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

	draw(c: CanvasRenderingContext2D): void {
		drawImage(c, this.img, this.x, this.y);
	}

	handleClick(x: number, y: number): boolean {
		if (x >= this.x && x < this.x + this.img.width && y >= this.y && y < this.y + this.img.height) {
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

	draw(c: CanvasRenderingContext2D): void {
		if (this.isDisabled())
			drawImage(c, this.imgDisabled, this.x, this.y);
		else
			drawImage(c, this.img, this.x, this.y);
	}

	handleClick(x: number, y: number): boolean {
		if (this.isDisabled()) {
			return false; // disabled
		}
		if (x >= this.x && x < this.x + this.img.width && y >= this.y && y < this.y + this.img.height) {
			this.f();
			return true;
		}
		return false;
	}
}