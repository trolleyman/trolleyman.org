
function onInputUsername(input) {
	if (!isValidName(input.value).valid) {
		input.className = "invalid";
	} else {
		input.className = "";
	}
}

function onInputPassword(input) {
	if (!isValidPassword(input.value).valid) {
		input.className = "invalid";
	} else {
		input.className = "";
	}
}

function onInputEmail(input) {
	if (!isValidEmail(input.value).valid) {
		input.className = "invalid";
	} else {
		input.className = "";
	}
}

function onInputConfirm(input, confirm) {
	if (input.value !== confirm.value || input.className === "invalid") {
		confirm.className = "invalid";
	} else {
		confirm.className = "";
	}
}

function registerOnInput(selector, func) {
	var input = document.querySelector(selector);
	input.addEventListener('input', func.bind(null, input));
}

window.onload = function(){
	// Usernames
	registerOnInput('#login input[name=username]', onInputUsername);
	registerOnInput('#signup input[name=username]', onInputUsername);
	
	// Password
	registerOnInput('#login input[name=password]', onInputPassword);
	registerOnInput('#signup input[name=password]', onInputPassword);
	
	// Email
	registerOnInput('#signup input[name=email]', onInputEmail);
	
	// Confirm
	registerOnInput('#signup input[name=email-confirm]', onInputConfirm.bind(null, document.querySelector('#signup input[name=email]')));
	registerOnInput('#signup input[name=email]', function() {
		onInputConfirm(document.querySelector('#signup input[name=email]'), document.querySelector('#signup input[name=email-confirm]'));
	})
	registerOnInput('#signup input[name=password-confirm]', onInputConfirm.bind(null, document.querySelector('#signup input[name=password]')));
	registerOnInput('#signup input[name=password]', function() {
		onInputConfirm(document.querySelector('#signup input[name=password]'), document.querySelector('#signup input[name=password-confirm]'));
	})
};
