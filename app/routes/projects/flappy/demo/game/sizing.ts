
export const MIN_CANVAS_WIDTH = 320;
export const MAX_CANVAS_WIDTH = 10000;
export const MAX_CANVAS_WIDTH_SIZING = 1440;
export const MIN_CANVAS_HEIGHT = 480;
export const MAX_CANVAS_HEIGHT = 915;

export const MAX_LEADERBOARD_WIDTH = 700;

export function getCanvasHeight(): number {
	const canvas = document.getElementById("canvas") as HTMLCanvasElement;
	return canvas.height;
}

export function getCanvasWidth(): number {
	const canvas = document.getElementById("canvas") as HTMLCanvasElement;
	return canvas.width;
}

export function getHeightRatio(): number {
	return (getCanvasHeight() - MIN_CANVAS_HEIGHT) / (MAX_CANVAS_HEIGHT - MIN_CANVAS_HEIGHT);
}

export function getWidthRatio(): number {
	return (getCanvasWidth() - MIN_CANVAS_WIDTH) / (MAX_CANVAS_WIDTH_SIZING - MIN_CANVAS_WIDTH);
}

export function getAverageRatio(): number {
	return (getWidthRatio() + getHeightRatio()) / 2;
}

export function lerp(min: number, max: number, f: number): number {
	return (max - min) * f + min;
}

export function lerpFloor(min: number, max: number, f: number): number {
	return Math.floor(lerp(min, max, f));
}

export function getPipeSpacing(): number {
	return 150;
}

export function getPipeY(): number {
	const rand = Math.random();
	const min = rand * 150 + 120;
	const max = rand * 300 + 200;
	
	return lerp(min, max, getHeightRatio());
}

export function getBirdStartY(): number {
	return lerp(170, 350, getHeightRatio());
}

export function getTapInfoOffsetX(): number {
	return lerpFloor(80, 120, getWidthRatio());
}

export function getTitleStartY(): number {
	return lerpFloor(60, 150, getHeightRatio());
}

export function getPauseButtonOffset(): number {
	return lerpFloor(20, 50, getAverageRatio());
}

export function getScoreOffsetX(): number {
	return getPauseButtonOffset() + 45;
}

export function getScoreOffsetY(): number {
	return getPauseButtonOffset();
}

export function isGameOverMultiline(): boolean {
	return getCanvasWidth() < 350;
}

export function getGameOverY(): number {
	return lerpFloor(50, 200, getHeightRatio());
}

export function getGameOverY2(): number {
	return getGameOverY() + 60 + 20;
}

export function getGameOverTop(): number {
	return lerpFloor(240, 290, getHeightRatio());
}

export function getGameOverBottom(): number {
	return getGameOverTop() + 50;
}

export function getGameOverButtonsY(): number {
	return lerpFloor(365, 400, getHeightRatio());
}

const LEADERBOARD_THRESHOLD_WIDTH = 410;
const LEADERBOARD_THRESHOLD_HEIGHT = 650;

function leaderboardHelper(min: number, max: number): number {
	if (getCanvasWidth() >= LEADERBOARD_THRESHOLD_WIDTH
			&& getCanvasHeight() >= LEADERBOARD_THRESHOLD_HEIGHT) {
		return max;
	} else {
		return min;
	}
}

export function getLeaderboardHeaderFontSize(): number {
	return leaderboardHelper(45, 60);
}

export function getLeaderboardFontSize(): number {
	return leaderboardHelper(20, 30);
}

export function getLeaderboardHeaderFontOutline(): number {
	return leaderboardHelper(4, 5);
}

export function getLeaderboardFontOutline(): number {
	return leaderboardHelper(2, 3);
}

export function getLeaderboardHeaderY(): number {
	return lerpFloor(20, 110, getHeightRatio());
}

export function getLeaderboardButtonsY(): number {
	const y = getLeaderboardHeaderY();
	return y + leaderboardHelper(420, 540);
}

export function getLeaderboardY(): number {
	return getLeaderboardHeaderY()
		+ getLeaderboardHeaderFontSize()
		+ getLeaderboardHeaderFontOutline() * 2
		+ 10;
}

export function getLeaderboardLeftOffset(): number {
	return leaderboardHelper(40, 60);
}

export function getLeaderboardRightOffset(): number {
	return leaderboardHelper(80, 130);
}

export function getLeaderboardEntrySpacing(): number {
	return leaderboardHelper(30, 40);
}