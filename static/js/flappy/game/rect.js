function Rect(x, y, w, h, rot) {
	this.reuse(x, y, w, h, rot);
}

Rect.prototype.reuse = function(x, y, w, h, rot) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.rot = rot;
}

Rect.prototype.draw = function(c) {
	// center x & y
	var offsetX = -this.w / 2;
	var offsetY = -this.h / 2;
	var y = c.canvas.height - this.y;
	
	c.translate(this.x, y);
	c.rotate(this.rot);
	c.translate(offsetX, offsetY);
	c.strokeRect(0, 0, this.w, this.h);
	c.translate(-offsetX, -offsetY);
	c.rotate(-this.rot); // faster than c.save(); c.restore();
	c.translate(-this.x, -y);
}

Rect.prototype.intersects = function(r) {
	return intersectsRects(this.x, this.y, this.w, this.h, this.rot, r.x, r.y, r.w, r.h, r.rot);
}