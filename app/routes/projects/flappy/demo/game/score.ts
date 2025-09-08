import { setCookie, getCookie } from './cookie';

export const NUM_LEADERBOARD_ENTRIES = 10;
export const BEST_SCORE_COOKIE_NAME = "BEST_SCORE";

const LEADERBOARD_API_PATH = "/flappy/api/leaderboard";
const SUBMIT_API_PATH = "/flappy/api/submit";

export interface LeaderboardEntry {
	user?: boolean;
	name: string;
	score: number;
}

export function setBestScore(score: number): void {
	setCookie(BEST_SCORE_COOKIE_NAME, score.toString(), 365);
	console.log("Best score set: " + score);
}

export function getBestScore(): number {
	const bestScore = parseInt(getCookie(BEST_SCORE_COOKIE_NAME));
	if (isNaN(bestScore)) {
		setBestScore(0);
		return 0;
	}
	return bestScore;
}

// Takes a callback that is triggered when the leaderboard has been loaded.
export function getLeaderboard(successCallback: (leaderboard: LeaderboardEntry[]) => void, errorCallback: (error: string) => void): void {
	const req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (this.readyState === 4) {
			if (this.status === 200) {
				const text = this.responseText;
				let leaderboard: LeaderboardEntry[] | null = null;
				try {
					leaderboard = JSON.parse(text);
				} catch (e) {
					errorCallback("Invalid JSON response: " + text);
					return;
				}
				successCallback(leaderboard as LeaderboardEntry[]);
			} else {
				errorCallback(this.statusText + ": " + this.responseText);
			}
		}
	};
	req.open("GET", LEADERBOARD_API_PATH, true);
	req.send();
}

// Takes a callback that is triggered when the score has been submitted.
export function submitBestScore(name: string, score: number, successCallback: () => void, errorCallback: (error: string) => void): void {
	const req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (this.readyState === 4) {
			if (this.status === 200) {
				successCallback();
			} else {
				let e = "" + this.status;
				if (this.statusText)
					e += " " + this.statusText;
				e += ": ";
				errorCallback(e + this.responseText);
			}
		}
	};
	const params = "name=" + encodeURIComponent(name) + "&score=" + encodeURIComponent(score);
	req.open("POST", SUBMIT_API_PATH, true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.send(params);
}
