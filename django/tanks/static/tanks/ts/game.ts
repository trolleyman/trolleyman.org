
export class Game {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;

	constructor() {
		this.canvas = <HTMLCanvasElement>document.getElementById('canvas');
		this.context = this.canvas.getContext('2d');
		window.requestAnimationFrame(() => this.loop());
	}

	loop() {
		window.requestAnimationFrame(() => this.loop());
		
		// Update
		this.update();
		
		// Draw
		this.draw();
	}
	
	update() {
		
	}
	
	draw() {
		
	}
}

new Game();



