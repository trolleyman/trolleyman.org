"use strict";

const PIPE_SPACING_X = 250;

const MAX_VEL_Y = 400;

const STATE_LOADING = 0;
const STATE_START = 1;
const STATE_PLAYING = 2;
const STATE_PAUSED = 3;
const STATE_DEATH = 4;
const STATE_LEADERBOARD = 5;
const STATE_LEADERBOARD_ERROR = 6;

const WHICH_CODE_SPACE = 32;

window.onload = function(){
	var game = new Game();
	window.requestAnimationFrame(game.mainLoop.bind(game));
};

function stateToString(state) {
		 if (state === STATE_LOADING)     return "STATE_LOADING";
	else if (state === STATE_START)       return "STATE_START";
	else if (state === STATE_PLAYING)     return "STATE_PLAYING";
	else if (state === STATE_PAUSED)      return "STATE_PAUSED";
	else if (state === STATE_DEATH)       return "STATE_DEATH";
	else if (state === STATE_LEADERBOARD) return "STATE_LEADERBOARD";
	else if (state === STATE_LEADERBOARD_ERROR) return "STATE_LEADERBOARD_ERROR";
	else return "Invalid state: " + state;
}

function copyTouch(t) {
	return { identifier: touch.identifier, pageX: touch.pageX, pageY: touch.pageY };
}

