const NUM_LEADERBOARD_ENTRIES = 10;

const LEADERBOARD_API_PATH = "api/leaderboard";
const USER_PROFILE_API_PATH = "api/profile";
const SUBMIT_API_PATH = "api/submit";

// Returns "" if there is no current user logged in
function getLoggedInUsername() {
	var username = document.head.querySelector("meta[name=username]").getAttribute('value');
	return username || "";
}

// Gets the user profile with specified username. Asynchronous.
function getUserProfile(username, success, error) {
	// User not logged in
	console.log("Loading user profile '" + username + "'");
	if (username === "") {
		success({"score":0});
		return;
	}
	
	$.ajax({
		url: USER_PROFILE_API_PATH,
		dataType: "json",
		method: "GET",
		data: {"username": username},
		success: success,
		error: error,
	})
}

// Submits the score to the currently logged in user. Does nothing if no user is currently logged in
function submitScore(score, success, error) {
	var username = getLoggedInUsername();
	console.log("Submitting score " + score + " for user '" + username + "'");
	if (username === "")
		return;
	
	$.ajax({
		url: SUBMIT_API_PATH,
		dataType: "json",
		method: "POST",
		data: {"score": score},
		success: success,
		error: error,
	})
}

// Takes a callback that is triggered when the leaderboard has been loaded.
function getLeaderboard(success, error) {
	$.ajax({
		url: LEADERBOARD_API_PATH,
		dataType: "json",
		success: success,
		error: error,
	})
}
