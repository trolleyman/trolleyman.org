
window.validateUsername = function(value) {
	if (value.length == 0) {
		return "Please enter a username.";
	} else if (value.length < username_min_length) {
		return "Please enter a username that is at least " + username_min_length + " characters long.";
	} else if (value.length > username_max_length) {
		return "Please enter a username that is at most " + username_max_length + " characters long.";
	} else if (!username_regex.test(value)) {
		return "Please enter a username that consists of only alphanumeric, hyphen or full stop characters.";
	}
	return "";
}

window.validateUsernameUnique = function(value, cancellationToken) {
	cancellationToken.cancel = () => {
		cancellationToken.cancelled = true;
	};
	return new Promise((resolve, reject) => {
		if (cancellationToken.cancelled) {
			reject(cancellationToken);
		}
		var xhr = $.get("api/username_exists?username=" + value, undefined, undefined, 'json')
			.done((data) => {
				if (data) {
					resolve('Username already taken');
				} else {
					resolve('');
				}
			})
			.fail((jqXHR, textStatus, errorThrown) => {
				reject(errorThrown);
			});
		cancellationToken.cancel = () => {
			cancellationToken.cancelled = true;
			xhr.abort("cancelled");
		}
	});
}

window.validateEmail = function(value) {
	if (value.length == 0) {
		return "Please enter an email address.";
	} else if (!/^\S+@\S+\.\S+$/u.test(value)) {
		return "Please enter a valid email address of the form name@example.com"
	} else if (value.length > email_max_length) {
		return "Please enter an email address that is at most " + email_max_length + " characters long.";
	}
	return "";
}

window.validateConfirmEmail = function(value) {
	var invalid = validateEmail(value);
	if (invalid) {
		return invalid;
	} else if (value != $('#email').val()) {
		return "Entered email addresses do not match";
	}
	return "";
}

window.validatePassword = function(value) {
	if (value.length == 0) {
		return "Please enter a password.";
	} else if (value.length < password_min_length) {
		return "Please enter a password that is at least " + password_min_length + " characters long.";
	} else if (value.length > password_max_length) {
		return "Please enter a password that is at most " + password_max_length + " characters long.";
	} else if (!/[0-9]/.test(value)) {
		return "Please enter a password that contains numeric characters (0-9).";
	}
	return "";
}

window.validateConfirmPassword = function(value) {
	if (value != $('#password').val()) {
		return "Entered passwords do not match";
	}
	return "";
}