function Game() {
	// init canvas
	this.canvas = document.getElementById("canvas");
	
	// init username entry
	this.usernameEntry = document.getElementById("username-entry");
	
	// init mouse
	this.canvas.onmousedown = this.onmousedown.bind(this);
	this.canvas.onmouseup = this.onmouseup.bind(this);
	
	// init touch
	this.canvas.addEventListener("touchstart" , this.ontouchstart .bind(this));
	this.canvas.addEventListener("touchend"   , this.ontouchend   .bind(this));
	this.canvas.addEventListener("touchcancel", this.ontouchcancel.bind(this));
	this.canvas.addEventListener("touchmove"  , this.ontouchmove  .bind(this));
	this.touches = [];
	
	// setup keys
	this.keyCodes = [];
	this.keyWhichs = [];
	this.keyUps = [];
	this.keyDowns = [];
	window.onkeyup = (function(e) {
		this.keyCodes[e.code] = false;
		this.keyWhichs[e.which] = false;
		this.keyUps[this.keyUps.length] = e;
	}).bind(this);
	window.onkeydown = (function(e) {
		this.keyCodes[e.code] = true;
		this.keyWhichs[e.which] = true;
		this.keyDowns[this.keyDowns.length] = e;
	}).bind(this);
	
	this.flappyFontLoaded = false;
	var loadFlappyFont = (function() {
		// setup font loading
		var ffoptions = {
			success: (function() {
				console.log("FlappyFont loaded.");
				this.flappyFontLoaded = true;
				this.notifyLoadedFont();
			}).bind(this),
			error: (function() {
				console.log("FlappyFont could not be downloaded.");
				this.flappyFontLoaded = true;
				this.notifyLoadedFont();
			}).bind(this),
		};
		FontFaceOnload("FlappyFont", ffoptions);
	}).bind(this);
	
	// load images
	this.imgs = {};
	this.imgs.flappy = [];
	this.imgs.deadFlappy = [];
	this.flappysLoaded = false;
	var loadFlappyFunc = (function() {
		if (typeof this.flappysLoadedNum === "undefined")
			this.flappysLoadedNum = 0;
		this.flappysLoadedNum += 1;
		if (this.flappysLoadedNum === this.imgs.flappy.length) {
			this.flappysLoaded = true;
			
			// Trigger font loading
			loadFlappyFont();
		}
	}).bind(this);
	for (var i = 0; i < 4; i++) {
		this.imgs.flappy[i] = this.loadImage("flappy" + i + ".png", loadFlappyFunc);
	}
	for (var i = 0; i < 4; i++) {
		this.imgs.deadFlappy[i] = this.loadImage("deadFlappy" + i + ".png");
	}
	this.imgs.bg = this.loadImage("background.png");
	this.imgs.bgBlank = this.loadImage("backgroundBlank.png");
	this.imgs.pipe = this.loadImage("pipe.png");
	this.imgs.pipeHead = this.loadImage("pipeHead.png");
	this.imgs.ground = this.loadImage("ground.png");
	this.imgs.tapInfo = this.loadImage("tapInfo.png");
	this.imgs.new = this.loadImage("new.png");
	this.imgs.buttonPlay = this.loadImage("buttonPlay.png");
	this.imgs.buttonPause = this.loadImage("buttonPause.png");
	this.imgs.buttonRestart = this.loadImage("buttonRestart.png");
	this.imgs.buttonLeaderboard = this.loadImage("buttonLeaderboard.png");
	this.imgs.buttonSubmit = this.loadImage("buttonSubmit.png");
	this.imgs.buttonSubmitDisabled = this.loadImage("buttonSubmitDisabled.png");
	this.imgs.buttonRetry = this.loadImage("buttonRetry.png");
	
	// Setup buttons
	var setState = Object.getOwnPropertyDescriptor(Game.prototype, 'state').set;
	var spacing = 20;
	var px = 50, py = 50;
	var f = getPauseButtonOffset;
	this.buttonPlay  = new Button(f, f, this.imgs.buttonPlay , setState.bind(this, STATE_PLAYING));
	this.buttonPause = new Button(f, f, this.imgs.buttonPause, setState.bind(this, STATE_PAUSED));
	var dy = getGameOverButtonsY;
	var getX = (function() {
		var w = spacing + this.imgs.buttonRestart.width + this.imgs.buttonLeaderboard.width;
		var x = this.canvas.width/2 - w/2;
		return x;
	}).bind(this);
	this.buttonRestartDeath = new Button(
		getX, dy,
		this.imgs.buttonRestart,
		setState.bind(this, STATE_START));
	this.buttonLeaderboard = new Button(
		(function() { return getX() + spacing + this.imgs.buttonRestart.width; }).bind(this), dy,
		this.imgs.buttonLeaderboard,
		setState.bind(this, STATE_LEADERBOARD));
	dy = getLeaderboardButtonsY;
	this.buttonRestartLeaderboard = new Button(
		(function() { return this.canvas.width/2 - this.imgs.buttonRestart.width - spacing/2; }).bind(this), dy,
		this.imgs.buttonRestart,
		setState.bind(this, STATE_START));
	
	var submitFunction = (function() {
		var name = this.usernameEntry.value;
		var ret = isValidName(name);
		if (!ret.valid) {
			console.error("'" + name + "' is invalid: " + ret.reason);
			alert(ret.reason);
			return;
		}
		console.log("Submitting best score for '" + name + "': " + this.bestScore);
		this.submitting = true;
		this.submittingStartTime = Date.now().valueOf() / 1000.0;
		this.errorSubmitting = false;
		this.submitted = false;
		this.endTextEntryMode();
		this.leaderboard[this.leaderboardPos].name = name;
		submitBestScore(name, this.bestScore, (function() {
			console.log("Submitted score.");
			this.submitting = false;
			this.submitted = true;
		}).bind(this), (function(error) {
			this.submitting = false;
			this.submitted = false;
			console.log("error submitting score: " + error);
			this.errorSubmitting = true;
		}).bind(this));
	}).bind(this);
	
	var disableFunction = (function() {
		if (!this.newBestScore
			|| this.leaderboardLoading
			|| !isValidName(this.usernameEntry.value).valid
			|| this.submitting || this.submitted)
			return true;
		return false;
	}).bind(this);
	
	this.buttonSubmit = new DisableButton(
		(function() { return this.canvas.width/2 + spacing/2; }).bind(this), dy,
		this.imgs.buttonSubmit, this.imgs.buttonSubmitDisabled, submitFunction, disableFunction);
	
	dy = 400;
	this.buttonRestartLeaderboardError = new Button(
		(function() { return this.canvas.width/2 - this.imgs.buttonRestart.width - spacing/2; }).bind(this), dy,
		this.imgs.buttonRestart,
		setState.bind(this, STATE_START));
	this.buttonRetry = new Button(
		(function() { return this.canvas.width/2 + spacing/2; }).bind(this), dy,
		this.imgs.buttonRetry, setState.bind(this, STATE_LEADERBOARD));

	// Setup pipes
	this.pipes = [];
	for (var i = 0; i < 10; i++) {
		this.pipes[i] = new Pipe(-200);
	}
	
	// Setup handling focus events. see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
	var hidden, visibilityChange; 
	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
		hidden = "hidden";
		visibilityChange = "visibilitychange";
	} else if (typeof document.msHidden !== "undefined") {
		hidden = "msHidden";
		visibilityChange = "msvisibilitychange";
	} else if (typeof document.webkitHidden !== "undefined") {
		hidden = "webkitHidden";
		visibilityChange = "webkitvisibilitychange";
	}
	
	// If the page is hidden, pause the game
	// If the page is hidden, unpause the game, unless it is in the STATE_PAUSED state
	var handleVisibilityChange = (function() {
		if (document[hidden]) {
			console.log("Page hidden: paused.");
			this.pause();
			if (this.state === STATE_PLAYING)
				this.state = STATE_PAUSED;
		} else {
			if (this.state !== STATE_PAUSED) {
				console.log("Page unhidden: resumed.");
				this.unpause();
			}
		}
	}).bind(this);
	
	// Warn if the browser doesn't support addEventListener or the Page Visibility API
	if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
		console.log("Error: Page Visibility API not supported.");
	} else {
		// Handle page visibility change   
		document.addEventListener(visibilityChange, handleVisibilityChange, false);
	}
	
	// Setup stats
	this.stats = document.getElementById("stats");
	
	// Setup vars
	this.debugAllowed = false; // is debugging allowed?
	this.debugView = false;
	this.cameraUpdate = true; // update the camera to be locked onto the bird?
	this.flappyDt = 0.08; // seconds per flappy frame
	this.paused = false;
	this.cameraX = 0;

	this.beginTextEntryMode();
	this.endTextEntryMode();
	
	// Setup state
	this.state = STATE_LOADING;
}

