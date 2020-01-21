const NUM_LEADERBOARD_ENTRIES = 10;
const BEST_SCORE_COOKIE_NAME = "BEST_SCORE";

const LEADERBOARD_API_PATH = "/flappy/api/leaderboard";
const SUBMIT_API_PATH = "/flappy/api/submit";

function setBestScore(score) {
	setCookie(BEST_SCORE_COOKIE_NAME, score, 365);
	console.log("Best score set: " + score);
}

function getBestScore() {
	var bestScore = parseInt(getCookie(BEST_SCORE_COOKIE_NAME));
	if (isNaN(bestScore)) {
		bestScore = 0;
		setBestScore(0);
	}
	return bestScore;
}

// Takes a callback that is triggered when the leaderboard has been loaded.
function getLeaderboard(successCallback, errorCallback) {
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status === 200) {
				var text = this.responseText;
				var leaderboard = null;
				try {
					leaderboard = JSON.parse(text);
				} catch (e) {
					errorCallback("Invalid JSON response: " + text);
				}
				successCallback(leaderboard);
			} else {
				errorCallback(this.statusText + ": " + this.responseText);
			}
		}
	};
	req.open("GET", LEADERBOARD_API_PATH, true);
	req.send();
}

// Takes a callback that is triggered when the score has been submitted.
function submitBestScore(name, score, successCallback, errorCallback) {
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (this.readyState == 4) {
			if (this.status === 200) {
				successCallback();
			} else {
				var e = "" + this.status;
				if (this.statusText)
					e += " " + this.statusText;
				e += ": ";
				errorCallback(e + this.responseText);
			}
		}
	};
	var params = "name=" + encodeURIComponent(name) + "&score=" + encodeURIComponent(score);
	req.open("POST", SUBMIT_API_PATH, true);
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.send(params);
}
