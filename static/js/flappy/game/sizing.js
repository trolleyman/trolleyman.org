
const MIN_CANVAS_WIDTH = 320;
const MAX_CANVAS_WIDTH = 10000;
const MAX_CANVAS_WIDTH_SIZING = 1440;
const MIN_CANVAS_HEIGHT = 480;
const MAX_CANVAS_HEIGHT = 915;

const MAX_LEADERBOARD_WIDTH = 700;

function getCanvasHeight() {
	return document.getElementById("canvas").height;
}
function getCanvasWidth() {
	return document.getElementById("canvas").width;
}

function getHeightRatio() {
	return (getCanvasHeight() - MIN_CANVAS_HEIGHT) / (MAX_CANVAS_HEIGHT - MIN_CANVAS_HEIGHT);
}

function getWidthRatio() {
	return (getCanvasWidth() - MIN_CANVAS_WIDTH) / (MAX_CANVAS_WIDTH_SIZING - MIN_CANVAS_WIDTH);
}

function getAverageRatio() {
	return (getWidthRatio() + getHeightRatio()) / 2;
}

function lerp(min, max, f) {
	return (max - min) * f + min;
}
function lerpFloor(min, max, f) {
	return Math.floor(lerp(min, max, f));
}

function getPipeSpacing() {
	return 150;
}

function getPipeY() {
	var rand = Math.random();
	var min = rand * 150 + 120;
	var max = rand * 300 + 200;
	
	return lerp(min, max, getHeightRatio());
}

function getBirdStartY() {
	return lerp(170, 350, getHeightRatio());
}

function getTapInfoOffsetX() {
	return lerpFloor(80, 120, getWidthRatio());
}

function getTitleStartY() {
	return lerpFloor(60, 150, getHeightRatio());
}

function getPauseButtonOffset() {
	return lerpFloor(20, 50, getAverageRatio());
}

function getScoreOffsetX() {
	return getPauseButtonOffset() + 45;
}

function getScoreOffsetY() {
	return getPauseButtonOffset();
}

function isGameOverMultiline() {
	return getCanvasWidth() < 350;
}

function getGameOverY() {
	return lerpFloor(50, 200, getHeightRatio());
}

function getGameOverY2() {
	return getGameOverY() + 60 + 20;
}

function getGameOverTop() {
	return lerpFloor(240, 290, getHeightRatio());
}
function getGameOverBottom() {
	return getGameOverTop() + 50;
}
function getGameOverButtonsY() {
	return lerpFloor(365, 400, getHeightRatio());
}

const LEADERBOARD_THRESHOLD_WIDTH = 410;
const LEADERBOARD_THRESHOLD_HEIGHT = 650;
function leaderboardHelper(min, max) {
	if (getCanvasWidth() >= LEADERBOARD_THRESHOLD_WIDTH
			&& getCanvasHeight() >= LEADERBOARD_THRESHOLD_HEIGHT) {
		return max;
	} else {
		return min;
	}
}
function getLeaderboardHeaderFontSize() {
	return leaderboardHelper(45, 60);
}
function getLeaderboardFontSize() {
	return leaderboardHelper(20, 30);
}
function getLeaderboardHeaderFontOutline() {
	return leaderboardHelper(4, 5);
}
function getLeaderboardFontOutline() {
	return leaderboardHelper(2, 3);
}
function getLeaderboardHeaderY() {
	return lerpFloor(20, 110, getHeightRatio());
}
function getLeaderboardButtonsY() {
	var y = getLeaderboardHeaderY();
	return y + leaderboardHelper(420, 540);
}
function getLeaderboardY() {
	return getLeaderboardHeaderY()
		+ getLeaderboardHeaderFontSize()
		+ getLeaderboardHeaderFontOutline() * 2
		+ 10;
}
function getLeaderboardLeftOffset() {
	return leaderboardHelper(40, 60);
}
function getLeaderboardRightOffset() {
	return leaderboardHelper(80, 130);
}
function getLeaderboardEntrySpacing() {
	return leaderboardHelper(30, 40);
}