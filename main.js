// Vertex shader program
var VSHADER_SOURCE = null;
// Fragment shader program
var FSHADER_SOURCE = null;

var OFFSCREEN_WIDTH = 1024, OFFSCREEN_HEIGHT = 1024;
var LIGHT_X = 0, LIGHT_Y = 1, LIGHT_Z = 0;

var canvas = null;
var img = null;

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



		lightProgram.u_Lights = [];
		for(var i = 0; i<2; i++){
			lightProgram.u_Lights[i] = {};
			/* ** Definition **
			 * Type 1: Directional
			 * Type 2: Point
			 * Type 3: Focus */
			lightProgram.u_Lights[i].type = gl.getUniformLocation(lightProgram, 'u_Lights[' + i + '].type');
			lightProgram.u_Lights[i].enabled = gl.getUniformLocation(lightProgram, 'u_Lights[' + i + '].enabled');
			// General props
			lightProgram.u_Lights[i].direction = gl.getUniformLocation(lightProgram, 'u_Lights[' + i + '].direction');
			lightProgram.u_Lights[i].position = gl.getUniformLocation(lightProgram, 'u_Lights[' + i + '].position');
			lightProgram.u_Lights[i].color = gl.getUniformLocation(lightProgram, 'u_Lights[' + i + '].color');
			lightProgram.u_Lights[i].range = gl.getUniformLocation(lightProgram, 'u_Lights[' + i + '].range');
			// Shadows things
			lightProgram.u_Lights[i].casts = gl.getUniformLocation(lightProgram, 'u_Lights[' + i + '].casts');
			lightProgram.u_Lights[i].shadows = gl.getUniformLocation(lightProgram, 'u_Shadows');
			lightProgram.u_Lights[i].shadowsCube = gl.getUniformLocation(lightProgram, 'u_ShadowsCube');
			lightProgram.u_Lights[i].matrix = gl.getUniformLocation(lightProgram, 'u_Lights[' + i + '].matrix');
		}
		lightProgram.u_NumLights = gl.getUniformLocation(lightProgram, 'u_NumLights');

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
}

var cube;
var currentAngle;

/**
 * Fragment matrices
 */
var u_ModelMatrix;
var u_ViewMatrix;
var u_ProjMatrix;

function start(gl) {

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	/**
	 * Camera and projection
	 */

	camera = new Matrix4();
	camera.setLookAt(3,3,7,0,0,0,0,1,0);
	//camera.setLookAt(LIGHT_X,LIGHT_Y,LIGHT_Z,0,0,0,0,1,0);

	projection = new Matrix4();
	projection.setPerspective(30, canvas.width/canvas.height, 1,100);

	var identity = new Matrix4();
	identity.setIdentity();


	/**
	 * Minimal shader config
	 */

	switchProgram(gl,shadowProgram);
	gl.uniformMatrix4fv(shadowProgram.u_ProjMatrix, false, projection.elements);

	switchProgram(gl,lightProgram);
	// Set the light color (white)
	gl.uniform3f(lightProgram.u_AmbientLight, 0.15, 0.15, 0.15);
	gl.uniformMatrix4fv(lightProgram.u_ViewMatrix, false, camera.elements);
	gl.uniformMatrix4fv(lightProgram.u_ProjMatrix, false, projection.elements);



	/**
	 * Scene creation
	 */

	scene = new Scene(gl, lightProgram, shadowProgram);
	// Directional Light
	directionalLightObject = new SceneObject(gl, shadowProgram);
	directionalLight = new Light(gl, shadowProgram);
	directionalLight.type = 1;
	directionalLight.direction = new Vector3([4.0, 4.0, 0.0]);
	directionalLightObject.setTranslate(
		directionalLight.direction.elements[0],
		directionalLight.direction.elements[1],
		directionalLight.direction.elements[2]);
	directionalLight.color = new Vector3([0.1, 0.1, 0.1]);
	directionalLight.casts = 1;
	directionalLightObject.addComponent(directionalLight);
	directionalLight.onParametersChanged();
	scene.addObject(directionalLightObject);

	// Positional Light
	positionalLightObject = new SceneObject(gl, shadowProgram);
	positionalLight = new Light(gl, shadowProgram);
	positionalLight.type = 2;
	positionalLightObject.setTranslate(LIGHT_X, LIGHT_Y, LIGHT_Z);
	positionalLight.color = new Vector3([0.8, 0.4, 0.4]);
	positionalLight.casts = 1;
	positionalLightObject.addComponent(positionalLight);
	positionalLight.onParametersChanged();
	scene.addObject(positionalLightObject);


	// Cube
	cube = createCube(gl, lightProgram);
	cube.setTranslate(0.0, 0, 0.0);
	scene.addObject(cube);
	// Plane
	plane = createPlane(gl, lightProgram);
	plane.setTranslate(0.0,-0.5,0.0);
	plane.scale(10.0,1.0,10.0);
	scene.addObject(plane);

	// Register the event handler
	currentAngle = [0.0, 0.0]; // [x-axis, y-axis] degrees
	initEventHandlers(canvas, currentAngle);

	var tick = function() {
		draw(gl);
		requestAnimationFrame(tick);// Request that the browser calls tick
	};
	tick();

}

/**
 * Main draw method
 */

var cubeBackup = new Matrix4();

function draw(gl) {

	// ROTATION TRANSFORM
	cubeBackup.set(cube.matrix);

	cube.rotate(currentAngle[0], 1.0, 0.0, 0.0); // x-axis
	cube.rotate(currentAngle[1], 0.0, 1.0, 0.0); // y-axis*/
	cube.scale(0.3,0.3,0.3);

	scene.draw();

	// RESTORE MATRIX
	cube.matrix.set(cubeBackup);

}

function switchProgram(gl, program){
	gl.useProgram(program);
	gl.program = program;
}
