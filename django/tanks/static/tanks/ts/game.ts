
class Game {
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D

	constructor() {
		this.canvas = <HTMLCanvasElement>document.getElementById('canvas')
		this.ctx = this.canvas.getContext('2d')
		window.requestAnimationFrame(() => this.loop())
	}

	loop() {
		window.requestAnimationFrame(() => this.loop())
		
		// Update
		this.update()
		
		// Draw
		this.draw()
	}
	
	update() {
		
	}
	
	draw() {
		this.ctx.canvas.width  = window.innerWidth;
		this.ctx.canvas.height = window.innerHeight;
		
		this.ctx.fillStyle = "black"
		this.ctx.fillRect(100, 100, 100, 100)
	}
}
