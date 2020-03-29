
$('#delete-form').on('submit', e => {
	if (!$('#delete-form').data('allowSubmit')) {
		e.preventDefault();
		$('#delete-modal').modal();
	}
});

$('#confirm-delete-button').on('click', () => {
	$('#delete-form').data('allowSubmit', true);
	$('#delete-form').submit();
});
