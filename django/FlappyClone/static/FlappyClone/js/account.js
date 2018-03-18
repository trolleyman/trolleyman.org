function updateSizing() {
	$('#title > span').bigText();
}

$(function(){
	// Start up font resizing
	// For bigText
	$(window).resize(updateSizing);
	updateSizing();

	// For fitText
	$('.detail').fitText(1.0, {
		minFontSize: 14,
		maxFontSize: 34,
	});
})

$(window).on("load", updateSizing)
