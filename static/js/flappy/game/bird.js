
function calculateAngle(x, y) {
	return Math.atan(-y / x);
}

function Bird() {
	this.posX = 0;
	this.posY = getBirdStartY();
	
	this.velX = 150;
	this.velY = 20;
	
	this.ang = calculateAngle(this.velX, this.velY);
	this.prevAng = this.ang;
	
	this.flapButtonDownPrev = false;
	this.t = 0;
	
	this.dead = false;
}

Bird.prototype.getBB = function(w, h) {
	return new Rect(this.posX, this.posY, w, h, this.ang);
}
