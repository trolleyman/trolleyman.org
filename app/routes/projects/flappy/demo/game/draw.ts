export function drawImage(c: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number): void {
	const w = img.width, h = img.height;
	c.drawImage(img, 0, 0, w, h, Math.round(x), Math.round(y), w, h);
}

export function drawImageTiled(c: CanvasRenderingContext2D, img: HTMLImageElement, offsetX?: number, offsetY?: number, maxX?: number, maxY?: number): void {
	if (typeof offsetX === "undefined") offsetX = 0;
	if (typeof offsetY === "undefined") offsetY = 0;
	if (typeof maxX === "undefined") maxX = Infinity;
	if (typeof maxY === "undefined") maxY = Infinity;
	
	const cw = c.canvas.width,
		ch = c.canvas.height,
		iw = img.width,
		ih = img.height;
	
	if (iw === 0 || ih === 0)
		return;
	
	let ny = 0;
	for (let y = offsetY!; y < ch && ny < maxY!; y += ih) {
		let nx = 0;
		for (let x = offsetX!; x < cw && nx < maxX!; x += iw) {
			drawImage(c, img, x, y);
			nx += 1;
		}
		ny += 1;
	}
}

export function drawFlappyText(c: CanvasRenderingContext2D, text: string, startX: number, startY: number, col?: string, outline?: number, space?: number, left?: boolean): void {
	function drawText(c: CanvasRenderingContext2D, text: string, startX: number, startY: number, outline: number, x?: number, y?: number): void {
		if (typeof x === "undefined") x = 0;
		if (typeof y === "undefined") y = 0;
		x *= outline;
		y *= outline;
		c.fillText(text, startX + x, startY + y);
	}
	if (typeof col === "undefined") col = "white";
	if (typeof outline === "undefined") outline = 5;
	
	if (typeof space !== "undefined") {
		// ensure that text doesn't take up more than space pixels.
		if (space <= 0) {
			return;
		}
		
		const dotsW = c.measureText('...').width;
		const measureWidth = function(s: string): number {
			return c.measureText(s).width + 2 * outline;
		};
		const measureWidthWithDots = function(s: string): number {
			return measureWidth(s) + dotsW;
		};

		// measure current text
		let w = measureWidth(text);
		let truncated = false;
		while (w > space && text.length !== 0) {
			if (left) // truncate from left if left is true
				text = text.substring(1, text.length);
			else
				text = text.substring(0, text.length - 1);
			truncated = true;
			w = measureWidthWithDots(text);
		}
		// text is truncated
		// if left is true, add '...' on the left instead of the right.
		if (truncated) {
			if (left)
				text = '...' + text;
			else
				text = text + '...';
		}
	}
	
	c.fillStyle = "black";
	drawText(c, text, startX, startY, outline, 1, 1);
	drawText(c, text, startX, startY, outline, 1, -1);
	drawText(c, text, startX, startY, outline, -1, 1);
	drawText(c, text, startX, startY, outline, -1, -1);
	c.fillStyle = col;
	drawText(c, text, startX, startY, outline);
}

