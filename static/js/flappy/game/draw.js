function drawImage(c, img, x, y) {
	var w = img.width, h = img.height;
	c. drawImage(img, 0, 0, w, h, Math.round(x), Math.round(y), w, h);
}

function drawImageTiled(c, img, offsetX, offsetY, maxX, maxY) {
	if (typeof offsetX === "undefined") offsetX = 0;
	if (typeof offsetY === "undefined") offsetY = 0;
	if (typeof maxX === "undefined") maxX = Infinity;
	if (typeof maxY === "undefined") maxY = Infinity;
	
	var cw = c.canvas.width,
		ch = c.canvas.height,
		iw = img.width,
		ih = img.height;
	
	if (iw == 0 || ih == 0)
		return;
	
	var ny = 0;
	for (var y = offsetY; y < ch && ny < maxY; y += ih) {
		var nx = 0;
		for (var x = offsetX; x < cw && nx < maxX; x += iw) {
			drawImage(c, img, x, y, iw, ih);
			nx += 1;
		}
		ny += 1;
	}
}

function drawFlappyText(c, text, startX, startY, col, outline, space, left) {
	function drawText(c, text, startX, startY, outline, x, y) {
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
		
		var dotsW = c.measureText('...').width;
		var measureWidth = function(s) {
			return c.measureText(s).width + 2*outline;
		};
		var measureWidthWithDots = function(s) {
			return measureWidth(s) + dotsW;
		};

		// measure current text
		var w = measureWidth(text);
		var truncated = false;
		while (w > space && text.length !== 0) {
			if (left) // truncate from left if left is true
				text = text.substring(1, text.length);
			else
				text = text.substring(0, text.length-1);
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
	drawText(c, text, startX, startY, outline,  1,  1);
	drawText(c, text, startX, startY, outline,  1, -1);
	drawText(c, text, startX, startY, outline, -1,  1);
	drawText(c, text, startX, startY, outline, -1, -1);
	c.fillStyle = col;
	drawText(c, text, startX, startY, outline);
}

