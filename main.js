// Vertex shader program
var VSHADER_SOURCE = null;
// Fragment shader program
var FSHADER_SOURCE = null;

var OFFSCREEN_WIDTH = 1024, OFFSCREEN_HEIGHT = 1024;
var LIGHT_X = 0, LIGHT_Y = 2, LIGHT_Z = 2;

var canvas = null;

var camera = new Matrix4();
var lightCamera = new Matrix4();
var projection = new Matrix4();

var lightProgram;
var shadowProgram;

function main() {
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	var gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}



	// Load the shaders from files
	createProgramFiles(gl, 'Point.vert', 'Point.frag', function(program){
		lightProgram = program;

		switchProgram(gl,lightProgram);

		// Min shader vars
		lightProgram.u_ViewMatrix = gl.getUniformLocation(lightProgram, 'u_ViewMatrix');
		lightProgram.u_ProjMatrix = gl.getUniformLocation(lightProgram, 'u_ProjMatrix');
		lightProgram.u_ModelMatrix = gl.getUniformLocation(lightProgram, "u_ModelMatrix");
		lightProgram.u_LightViewMatrix = gl.getUniformLocation(lightProgram, "u_LightViewMatrix");

		lightProgram.a_Position = gl.getAttribLocation(lightProgram, "a_Position");

		// Extra vars
		lightProgram.a_Color = gl.getAttribLocation(lightProgram, "a_Color");
		lightProgram.a_Uv = gl.getAttribLocation(lightProgram, "a_Uv");
		lightProgram.a_Normal = gl.getAttribLocation(lightProgram, "a_Normal");
		lightProgram.u_NormalMatrix = gl.getUniformLocation(lightProgram, "u_NormalMatrix");

		// Light vars
		//   Ambient
		lightProgram.u_AmbientLight = gl.getUniformLocation(lightProgram, 'u_AmbientLight');
		//   Directional
		lightProgram.u_LightDirection = gl.getUniformLocation(lightProgram, 'u_LightDirection');
		lightProgram.u_DirectionalLight = gl.getUniformLocation(lightProgram, 'u_DirectionalLight');
		//   Positional
		lightProgram.u_LightPosition = gl.getUniformLocation(lightProgram, 'u_LightPosition');
		lightProgram.u_PositionalLight = gl.getUniformLocation(lightProgram, 'u_PositionalLight');


		lightProgram.u_ShadowMap = gl.getUniformLocation(lightProgram, 'u_ShadowMap');

		if(shadowProgram)
			start(gl);
	});

	createProgramFiles(gl, 'Shadow.vert', 'Shadow.frag', function(program){
		shadowProgram = program;

		switchProgram(gl,shadowProgram);

		shadowProgram.a_Position = gl.getAttribLocation(shadowProgram, "a_Position");

		// Min shader vars
		shadowProgram.u_ViewMatrix = gl.getUniformLocation(shadowProgram, 'u_ViewMatrix');
		shadowProgram.u_ProjMatrix = gl.getUniformLocation(shadowProgram, 'u_ProjMatrix');
		shadowProgram.u_ModelMatrix = gl.getUniformLocation(shadowProgram, "u_ModelMatrix");

		if(lightProgram)
			start(gl);
	});
};

var cube;
var currentAngle;

var framebuffer;

/**
 * Fragment matrices
 */
var u_ModelMatrix;
var u_ViewMatrix;
var u_ProjMatrix;

function start(gl) {

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	/**
	 * Camera and projection
	 */

	camera = new Matrix4();
	camera.setLookAt(3,3,7,0,0,0,0,1,0);

	projection = new Matrix4();
	projection.setPerspective(30, canvas.width/canvas.height, 1,100);

	switchProgram(gl,lightProgram);


	/**
	 * Lights
	 */
	// Set the light color (white)
	gl.uniform3f(lightProgram.u_AmbientLight, 0.05, 0.05, 0.05);
	gl.uniform3f(lightProgram.u_DirectionalLight, 0, 0, 0);
	gl.uniform3f(lightProgram.u_PositionalLight, 1.0, 1.0, 1.0);
	// Set the light direction (in the world coordinate)
	var lightDirection = new Vector3([0.5, 3.0, 4.0]);
	var lightPosition = new Vector3([LIGHT_X, LIGHT_Y, LIGHT_Z]);

	lightDirection.normalize(); // Normalize

	gl.uniform3fv(lightProgram.u_LightDirection, lightDirection.elements);
	gl.uniform3fv(lightProgram.u_LightPosition, lightPosition.elements);


	/**
	 * Shadows
	 */

	lightCamera = new Matrix4();
	lightCamera.setLookAt(lightPosition.elements[0],lightPosition.elements[1],lightPosition.elements[2],0,0,0,0,1,0);
	//lightCamera.setLookAt(3,3,7,0,0,0,0,1,0);
	gl.uniformMatrix4fv(lightProgram.u_LightViewMatrix, false, lightCamera.elements);


	gl.uniformMatrix4fv(lightProgram.u_ViewMatrix, false, camera.elements);
	gl.uniformMatrix4fv(lightProgram.u_ProjMatrix, false, projection.elements);

	switchProgram(gl,shadowProgram);

	gl.uniformMatrix4fv(shadowProgram.u_ViewMatrix, false, lightCamera.elements);
	gl.uniformMatrix4fv(shadowProgram.u_ProjMatrix, false, projection.elements);

	framebuffer = initFramebufferObject(gl);

	gl.activeTexture(gl.TEXTURE0); // Set a texture object to the texture unit
	gl.bindTexture(gl.TEXTURE_2D, framebuffer.texture);

	/**
	 * Scene
	 */

	cube = createCube(gl, gl.program);
	plane = createPlane(gl, gl.program);

	plane.matrix.setTranslate(0.0,-0.5,0.0);
	plane.matrix.scale(10.0,1.0,10.0);
	// Register the event handler
	currentAngle = [0.0, 0.0]; // [x-axis, y-axis] degrees
	initEventHandlers(canvas, currentAngle);


	var tick = function() {
		draw(gl);
		requestAnimationFrame(tick);// Request that the browser calls tick
	};
	tick();

};

/**
 * Main draw method
 */

var cubeBackup = new Matrix4();

function draw(gl) {

	// ROTATION TRANSFORM
	cubeBackup.set(cube.matrix);

	cube.matrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // x-axis
	cube.matrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // y-axis*/
	cube.matrix.scale(0.3,0.3,0.3);

	// DEPTH SHADOW CALCULATION

	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
	gl.viewport(0,0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	switchProgram(gl, shadowProgram);

	cube.program = shadowProgram;
	plane.program = shadowProgram;

	cube.draw();
	plane.draw();

	/*if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
		var pixels = new Uint8Array(OFFSCREEN_WIDTH * OFFSCREEN_HEIGHT * 4);
		gl.readPixels(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

		var min = -1;
		for(var i = 0; i< OFFSCREEN_WIDTH*OFFSCREEN_HEIGHT; i+= 4){
			if(pixels[i] < min)
				min = pixels[i];
		}
	}*/

	// NORMAL DRAW

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0,0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	cube.program = lightProgram;
	plane.program = lightProgram;

	switchProgram(gl, lightProgram);

	gl.uniform1i(lightProgram.u_ShadowMap, 0); // Pass gl.TEXTURE0

	cube.draw();
	plane.draw();

	// RESTORE MATRIX
	cube.matrix.set(cubeBackup);

};

function switchProgram(gl, program){
	gl.useProgram(program);
	gl.program = program;
}
