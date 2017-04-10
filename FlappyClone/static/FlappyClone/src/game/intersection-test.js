
function Rect(x, y, w, h, rot) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.rot = rot;
}

Rect.prototype.render = function(c) {
	// center x & y
	offsetX = -this.w / 2;
	offsetY = -this.h / 2;
	
	c.translate(this.x, this.y);
	c.rotate(this.rot);
	c.translate(offsetX, offsetY);
	c.strokeRect(0, 0, this.w, this.h);
	c.translate(-offsetX, -offsetY);
	c.rotate(-this.rot); // faster than c.save(); c.restore();
	c.translate(-this.x, -this.y);
}

function IntersectionTest() {
	this.out = document.getElementById("out");
	this.canvas = document.getElementById("canvas");
	this.lmbDown = false;
	this.mouseX = 0;
	this.mouseY = 0;
	var that = this;
	window.onmousedown = function(e) { if (e.button == 0) that.lmbDown = true;  that.mouseX = e.offsetX; that.mouseY = e.offsetY; };
	window.onmousemove = function(e) { that.mouseX = e.offsetX; that.mouseY = e.offsetY; }
	window.onmouseup   = function(e) { if (e.button == 0) that.lmbDown = false; };
	window.onmousewheel = function(e) { that.r1.rot += e.deltaY * 0.0005; };
	
	this.r1 = new Rect(100, 200, 200, 300, 0.0);
	this.r2 = new Rect(500, 500, 350, 150, 1.0);
}

IntersectionTest.prototype.mainLoop = function() {
	requestAnimationFrame(this.mainLoop.bind(this));
	this.update();
	this.render();
}

IntersectionTest.prototype.update = function() {
	if (this.lmbDown) {
		this.r1.x = this.mouseX;
		this.r1.y = this.mouseY;
	}
}

IntersectionTest.prototype.render = function() {
	// get context
	var c = this.canvas.getContext("2d");
	// clear canvas - don't technically need this, but it's nice
	//c.clearRect(0, 0, c.canvas.width, c.canvas.height);
	c.fillStyle = "grey";
	c.fillRect(0,0, c.canvas.width, c.canvas.height);
	c.strokeStyle = "red";
	this.r1.render(c);
	c.strokeStyle = "blue";
	this.r2.render(c);

	var r1 = this.r1;
	var r2 = this.r2;
	
	if (intersectsRects(r1.x, r1.y, r1.w, r1.h, r1.rot, r2.x, r2.y, r2.w, r2.h, r2.rot)) {
		this.out.innerHTML = "Intersects";
	} else {
		this.out.innerHTML = "Doesn't Intersect";
	}
	
	var x1 = r1.x, y1 = r1.y, x2 = r2.x, y2 = r2.y;
	var rot1 = r1.rot, rot2 = r2.rot;
	var w2 = r2.w, h2 = r2.h;
	// translate so that x1,y1 is the origin
	x2 -= x1;
	y2 -= y1;
	
	// rotate the point -rot1
	var s = Math.sin(-rot1);
	var cs = Math.cos(-rot1);
	var xnew = x2 * cs - y2 *  s;
	var ynew = x2 * s  + y2 * cs;
	rot2 -= rot1;
	
	// translate so that 0,0 is the origin again
	x2 = x1 + xnew;
	y2 = y1 + ynew;

	// calculate extents of rect
	s = Math.sin(rot2);
	cs = Math.cos(rot2);
	var wd2 = w2 / 2;
	var hd2 = h2 / 2;
	var tl = rotatePoint(s, cs, -wd2, -hd2); tl.x += x2; tl.y += y2; // top left
	var tr = rotatePoint(s, cs,  wd2, -hd2); tr.x += x2; tr.y += y2; // top right
	var bl = rotatePoint(s, cs, -wd2,  hd2); bl.x += x2; bl.y += y2; // bottom left
	var br = rotatePoint(s, cs,  wd2,  hd2); br.x += x2; br.y += y2; // bottom right
	
	var r3 = new Rect(x2, y2, r2.w, r2.h, rot2);
	c.strokeStyle = "green";
	r3.render(c);
	var r4 = new Rect(r1.x, r1.y, r1.w, r1.h, 0.0);
	r4.render(c);

	c.strokeStyle = "black";
	c.beginPath();
	c.moveTo(tl.x, tl.y);
	c.lineTo(tr.x, tr.y);
	c.stroke();

	//c.strokeStyle = "pink";
	//c.beginPath();
	//c.moveTo(line.x1, line.y1);
	//c.lineTo(line.x2, line.y2);
	//c.stroke();

	//c.strokeStyle = "yellow";
	//c.strokeRect(box.x, box.y, box.w, box.h);
	//c.stroke();
}
