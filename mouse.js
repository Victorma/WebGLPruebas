var Controller = function() {};

Controller.w = false;
Controller.a = false;
Controller.s = false;
Controller.d = false;
Controller.shift = false;
Controller.space = false;


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

	canvas.oncontextmenu = function (e) {
		e.preventDefault();
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
	canvas.tabIndex = 1000;

	canvas.addEventListener("keydown" , function (ev) {
		// w = 87 a = 65 s = 83 d = 68
		switch(ev.keyCode){
			case 87: Controller.w = true; break;
			case 65: Controller.a = true; break;
			case 83: Controller.s = true; break;
			case 68: Controller.d = true; break;
			case 32: Controller.space = true; break;
			case 16: Controller.shift = true; break;
		}
	},false);
	canvas.addEventListener("keyup" , function (ev) {
		switch(ev.keyCode){
			case 87: Controller.w = false; break;
			case 65: Controller.a = false; break;
			case 83: Controller.s = false; break;
			case 68: Controller.d = false; break;
			case 32: Controller.space = false; break;
			case 16: Controller.shift = false; break;
		}
	},false);
};