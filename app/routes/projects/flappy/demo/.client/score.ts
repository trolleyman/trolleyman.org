import { setCookie, getCookie } from './cookie';

export const NUM_LEADERBOARD_ENTRIES = 10;
export const BEST_SCORE_COOKIE_NAME = "BEST_SCORE";

const LEADERBOARD_API_PATH = "api/leaderboard";
const SUBMIT_API_PATH = "api/submit";

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

// Returns a Promise that resolves with the leaderboard data
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
	try {
		const response = await fetch(LEADERBOARD_API_PATH);

		if (!response.ok) {
			throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
		}

		const text = await response.text();
		let leaderboard: LeaderboardEntry[] | null = null;

		try {
			leaderboard = JSON.parse(text);
		} catch (e) {
			throw new Error("Invalid JSON response: " + text);
		}

		return leaderboard as LeaderboardEntry[];
	} catch (error) {
		throw error;
	}
}

// Returns a Promise that resolves when the score has been submitted successfully
export async function submitBestScore(name: string, score: number): Promise<void> {
	try {
		const params = new URLSearchParams({
			name: name,
			score: score.toString()
		});

		const response = await fetch(SUBMIT_API_PATH, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: params
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
		}
	} catch (error) {
		throw error;
	}
}
