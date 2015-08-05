// Vertex shader program
var VSHADER_SOURCE = null;
// Fragment shader program
var FSHADER_SOURCE = null;

var canvas = null;


var camera = new Matrix4();
var projection = new Matrix4();


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
	loadShaderFile(gl, 'Point.vert', gl.VERTEX_SHADER);
	loadShaderFile(gl, 'Point.frag', gl.FRAGMENT_SHADER);
};

var cube;
var currentAngle;


/**
 * Fragment matrixes
 */
var u_ModelMatrix;
var u_ViewMatrix;
var u_ProjMatrix;

function start(gl) {
	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to initialize shaders.');
		return;
	}

	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	var a_Uv = gl.getAttribLocation(gl.program, 'a_UV');

	u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
	u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
	u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	camera = new Matrix4();
	camera.setLookAt(3,3,7,0,0,0,0,1,0);

	cube = createCube(gl, a_Position, a_Color, a_Uv, u_ModelMatrix);
	// Register the event handler
	currentAngle = [0.0, 0.0]; // [x-axis, y-axis] degrees
	initEventHandlers(canvas, currentAngle);
	

	projection = new Matrix4();
	projection.setPerspective(30, canvas.width/canvas.height, 1,100);

	gl.uniformMatrix4fv(u_ViewMatrix, false, camera.elements);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projection.elements);
	
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

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	cubeBackup.set(cube.matrix);
	
	cube.matrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // x-axis
	cube.matrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // y-axis*/

	cube.draw();
	
	cube.matrix.set(cubeBackup);

};
