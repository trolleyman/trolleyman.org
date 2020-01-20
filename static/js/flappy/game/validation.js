// NB: If these constants are updated, remember to update the Django versions (in api/validation.py)!
const MAX_NAME_LENGTH = 16;
const NAME_LEGAL_SYMBOLS = "-_";

// NB: If updating these functions, ensure that the Django functions are also updated (in api/validation.py)!
function isValidName(name) {
	var valid = true;
	var reason = "";
	if (typeof name !== "string") {
		valid = false;
		reason = "Please enter a username.";
	} else if (name === "") {
		valid = false;
		reason = "Please enter a username.";
	} else if (name.length > MAX_NAME_LENGTH) {
		valid = false;
		reason = "The username entered is too long.";
	} else {
		for (var i = 0; i < name.length; i++)
			if (!isValidNameChar(name[i])) {
				valid = false;
				reason = "The username contains the ilvalid character '" + name[i] + "'."
				break;
			}
	}
	return {valid: valid, reason: reason};
}

// NB: If updating these functions, ensure that the Django functions are also updated (in api/validation.py)!
function isValidNameChar(ch) {
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
	} else if (NAME_LEGAL_SYMBOLS.indexOf(ch) !== -1) {
		// symbols
		return true;
	}
	return false;
}
