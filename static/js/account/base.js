// Disable form submissions if there are invalid fields
$(".needs-validation").each((_, form) => {
	var $form = $(form);
	var inputs = $form.find('input').map((_, input) => $(input));
	
	var check = input => {
		var value = input.val();
		
		// Get custom-validation data attribute
		var custom = input.data('custom-validation');
		if (custom == null)
			return '';
		
		// Run the custom validation function
		try {
			var func = eval(custom);
			var invalid = func(value);
		} catch(err) {
			console.error(err);
			var invalid = 'Unknown error: ' + err;
		}
		invalid = invalid || '';
		
		// Set input validity
		if (invalid) {
			input.siblings('.invalid-feedback').text(invalid);
		}
		input[0].setCustomValidity(invalid);
		return invalid;
	};
	
	var checkPromise = input => {
		var value = input.val();
		if (input.data('loadedValue') === value) {
			return;
		}
		input.data('loadedValue', '');
		
		// Cancel previous loading task
		var cancellationToken = input.data('cancellationToken');
		if (cancellationToken != null && cancellationToken.value != value) {
			cancellationToken.cancel();
		}
		
		// Check input is valid without loading
		var invalid = check(input);
		if (invalid) {
			if (input.data('hasStartedLoading')) {
				input[0].classList.add('is-invalid');
			} else {
				input[0].classList.remove('is-invalid');
			}
			input[0].classList.remove('is-valid');
			input[0].classList.remove('loading');
			return invalid;
		}
		
		var customPromise = input.data('custom-validation-promise');
		if (customPromise == null)
			return;
		
		// Set loading
		input.data('hasStartedLoading', true);
		input.parent()[0].classList.remove('was-validated');
		input[0].classList.remove('is-invalid');
		input[0].classList.remove('is-valid');
		input[0].classList.add('loading');
		input[0].setCustomValidity("Loading...");
		input.siblings('.invalid-feedback').text('');

		// If previous task is the same as the current one, don't send another request
		if (cancellationToken != null && cancellationToken.value == value) {
			return;
		}
		
		// Evaluate and run promise
		var func = eval(customPromise);
		cancellationToken = { cancel: function() {}, value: value };
		input.data('cancellationToken', cancellationToken)
		
		var promise = func(value, cancellationToken);
		
		promise.then(invalid => {
			input[0].classList.remove('loading');
			input.data('loadedValue', value);
			if (invalid) {
				input[0].classList.add('is-invalid');
				input[0].setCustomValidity(invalid);
				input.siblings('.invalid-feedback').text(invalid);
			} else {
				input[0].classList.add('is-valid');
				input[0].setCustomValidity('');
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
	}
	
	var checkAll = () => {
		inputs.each((_, input) => {
			checkPromise(input);
		});
	};
	
	inputs.each((_, input) => {
		var customPromise = input.data('custom-validation-promise');
		if (customPromise != null) {
			input.on('change input', () => checkPromise(input));
		}
		input.on('change input', checkAll);
	});
	inputs.each((_, input) => {
		var existingErrors = input.data('existing-errors');
		if (existingErrors && existingErrors.length > 0) {
			input[0].setCustomValidity(existingErrors.join('\n'));
			input.parent()[0].classList.add('was-validated');
			if (existingErrors.length === 1) {
				input.siblings('.invalid-feedback').text(existingErrors[0]);
			} else {
				input.siblings('.invalid-feedback')
					.text(`<ul>${existingErrors.map(e => `<li>${e}</li>`).join('\n')}</ul>`);
			}
		} else if (input.val() && (input.data('custom-validation') || input.data('custom-validation-promise'))) {
			checkPromise(input);
			input.parent()[0].classList.add('was-validated');
		}
	});
	$form.submit(checkAll);
	$form.submit(event => {
		if (form.checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
			inputs.each((_, input) => {
				var customPromise = input.data('custom-validation-promise');
				if (customPromise == null) {
					input.parent()[0].classList.add('was-validated');
				}
			});
		}
	});
});