Game.prototype.loadImage = function(name, f) {
	if (typeof f === "undefined")
		f = function() {};
	if (typeof this.imagesLoadedMax === "undefined")
		this.imagesLoadedMax = 0;
	this.imagesLoadedMax += 1;
	
	var img = new Image();
	img.onload = (function() {
		f();
		this.notfiyLoadedImage();
	}).bind(this);
	img.src = document.head.querySelector("meta[name=static]").getAttribute('value') + 'img/' + name;
	return img;
}

Game.prototype.notfiyLoadedImage = function() {
	if (typeof this.imagesLoadedNum === "undefined")
		this.imagesLoadedNum = 0;
	this.imagesLoadedNum += 1;
	
	if (this.imagesLoaded) {
		console.log(this.imagesLoadedNum + " images loaded.");
		this.notifyLoadedResource();
	}
}

Game.prototype.notifyLoadedFont = function() {
	this.notifyLoadedResource();
}

Game.prototype.notifyLoadedResource = function() {
	if (this.imagesLoaded && this.flappyFontLoaded) {
		this.state = STATE_START;
	}
}

Object.defineProperty(Game.prototype, 'imagesLoaded', {
	get: function() { return this.imagesLoadedNum === this.imagesLoadedMax; },
});

Object.defineProperty(Game.prototype, 'flappyCurrent', {
	get: function() {
		if (this.deadFlappyImage)
			return this.imgs.deadFlappy[Math.floor(this.flappyi)];
		else
			return this.imgs.flappy[Math.floor(this.flappyi)];
	},
});

Object.defineProperty(Game.prototype, 'stateChangeDt', {
	get: function() { return (Date.now().valueOf() - this.stateChangeTime) / 1000.0; },
});

Object.defineProperty(Game.prototype, 'state', {
	get: function() { return this.state_; },
	set: function(s) {
		const GRAVITY = -800;
		console.log("STATE CHANGE: " + stateToString(this.state_) + " => " + stateToString(s));
		this.stateChangeTime = Date.now().valueOf();
		var prevState = this.state_;
		this.state_ = s;
		this.endTextEntryMode();
		if (s === STATE_LOADING) {
			this.buttons = [];
			this.bird = new Bird();
			this.paused = true; // no updates
			this.flappyi = 0;
			this.regenPipes = false;
			this.cameraUpdate = false;
			this.flappyVisible = false;
			this.groundVisible = false;

		} else if (s === STATE_START) {
			this.buttons = [];
			this.deadFlappyImage = false;
			this.gravity = 0;
			this.bestScore = getBestScore();
			this.prevTime = NaN; // clear prevTime
			this.score = 0;
			this.paused = false;
			this.bird = new Bird();
			this.flappyi = 0;
			this.oscillate = true;
			this.regenPipes = false;
			this.cameraUpdate = true;
			this.flappyVisible = true;
			this.groundVisible = true;
			for (var i = 0; i < this.pipes.length; i++) {
				this.pipes[i] = new Pipe(-200);
			}
			
		} else if (s === STATE_PLAYING) {
			this.buttons = [this.buttonPause];
			this.deadFlappyImage = false;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.paused = false;
			this.prevTime = NaN; // we could have come from the paused state, we need to update prevTime
			this.cameraUpdate = true;
			this.flappyVisible = true;
			this.groundVisible = true;
			
			if (prevState !== STATE_PAUSED) {
				// regen pipes
				for (var i = 0; i < 10; i++) {
					this.pipes[i].passed = true;
					this.pipes[i].x = -200;
				}
				this.pipeMax = this.bird.posX + Math.max(800, this.canvas.width);
			}
			
		} else if (s === STATE_PAUSED) {
			this.buttons = [this.buttonPlay];
			this.deadFlappyImage = false;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.paused = true;
			this.cameraUpdate = true;
			this.flappyVisible = true;
			this.groundVisible = true;
			
		} else if (s === STATE_DEATH) {
			this.buttons = [this.buttonRestartDeath, this.buttonLeaderboard];
			this.deadFlappyImage = true;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.newBestScore = false;
			this.cameraUpdate = true;
			this.flappyVisible = true;
			this.groundVisible = true;
			if (this.score > this.bestScore) {
				this.bestScore = this.score;
				this.newBestScore = true;
				this.submitted = false;
				this.errorSubmitting = false;
				setBestScore(this.bestScore);
			}
			this.bird.velY = 300;
			this.bird.velX = 0;
			
		} else if (s === STATE_LEADERBOARD) {
			this.buttons = [this.buttonRestartLeaderboard, this.buttonSubmit];
			this.deadFlappyImage = true;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.leaderboard = [];
			this.leaderboardLoading = true;
			this.cameraUpdate = true;
			this.flappyVisible = true;
			this.groundVisible = true;
			
			var successFunction = (function(leaderboard) {
				this.leaderboard = leaderboard;
				this.leaderboardLoading = false;
				console.log("Leaderboard loaded (" + leaderboard.length + " entries)");
				console.log("Leaderboard: " + JSON.stringify(leaderboard));
				if (this.newBestScore) {
					// find if the user fits on the leaderboard
					var pos = -1;
					for (var i = 0; i < NUM_LEADERBOARD_ENTRIES; i++) {
						var e = leaderboard[i];
						if (typeof e === "undefined" || this.bestScore > e.score) {
							pos = i;
							break;
						}
					}
					
					if (pos !== -1) {
						this.leaderboardPos = pos;
						leaderboard.splice(pos, 0, {user: true, name: "", score: this.bestScore});
						this.beginTextEntryMode(MAX_NAME_LENGTH, isValidNameChar);
					}
				}
			}).bind(this);
			var errorFunction = (function(err) {
				console.log("Error loading leaderboard: " + err);
				this.state = STATE_LEADERBOARD_ERROR;
			}).bind(this);
			
			getLeaderboard(successFunction, errorFunction);
		} else if (this.state === STATE_LEADERBOARD_ERROR) {
			this.buttons = [this.buttonRestartLeaderboardError, this.buttonRetry];
			this.deadFlappyImage = true;
			this.gravity = GRAVITY;
			this.oscillate = false;
			this.regenPipes = true;
			this.cameraUpdate = true;
			this.flappyVisible = true;
			this.groundVisible = true;
			
		} else {
			console.log("Error: Invalid state: " + s);
			this.state = STATE_START;
		}
	},
});

