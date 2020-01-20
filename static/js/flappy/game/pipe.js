
const PIPE_START_X = -2000;
const NUM_PIPES = 20;

function Pipe(x, y, spacing) {
	this.reuse(x, y, spacing);
}

Pipe.prototype.reuse = function(x, y, spacing) {
	if (typeof spacing === "undefined")
		spacing = getPipeSpacing();
	if (typeof y === "undefined")
		y = getPipeY();
	
	this.x = x;
	this.y = y;
	this.spacing = spacing;
	this.passed = false;
	if (typeof this.upperCache === "undefined")
		this.upperCache = new Rect();
	if (typeof this.lowerCache === "undefined")
		this.lowerCache = new Rect();
}

const PIPE_H = 2000;

Pipe.prototype.bbUpper = function(w) {
	this.upperCache.reuse(this.x + w/2, this.y + this.spacing + PIPE_H/2, w, PIPE_H, 0);
	return this.upperCache;
}
Pipe.prototype.bbLower = function(w) {
	this.lowerCache.reuse(this.x + w/2, this.y / 2, w, this.y, 0);
	return this.lowerCache;
}
