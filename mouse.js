function initEventHandlers(canvas, currentAngle) {
	
	var dragging = false; // Dragging or not
	var lastX = -1, lastY = -1; // Last position of the mouse
	
	canvas.onmousedown = function (ev) { // Mouse is pressed
		var x = ev.clientX, y = ev.clientY;
		// Start dragging if a mouse is in <canvas>
		var rect = ev.target.getBoundingClientRect();
		if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
			lastX = x; lastY = y;
			dragging = true;
		}
	};
	
	// Mouse is released
	canvas.onmouseup = function (ev) { dragging = false; };
	
	canvas.onmousemove = function (ev) { // Mouse is moved
		var x = ev.clientX, y = ev.clientY;
		if (dragging) {
			var factor = 100 / canvas.height; // The rotation ratio
			var dx = factor * (x - lastX);
			var dy = factor * (y - lastY);
			// Limit x-axis rotation angle to -90 to 90 degrees
			currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
			currentAngle[1] = currentAngle[1] + dx;
		}
		lastX = x, lastY = y;
	};
};