Game.prototype.mainLoop = function() {
	window.requestAnimationFrame(this.mainLoop.bind(this));
	// process key presses
	this.processKeys();
	
	// update
	this.update();
	
	// draw
	this.draw();
	
	// reset keys pressed since last frame
	this.keyUps = [];
	this.keyDowns = [];
};

Game.prototype.beginTextEntryMode = function(maxLength, isLegalChar) {
	this.usernameEntry.value = "";
	if (typeof maxLength === "undefined")
		maxLength = 32;
	if (typeof isLegalChar === "undefined")
		isLegalChar = function(c) { return true; };
	
	this.usernameEntry.onkeypress = (function(e) {
		var s = String.fromCharCode(e.charCode);
		for (var i = 0; i < s.length; i++)
			if (!isLegalChar(s[i])) {
				e.preventDefault();
				break;
			}
	}).bind(this);
	
	this.usernameEntry.maxLength = maxLength;
	this.usernameEntry.style.visibility = "visible";
	this.usernameEntry.focus();
}

Game.prototype.endTextEntryMode = function() {
	this.usernameEntry.style.visibility = "hidden";
}

Game.prototype.processKeys = function() {
	for (var i = 0; i < this.keyDowns.length; i++) {
		var e = this.keyDowns[i];
		var which = e.which;
		var key = e.key; // key is 'w', 'W', '!', etc.
		var code = e.code; // code is 'Escape', 'KeyW', 'Digit1', etc.
		
		if (which === WHICH_CODE_SPACE) {
			this.flap();
		}
		if (code === "Escape" && (this.debugAllowed || this.state === STATE_PLAYING || this.state === STATE_PAUSED)) {
			this.togglePause();
		}
		if (code === "Digit1" && this.debugAllowed) {
			this.debugView = !this.debugView;
		}
		if (code === "Digit2" && this.debugAllowed) {
			this.cameraUpdate = !this.cameraUpdate;
		}
		
		console.log("Key pressed: " + which + " '" + key + "' (" + code + ")");
	}
}

Game.prototype.pause = function() {
	if (this.state === STATE_PLAYING) {
		this.state = STATE_PAUSED;
	} else {
		this.paused = true;
	}
}

Game.prototype.unpause = function() {
	if (this.state === STATE_PAUSED) {
		this.state = STATE_PLAYING;
	} else {
		this.paused = false;
		this.prevTime = NaN;
	}
}

Game.prototype.togglePause = function() {
	if (this.state === STATE_PLAYING) {
		this.state = STATE_PAUSED;
	} else if (this.state === STATE_PAUSED) {
		this.state = STATE_PLAYING;
	} else {
		this.paused = !this.paused;
		if (!this.paused)
			this.prevTime = NaN;
	}
}

