// Disable form submissions if there are invalid fields
// TODO: Fix validity when one field is still loading
$(".needs-validation").each((_, form) => {
	var $form = $(form);
	var inputs = $form.find('input').map((_, input) => $(input));
	
	var check = input => {
		var custom = input.data('custom-validation');
		if (custom == null)
			return '';
		
		try {
			var func = eval(custom);
			var invalid = func(input.val());
		} catch(err) {
			console.error(err);
			var invalid = 'Unknown error: ' + err;
		}
		invalid = invalid || '';
		if (invalid) {
			input.siblings('.invalid-feedback').text(invalid);
		}
		input[0].setCustomValidity(invalid);
		return invalid;
	};
	
	var checkAll = () => {
		inputs.each((_, input) => {
			check(input);
		});
	};
	
	var checkPromise = input => {
		var invalid = check(input);
		if (invalid) {
			if (input.data('hasStartedLoading')) {
				input[0].classList.add('is-invalid');
			} else {
				input[0].classList.remove('is-invalid');
			}
			input[0].classList.remove('is-valid');
			input[0].classList.remove('loading');
			var cancellationToken = input.data('cancellationToken');
			if (cancellationToken != null) {
				cancellationToken.cancel();
			}
			return invalid;
		}
		
		var customPromise = input.data('custom-validation-promise');
		if (customPromise == null)
			return;
		
		var value = input.val();
		if (value === input.data('prevValue'))
			return;
		
		var cancellationToken = input.data('cancellationToken');
		if (cancellationToken != null) {
			cancellationToken.cancel();
		}
		var func = eval(customPromise);
		var cancellationToken = { cancel: function() {} };
		input.data('cancellationToken', cancellationToken)
		
		var promise = func(value, cancellationToken);
		input.data('hasStartedLoading', true);
		
		promise.then(invalid => {
			input.data('prevValue', value);
			input[0].classList.remove('loading');
			if (invalid) {
				input[0].classList.add('is-invalid');
				input[0].setCustomValidity(invalid);
				input.siblings('.invalid-feedback').text(invalid);
			} else {
				input[0].classList.add('is-valid');
			}
		}, err => {
			if (cancellationToken.cancelled)
				return;
			
			input[0].classList.remove('loading');
			input[0].classList.add('is-invalid');
			var msg = 'Unknown error: ' + err;
			input[0].setCustomValidity(msg);
			input.siblings('.invalid-feedback').text(msg);
		});
		
		// Set loading
		input[0].classList.remove('is-invalid');
		input[0].classList.remove('is-valid');
		input[0].classList.add('loading');
		input[0].setCustomValidity("Username is being checked");
		input.siblings('.invalid-feedback').text('');
	}
	
	inputs.each((_, input) => {
		var customPromise = input.data('custom-validation-promise');
		if (customPromise != null) {
			input.on('change input', () => checkPromise(input));
		}
		input.on('change input', checkAll);
		$form.submit(checkAll);
	});
	$form.submit(event => {
		if (form.checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
		}
		inputs.each((_, input) => {
			var customPromise = input.data('custom-validation-promise');
			if (customPromise == null) {
				input.parent()[0].classList.add('was-validated');
			}
		});
	});
});
