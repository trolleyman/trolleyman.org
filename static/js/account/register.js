
window.validateUsername = function(value) {
	if (value.length == 0) {
		return "Please enter a username.";
	} else if (value.length < USERNAME_MIN_LENGTH) {
		return "Please enter a username that is at least " + USERNAME_MIN_LENGTH + " characters long.";
	} else if (value.length > USERNAME_MAX_LENGTH) {
		return "Please enter a username that is at most " + USERNAME_MAX_LENGTH + " characters long.";
	} else if (!USERNAME_REGEX.test(value)) {
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
		var xhr = $.get("api/username_available?username=" + value, undefined, undefined, 'json')
			.done((data) => {
				if (!data) {
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
	} else if (value.length > EMAIL_MAX_LENGTH) {
		return "Please enter an email address that is at most " + EMAIL_MAX_LENGTH + " characters long.";
	} else if (!EMAIL_REGEX.test(value)) {
		return "Please enter a valid email address of the form name@example.com";
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
	} else if (value.length < PASSWORD_MIN_LENGTH) {
		return "Please enter a password that is at least " + PASSWORD_MIN_LENGTH + " characters long.";
	} else if (value.length > PASSWORD_MAX_LENGTH) {
		return "Please enter a password that is at most " + PASSWORD_MAX_LENGTH + " characters long.";
	} else if (!PASSWORD_REGEX.test(value)) {
		return "Please enter a password that contains at least one numeric character (0-9).";
	}
	return "";
}