Game.prototype.press = function(x, y) {
	var bs = this.buttons;
	var headerHeight = document.getElementById("header").clientHeight;
	for (var i = 0; i < bs.length; i++) {
		bs[i].handleClick(x, y - headerHeight);
	}
}

Game.prototype.onmousedown = function(e) {
	e.preventDefault();
	
	console.log("mouse pressed @ " + e.offsetX + ", " + e.offsetY);
	this.flap();
	this.press(e.offsetX, e.offsetY);
}

Game.prototype.onmouseup = function(e) {
	
}

Game.prototype.ontouchstart = function(e) {
	e.preventDefault();
	
	this.flap();
	var touches = e.changedTouches;
	for (var i = 0; i < touches.length; i++) {
		var t = touches[i];
		console.log("touch @ " + t.clientX + ", " + t.clientY);
		this.press(t.clientX, t.clientY);
	}
}

Game.prototype.ontouchend = function(e) {
	
}

Game.prototype.ontouchcancel = function(e) {
	
}

Game.prototype.ontouchmove = function(e) {
	
}

Game.prototype.update = function() {
	if (this.paused)
		return;
	
	// calculate timings
	var now = Date.now().valueOf();
	if (isNaN(this.prevTime)) {
		this.prevTime = now;
	}
	var dt = (now - this.prevTime) / 1000.0;
	this.prevTime = now;
	
	// update flappy frame #
	if (this.state === STATE_START || this.state === STATE_PLAYING)
		this.flappyi = (this.flappyi + (dt / this.flappyDt)) % this.imgs.flappy.length;
	
	// update bird
	this.updateFlappy(dt);
	
	// check pipes. regen if not valid. add to score if passed.
	if (this.regenPipes) {
		for (var i = 0; i < this.pipes.length; i++) {
			var pipe = this.pipes[i];
			if (!pipe.passed && pipe.x + this.imgs.pipeHead.width / 2 < this.bird.posX) {
				// score pipe
				this.score += 1;
				pipe.passed = true;
			}
			if (pipe.x + this.imgs.pipeHead.width < this.cameraX) {
				// not valid pipe, reuse.
				pipe.reuse(this.pipeMax);
				this.pipeMax += PIPE_SPACING_X;
			}
		}
	}
}

Game.prototype.flap = function() {
	if (this.state === STATE_START || this.state === STATE_PLAYING)
		this.bird.velY = MAX_VEL_Y;
	
	if (this.state === STATE_START)
		this.state = STATE_PLAYING;
}

Game.prototype.updateFlappy = function(dt) {
	var bird = this.bird;
	
	bird.velY += dt * this.gravity;

	if (this.oscillate) {
		// oscillate around a point if in start mode
		bird.t += dt;
		bird.t %= Math.PI * 2;
		bird.velY = Math.cos(bird.t * 4) * 70;
	}
	// if on the ground
	var h = this.imgs.ground.height + this.flappyCurrent.height / 2;
	if (bird.posY <= h && bird.velY < 0) {
		bird.velY = 0;
	}
	if (bird.posY <= h) {
		bird.posY = h;
		if (this.state === STATE_PLAYING)
			this.state = STATE_DEATH;
	}
	// if at the top of the screen
	var ch = this.canvas.height;
	var t = this.flappyCurrent.height / 2;
	if (bird.posY + t > ch) {
		bird.posY = ch - t;
		bird.velY = 0;
	}
	
	// update positions using velocity
	bird.posX += dt * bird.velX;
	bird.posY += dt * bird.velY;
	
	// bird angle logic
	bird.ang = calculateAngle(bird.velX, bird.velY);
	bird.ang = (bird.ang - bird.prevAng) * Math.min(1, 15 * dt) + bird.prevAng; // lerp
	bird.prevAng = bird.ang;
	
	if (this.state === STATE_START || this.state === STATE_PLAYING) {
		// check for collisions with pipes. if a collision is found, kill the bird
		var bb = bird.getBB(this.flappyCurrent.width, this.flappyCurrent.height);
		for (var i = 0; i < this.pipes.length; i++) {
			var pipe = this.pipes[i];
			
			// if pipe is nearby, collision check
			var bmax = bb.x + bb.w/2, bmin = bb.x - bb.w/2;
			var pmax = pipe.x + this.imgs.pipeHead.width, pmin = pipe.x;
			if (bmin > pmax || bmax < pmin)
				continue; // skip since pipe is not nearby
			
			var ru = pipe.bbUpper(this.imgs.pipeHead.width);
			var rl = pipe.bbLower(this.imgs.pipeHead.width);
			
			var intersected = false;
			if (bb.intersects(ru)) {
				console.log("bird intersects with pipe " + i + " (UPPER)");
				intersected = true;
			} else if (bb.intersects(rl)) {
				console.log("bird intersects with pipe " + i + " (LOWER)");
				intersected = true;
			}
			if (intersected) {
				this.state = STATE_DEATH;
			}
		}
	}
}

