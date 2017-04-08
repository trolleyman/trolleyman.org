
const BEST_SCORE_COOKIE_NAME = "v0.1_BEST_SCORE";

const LEADERBOARD_API_PATH = "api/leaderboard";
const SUBMIT_API_PATH = "api/submit";

// NB: If these constants are updated, remember to update the Django versions (in api/views.py)!
const MAX_NAME_LENGTH = 16;
const NUM_LEADERBOARD_ENTRIES = 10;
const LEGAL_SYMBOLS = "-_";

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

// NB: If updating these functions, ensure that the Django functions are also updated (in api/views.py)!
function isLegalName(name) {
	var legal = true;
	var reason = "";
	if (typeof name !== "string") {
		legal = false;
		reason = "Please enter a username.";
	} else if (name === "") {
		legal = false;
		reason = "Please enter a username.";
	} else if (name.length > MAX_NAME_LENGTH) {
		legal = false;
		reason = "The username entered is too long.";
	} else {
		for (var i = 0; i < name.length; i++)
			if (!isLegalNameChar(name[i])) {
				legal = false;
				reason = "The username contains the illegal character '" + name[i] + "'."
				break;
			}
	}
	return {legal: legal, reason: reason};
}

// NB: If updating these functions, ensure that the Django functions are also updated (in api/views.py)!
function isLegalNameChar(ch) {
	var cd = function(s) { return s.charCodeAt(0); };
	var c = ch.charCodeAt(0);
	if (c >= cd('a') && c <= cd('z')) {
		// lowercase chars
		return true;
	} else if (c >= cd('A') && c <= cd('Z')) {
		// uppercase chars
		return true;
	} else if (c >= cd('1') && c <= cd('9')) {
		// digits
		return true;
	} else if (LEGAL_SYMBOLS.indexOf(ch) !== -1) {
		// symbols
		return true;
	}
	return false;
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