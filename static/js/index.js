
// Smooth scrolling
$('a[href="#contact"]')
	.click(function(event) {
		var page = $("html, body");
		
		// On-page links
		if (
			location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
			&& 
			location.hostname == this.hostname
		) {
			// Figure out element to scroll to
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			// Does a scroll target exist?
			if (target.length) {
				// Only prevent default if animation is actually gonna happen
				event.preventDefault();
				
				page.on("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove", function(){
					page.stop();
				});

				page.animate({ scrollTop: target.offset().top }, function(){
					page.off("scroll mousedown wheel DOMMouseScroll mousewheel keyup touchmove");
				});
			}
		}
	});