Game.prototype.draw = function() {
	// resize canvas width
	var targetWidth = window.innerWidth;
	if (targetWidth < MIN_CANVAS_WIDTH)
		this.canvas.width = MIN_CANVAS_WIDTH;
	else if (targetWidth > MAX_CANVAS_WIDTH)
		this.canvas.width = MAX_CANVAS_WIDTH;
	else
		this.canvas.width = targetWidth;
	
	// resize canvas height
	var targetHeight = document.getElementById("game-container").clientHeight;
	if (targetHeight < MIN_CANVAS_HEIGHT)
		this.canvas.height = MIN_CANVAS_HEIGHT;
	else if (targetHeight > MAX_CANVAS_HEIGHT)
		this.canvas.height = MAX_CANVAS_HEIGHT;
	else
		this.canvas.height = targetHeight;

	// get context
	var c = this.canvas.getContext("2d");
	// clear canvas - don't technically need this, but it's nice
	c.clearRect(0, 0, this.canvas.width, this.canvas.height);
	// we want that pixel-y feel!
	c.imageSmoothingEnabled = false;
	
	// the camera is always at the bird pos.
	if (this.cameraUpdate)
		this.cameraX = this.bird.posX - 60 - this.canvas.width / 20.0;
	
	// if debugging is off, hide the stats panel
	if (this.debugView) {
		this.drawStats();
	} else {
		this.stats.style.visibility = "hidden";
	}
	
	if (this.groundVisible) {
		// draw blank background first
		drawImageTiled(c, this.imgs.bgBlank);
		// draw textured background
		var offsetBg = -this.imgs.bg.width - ((this.cameraX / 2) % this.imgs.bg.width);
		drawImageTiled(c, this.imgs.bg, offsetBg, c.canvas.height - this.imgs.bg.height, undefined, 1);

		// draw pipes
		for (var i = 0; i < this.pipes.length; i++) {
			this.drawPipe(c, this.pipes[i]);
		}

		// draw ground
		var offsetGround = -this.imgs.ground.width - (this.cameraX % this.imgs.ground.width);
		drawImageTiled(c, this.imgs.ground, offsetGround, c.canvas.height - this.imgs.ground.height, undefined, 1);
	}

	// draw flappy bird
	if (this.flappyVisible)
		this.drawFlappy(c);

	// draw score
	this.drawUI(c);
};

Game.prototype.drawUI = function(c) {
	// draw loading screen
	if (this.state === STATE_LOADING)
		this.drawLoadingUI(c);
	
	// draw start screen
	if (this.state === STATE_START)
		this.drawStartUI(c);
	
	// draw score
	if (this.state === STATE_PLAYING || this.state === STATE_PAUSED)
		this.drawPlayingUI(c);
	
	// draw death screen
	if (this.state === STATE_DEATH)
		this.drawDeathUI(c);
	
	// draw leaderboard screen
	if (this.state === STATE_LEADERBOARD)
		this.drawLeaderboardUI(c);
	
	if (this.state === STATE_LEADERBOARD_ERROR)
		this.drawLeaderboardErrorUI(c);
	
	// draw buttons
	var bs = this.buttons;
	for (var i = 0; i < bs.length; i++) {
		var btn = bs[i];
		btn.draw(c);
	}
}

Game.prototype.drawLoadingUI = function(c) {
	var x = c.canvas.width/2;
	var y = c.canvas.height/2;
	if (this.flappysLoaded)
		this.drawLoadingAnimation(c, this.stateChangeDt, x, y, false);
}

Game.prototype.drawPlayingUI = function(c) {
	c.textAlign = "left";
	c.textBaseline = "top";
	c.font = "30px FlappyFont";
	drawFlappyText(c, this.score, getScoreOffsetX(), getScoreOffsetY(), "white", 2);
}

Game.prototype.drawStartUI = function(c) {
	drawImage(c, this.imgs.tapInfo,
		getTapInfoOffsetX() + this.bird.posX - this.cameraX,
		//200 + this.canvas.width / 20.0 - this.imgs.tapInfo.width/2,
		(c.canvas.height - getBirdStartY()) - this.imgs.tapInfo.height/2);
	
	c.textAlign = "center";
	c.textBaseline = "top";
	c.font = "60px FlappyFont";
	var x = Math.floor(c.canvas.width / 2);
	var col = "gold";//"#30e830";
	drawFlappyText(c, "Flappy", x, getTitleStartY(), col);
	drawFlappyText(c, "Clone", x, getTitleStartY()+60+20, col);
}

