
function recalcFullMove() {
	if (window.innerWidth <= 450) {
		// Move all full-move's down one
		var es = document.querySelectorAll('.wrapper.spotlight .inner .full-move');
		for (var i = 0; i < es.length; i++) {
			var e = es[i];
			var parent = e.parentNode;
			var next = e.nextElementSibling;
			
			// Remove e
			e.remove();
			
			// Add e at idx+1
			parent.insertBefore(e, next.nextElementSibling);
			
			e.classList.remove('full-move');
			e.classList.add('full-moved');
		}
	} else {
		// Move all full-moved's up one
		var es = document.querySelectorAll('.wrapper.spotlight .inner .full-moved');
		for (var i = 0; i < es.length; i++) {
			var e = es[i];
			var parent = e.parentNode;
			var prev = e.previousElementSibling;
			
			// Remove e
			e.remove();
			
			// Add e at idx+1
			parent.insertBefore(e, prev);
			
			e.classList.remove('full-moved');
			e.classList.add('full-move');
		}
	}
}

window.addEventListener('resize', recalcFullMove);
recalcFullMove();