Game.prototype.drawDeathUI = function(c) {
	c.textAlign = "center";
	c.textBaseline = "top";
	c.font = "60px FlappyFont";
	var titleCol = "gold";
	if (!isGameOverMultiline()) {
		drawFlappyText(c, "Game Over", Math.floor(c.canvas.width / 2), getGameOverY(), titleCol);
	} else {
		drawFlappyText(c, "Game", Math.floor(c.canvas.width / 2), getGameOverY(), titleCol);
		drawFlappyText(c, "Over", Math.floor(c.canvas.width / 2), getGameOverY2(), titleCol);
	}
	
	c.font = "30px FlappyFont";
	var diff = 70;
	var l = Math.floor(c.canvas.width/2 - diff);
	var r = Math.floor(c.canvas.width/2 + diff);
	var t = getGameOverTop();
	var b = getGameOverBottom();
	var outline = 3;
	drawFlappyText(c, "Score", l, t, "white", outline);
	drawFlappyText(c, "Best" , r, t, "white", outline);
	drawFlappyText(c, this.score    , l, b, "white", outline);
	drawFlappyText(c, this.bestScore, r, b, "white", outline);

	if (this.newBestScore)
		drawImage(c, this.imgs.new, r + 27, t - 10);
}

Game.prototype.drawLeaderboardUI = function(c) {
	this.drawLeaderboardHeader(c);
	if (this.leaderboardLoading) {
		var x = c.canvas.width/2;
		var y = c.canvas.height/2;
		this.drawLoadingAnimation(c, this.stateChangeDt, x, y, true);
	} else {
		this.drawLeaderboard(c);
	}
}

Game.prototype.drawLeaderboardErrorUI = function(c) {	
	var img = this.imgs.deadFlappy[2];
	var offsetX = -img.width/2;
	var offsetY = -img.height/2;
	var x = c.canvas.width/2;
	var y = 345;
	
	c.translate(x, y);
	c.rotate(Math.PI);
	drawImage(c, img, offsetX, offsetY);
	c.rotate(-Math.PI);
	c.translate(-x, -y);
	
	c.textAlign = "center";
	c.textBaseline = "top";
	c.font = "60px FlappyFont";
	drawFlappyText(c, "Error", x, 110, "red");
	var spacing = 50, startY = 210;
	c.font = "30px FlappyFont";
	drawFlappyText(c, "The leaderboard could", x, startY, "white", 3)
	drawFlappyText(c, "not be loaded.", x, startY + spacing, "white", 3)
}

Game.prototype.drawLeaderboardHeader = function(c) {
	c.textAlign = "center";
	c.textBaseline = "top";
	c.font = getLeaderboardHeaderFontSize() + "px FlappyFont";
	var titleCol = "gold";
	drawFlappyText(c, "Leaderboard", Math.floor(c.canvas.width / 2), getLeaderboardHeaderY(), titleCol, getLeaderboardHeaderFontOutline());
}

Game.prototype.drawLeaderboard = function(c) {
	c.textBaseline = "top";
	c.font = getLeaderboardFontSize() + "px FlappyFont";
	
	var totalW = Math.min(c.canvas.width, MAX_LEADERBOARD_WIDTH);
	
	var left = c.canvas.width/2 - totalW/2;
	var right = c.canvas.width - left;
	var outline = getLeaderboardFontOutline();
	var scoreW = c.measureText("SCORE").width;
	
	var numX = left + getLeaderboardLeftOffset();
	var spacing = 8;
	var x = right - getLeaderboardRightOffset();
	var y = getLeaderboardY();
	var titleCol = "gold";

	c.textAlign = "right";
	drawFlappyText(c, "NAME", x - spacing, y, titleCol, outline);
	drawFlappyText(c, "#", numX, y, titleCol, outline);
	c.textAlign = "left";
	drawFlappyText(c, "SCORE", x + spacing, y, titleCol, outline);
	var scoreX = x + spacing + scoreW/2;
	
	for (var i = 0; i < NUM_LEADERBOARD_ENTRIES; i++) {
		var e = this.leaderboard[i];
		if (typeof e === "undefined")
			break;
		
		var col = "white";
		var hide = hide = Math.floor((5 * this.stateChangeDt) % 3) === 0;
		if (e.user && this.errorSubmitting) {
			col = "red";
		} else if (e.user) {
			col = "gold";
		}
		
		y += getLeaderboardEntrySpacing();
		c.textAlign = "right";
		var space = x - 2*spacing - numX;
		if (this.submitting && e.user) {
			var now = Date.now().valueOf() / 1000.0;
			var dt = now - this.submittingStartTime;
			var dots = Math.floor(((2 * dt) % 3) + 1);
			var text = ".".repeat(dots);
			
			drawFlappyText(c, text, x - spacing, y, col, outline);
		} else if (this.errorSubmitting && e.user) {
			drawFlappyText(c, "ERROR", x - spacing, y, col, outline);
		} else if (e.user && !this.submitted) {
			if (this.usernameEntry.style.visibility === "visible") {
				this.usernameEntry.style.fontSize = getLeaderboardFontSize() + "px";
				this.usernameEntry.style.width = space + "px";
				this.usernameEntry.style.left = (x - spacing - space) + "px";
				this.usernameEntry.style.right = (x - spacing) + "px";
				this.usernameEntry.style.top = (y - 4) + "px";
			}
		} else {
			drawFlappyText(c, e.name, x - spacing, y, col, outline, space, false);
		}
		drawFlappyText(c, (i + 1) + ".", numX, y, col, outline);
		c.textAlign = "center";
		drawFlappyText(c, e.score, scoreX, y, col, outline);
	}
}

Game.prototype.drawLoadingAnimation = function(c, dt, x, y, drawText) {
	var ang = (5 * dt) % (2 * Math.PI);
	var i = (15 * dt) % this.imgs.flappy.length;
	var dots = Math.floor(((2 * dt) % 3) + 1);
	var img = this.imgs.flappy[Math.floor(i)];
	
	if (drawText) {
		var text = ".".repeat(dots);

		c.textAlign = "middle";
		c.textBaseline = "bottom";
		c.font = "30px FlappyFont";
		drawFlappyText(c, text, x, y + 8, "white", 2);
	}
	
	var radius = -35;
	var offsetX = -img.width/2;
	var offsetY = -img.height/2;
	
	c.translate(x, y);
	c.rotate(ang);
	c.translate(0, radius);
	drawImage(c, img, offsetX, offsetY);
	c.translate(0, -radius);
	c.rotate(-ang);
	c.translate(-x, -y);
}

Game.prototype.drawStats = function() {
	this.stats.style.visibility = "visible";
	
	var html = "";
	html += "Score: " + this.score + "<br>";
	html += "Paused: " + this.paused + "<br>";
	html += "State: " + stateToString(this.state) + "<br>";
	html += "PosX: " + this.bird.posX.toFixed(2) + "<br>";
	html += "PosY: " + this.bird.posY.toFixed(2) + "<br>";
	html += "VelX: " + this.bird.velX.toFixed(2) + "<br>";
	html += "VelY: " + this.bird.velY.toFixed(2) + "<br>";
	html += "Gravity: " + this.gravity;
	
	this.stats.innerHTML = html;
}

Game.prototype.drawFlappy = function(c) {
	// draw flappy bird
	var x = this.bird.posX - this.cameraX;
	var y = c.canvas.height - this.bird.posY;
	var ang = this.bird.ang;
	
	if (this.debugView) {
		// Draw velocity vector
		c.beginPath();
		c.moveTo(x, y);
		c.lineTo(x + this.bird.velX, y - this.bird.velY);
		c.strokeStyle = "black";
		c.stroke();
		
		// draw path
		if (this.state !== STATE_START) {
			c.beginPath();
			c.moveTo(x, y);
			var stepSize = 10;
			for (var i = 0; i < 300; i += stepSize) { // predict path 200 pixels in front
				var t = i / this.bird.velX;
				// s = ut + (1/2)at^2
				var s = this.bird.velY*t + 0.5*this.gravity*t*t;
				c.lineTo(x + i, y - s);
			}
			c.strokeStyle = "red";
			c.stroke();
		}
	}
	
	// center x & y
	var img = this.flappyCurrent;
	var offsetX = -img.width / 2;
	var offsetY = -img.height / 2;
	
	c.translate(x, y);
	c.rotate(ang);
	c.translate(offsetX, offsetY);
	drawImage(c, img, 0, 0);
	c.translate(-offsetX, -offsetY);
	c.rotate(-ang); // faster than c.save(); c.restore();
	c.translate(-x, -y);
	if (this.debugView) {
		var r = this.bird.getBB(this.flappyCurrent.width, this.flappyCurrent.height, c.canvas.height);
		r.x -= this.cameraX;
		c.strokeStyle = "green";
		r.draw(c);
	}
}

Game.prototype.drawPipe = function(c, pipe) {
	var x = pipe.x - this.cameraX;
	var ly = c.canvas.height - pipe.y;
	var uy = ly - pipe.spacing;
	
	// draw upper pipe
	c.scale(1, -1);
	drawImageTiled(c, this.imgs.pipe, x, -uy, 1, undefined);
	drawImage(c, this.imgs.pipeHead, x, -uy);
	c.scale(1, -1);
	
	// draw lower pipe
	drawImageTiled(c, this.imgs.pipe, x, ly, 1, undefined);
	drawImage(c, this.imgs.pipeHead, x, ly);
	
	if (this.debugView) {
		var ru = pipe.bbUpper(this.imgs.pipeHead.width);
		ru.x -= this.cameraX;
		var rl = pipe.bbLower(this.imgs.pipeHead.width);
		rl.x -= this.cameraX; 
		c.strokeStyle = "blue";
		ru.draw(c);
		rl.draw(c);
		
		c.beginPath();
		c.rect(x+this.imgs.pipeHead.width/4*1.5,uy,this.imgs.pipeHead.width/4,pipe.spacing);
		c.strokeStyle = "gold";
		c.stroke();
	}
}
