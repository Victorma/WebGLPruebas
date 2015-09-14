// Vertex shader program
var VSHADER_SOURCE = null;
// Fragment shader program
var FSHADER_SOURCE = null;

var OFFSCREEN_WIDTH = 1024, OFFSCREEN_HEIGHT = 1024;
var LIGHT_X = 0, LIGHT_Y = 1.5, LIGHT_Z = -0.5;

var canvas = null;
var img = null;
var gl;

var lightProgram;
var shadowProgram;

function main() {
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');
	shaders = document.getElementById('shaders');
	readShaderFiles(shaders);

	// Get the rendering context for WebGL
	gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}

	loadExternalShader("Shadow.json", "shaders/render/", function(shader){
		shadowProgram = shader.program;
		start(gl);
	});

	/*
	createProgramFiles(gl, 'Normal.vert', 'Normal.frag', function(program){
		normalProgram = program

		normalProgram.framebuffer = initFramebufferObject(gl, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT)[0];

		switchProgram(gl,normalProgram);

		normalProgram.a_Normal = gl.getAttribocation(normalProgram, "a_Normal");
		normalProgram.a_Position = gl.getAttribLocation(normalProgram, "a_Position");

		// Min shader vars
		normalProgram.u_ViewMatrix = gl.getUniformLocation(normalProgram, 'u_ViewMatrix');
		normalProgram.u_ProjMatrix = gl.getUniformLocation(normalProgram, 'u_ProjMatrix');
		normalProgram.u_ModelMatrix = gl.getUniformLocation(normalProgram, "u_ModelMatrix");

	});

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
			// ** Definition **
			// * Type 1: Directional
			// * Type 2: Point
			// * Type 3: Focus
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
			lightProgram.u_Lights[i].near = gl.getUniformLocation(lightProgram, 'u_Lights[' + i + '].near');
			lightProgram.u_Lights[i].far = gl.getUniformLocation(lightProgram, 'u_Lights[' + i + '].far');
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

	});*/
}

var cube;
var currentAngle;


function start(gl){

	Camera.init();

	gl.clearColor(0.5, 0.5, 0.5, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	/**
	 * Camera and projection
	 */

	Camera.main.configureView(new Vector3([3,4,13]), new Vector3([0,0,0]));
	Camera.main.configureProjection(false, canvas.width,canvas.height, 0.1, 100, 120);

	/**
	 * Scene creation
	 */

	scene = new Scene(gl);
	// Directional Light
	directionalLightObject = new SceneObject(gl);
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
	positionalLightObject = new SceneObject(gl);
	positionalLight = new Light(gl, shadowProgram);
	positionalLight.type = 2;
	positionalLightObject.setTranslate(LIGHT_X, LIGHT_Y, LIGHT_Z);
	positionalLight.color = new Vector3([0.8, 0.4, 0.4]);
	positionalLight.casts = 1;
	positionalLightObject.addComponent(positionalLight);
	positionalLight.onParametersChanged();
	scene.addObject(positionalLightObject);

	var lightMaterial = new Material(gl);
	lightMaterial.load("Point.json", "shaders/render/", function(){
		lightMaterial.set("AmbientLight", "float", 3, [0.15, 0.15, 0.15]);
	});
	/*
	 "textures/emerald_left.jpg",
	 "textures/emerald_right.jpg",
	 "textures/emerald_top.jpg",
	 "textures/emerald_top.jpg",
	 "textures/emerald_back.jpg",
	 "textures/emerald_front.jpg",

	 */

	loadTextureCube(
		"textures/skybox_px.jpg",
		"textures/skybox_nx.jpg",
		"textures/skybox_py.jpg",
		"textures/skybox_ny.jpg",
		"textures/skybox_pz.jpg",
		"textures/skybox_nz.jpg",
		function(texture){
			Camera.main.setSkybox(texture);
	});

	var toonMaterial = new Material(gl);
	toonMaterial.load("Border.json", "shaders/render/", function(material, shader){
		shader.onPreRender = function(scene){
			gl.enable(gl.CULL_FACE);
			gl.cullFace(gl.FRONT);
			toonMaterial.set("Offset", "float", 1, [ 0.3 ]);
			toonMaterial.set("Color", "float", 4, [ 0.0, 0.0, 0.0, 1.0 ]);
		};

		shader.onPostRender = function(scene){
			gl.disable(gl.CULL_FACE);
			gl.cullFace(gl.BACK);
		}
	});

	toonMaterial.load("Cell.json", "shaders/render/", function() {
		toonMaterial.set("AmbientLight", "float", 3, [0.15, 0.15, 0.15]);
	});

	// Cube
	cube = createCube(gl);
	cube.setTranslate(0.0, 0, 0.0);
	cube.addComponent(lightMaterial);
	scene.addObject(cube);
	// Cube
	var cube2 = createCube(gl);
	cube2.setTranslate(3.0, 1, 0.0);
	cube2.scale(0.3,0.3,0.3);
	cube2.addComponent(lightMaterial);
	scene.addObject(cube2);
	// Cube
	var cube3 = createCube(gl);
	cube3.setTranslate(1.0, 0, 0.0);
	cube3.scale(0.3,0.3,0.3);
	cube3.addComponent(lightMaterial);

	scene.addObject(cube3);
	// Cube
	var cube4 = createCube(gl);
	cube4.setTranslate(0.0, 0, 1.0);
	cube4.scale(0.3,0.3,0.3);
	cube4.scale(1.5,1.5,1.5);
	cube4.addComponent(lightMaterial);
	scene.addObject(cube4);
	// Plane
	plane = createPlane(gl);
	plane.setTranslate(0,-2,0);
	plane.rotate(90,1,0,0);
	plane.translate(0,0,0);
	//plane.scale(10.0,1.0,10.0);
	var mirrorMaterial = new Material(gl);
	mirrorMaterial.load("Point.json", "shaders/render/", function(material, shader){
		mirrorMaterial.set("AmbientLight", "float", 3, [0.5, 0.5, 0.5]);
		var reflectionBuffer = initFramebufferObject(gl, canvas.width, canvas.height)[0];
		var textureMatrix = new Matrix4();
		var rotationMatrix = new Matrix4();
		mirrorMaterial.onPreRender = function(scene, pool){
			// Backups
			var bcPosition = Camera.main.position, bcLook = Camera.main.look, bcUp = Camera.main.up, bcBuffer = scene.framebuffer;

			// Update the texture matrix
			textureMatrix.set({elements:[ 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0,0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0 ]} );
			textureMatrix.multiply(new Matrix4(Camera.main.projection).multiply(new Matrix4(Camera.main.view)));

			this.mirrorWorldPosition = getPositionFromMatrix( scene.peekMatrix() );
			this.cameraWorldPosition = getPositionFromMatrix( Camera.main.worldMatrix );

			// NORMAL
			extractRotation( scene.peekMatrix(), rotationMatrix ).invert();
			var n3e = rotationMatrix.multiplyVector4(new Vector4([ 0, 0, 1, 0])).elements;
			var normal = normalize(new Vector3([n3e[0],n3e[1],n3e[2]]));
			// POSITION
			var position = sum(negative(reflect(dif(this.mirrorWorldPosition, this.cameraWorldPosition ),normal)), this.mirrorWorldPosition );
			// LOOK
			extractRotation( Camera.main.worldMatrix, rotationMatrix ).invert();
			var lv = rotationMatrix.multiplyVector4(new Vector4([ 0, 0, -1, 0])).elements;
			var lookVect = sum(this.cameraWorldPosition, new Vector3([lv[0],lv[1],lv[2]]));
			var look = sum(negative(reflect(dif(this.mirrorWorldPosition, lookVect), normal)), this.mirrorWorldPosition);
			// UP
			var ue = rotationMatrix.multiplyVector4(new Vector4([ 0, -1, 0, 0])).elements;
			var up = negative(reflect(new Vector3([ue[0],ue[1],ue[2]]), normal));
			// UPDATE CAMERA
			Camera.main.configureView(position, look, up);

			// Setup framebuffer & clean
			scene.renderTo(reflectionBuffer);
			scene.bind(); gl.clear(gl.DEPTH_BUFFER_BIT);

			// culling face to avoid mirror seen
			Camera.main.renderSkybox();
			gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
			scene.do("onRender", pool);
			gl.disable(gl.CULL_FACE);

			// Restore status
			scene.renderTo(bcBuffer);
			scene.bind();
			Camera.main.configureView(bcPosition, bcLook, bcUp);
		};
		shader.onPreRender = function(scene, pool){
			if(reflectionBuffer != scene.framebuffer) {
				pool["TextureEnabled"] = {type: "int", count: 1, values: [1]};
				pool["Texture"] = {type: gl.TEXTURE_2D, value: reflectionBuffer.texture};
				mirrorMaterial.set("TextureMatrixEnabled", "int", 1, [1]);
				mirrorMaterial.set("TextureMatrix", "matrix4x4", 16, textureMatrix.elements);
			}
		};
		shader.onPostRender = function(scene, pool){
			delete pool["TextureEnabled"];
			delete pool["Texture"];
		};
	});

	plane.addComponent(mirrorMaterial);
	scene.addObject(plane);

	plane2 = createPlane(gl);
	plane2.setTranslate(0,10,-10);
	plane2.rotate(180, 0,1,0);
	plane2.scale(0.5,0.5,0.5);
	//plane.scale(10.0,1.0,10.0);
	var mirrorMaterial2 = new Material(gl);
	mirrorMaterial2.load("Point.json", "shaders/render/", function(material, shader){
		mirrorMaterial2.set("AmbientLight", "float", 3, [0.5, 0.5, 0.5]);
		var reflectionBuffer = initFramebufferObject(gl, canvas.width, canvas.height)[0];
		var textureMatrix = new Matrix4();
		var rotationMatrix = new Matrix4();
		mirrorMaterial2.onPreRender = function(scene, pool){
			// Backups
			var bcPosition = Camera.main.position, bcLook = Camera.main.look, bcUp = Camera.main.up, bcBuffer = scene.framebuffer;

			// Update the texture matrix
			textureMatrix.set({elements:[ 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0,0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0 ]} );
			textureMatrix.multiply(new Matrix4(Camera.main.projection).multiply(new Matrix4(Camera.main.view)));

			this.mirrorWorldPosition = getPositionFromMatrix( scene.peekMatrix() );
			this.cameraWorldPosition = getPositionFromMatrix( Camera.main.worldMatrix );

			// NORMAL
			extractRotation( scene.peekMatrix(), rotationMatrix ).invert();
			var n3e = rotationMatrix.multiplyVector4(new Vector4([ 0, 0, 1, 0])).elements;
			var normal = normalize(new Vector3([n3e[0],n3e[1],n3e[2]]));
			// POSITION
			var position = sum(negative(reflect(dif(this.mirrorWorldPosition, this.cameraWorldPosition ),normal)), this.mirrorWorldPosition );
			// LOOK
			extractRotation( Camera.main.worldMatrix, rotationMatrix ).invert();
			var lv = rotationMatrix.multiplyVector4(new Vector4([ 0, 0, -1, 0])).elements;
			var lookVect = sum(this.cameraWorldPosition, new Vector3([lv[0],lv[1],lv[2]]));
			var look = sum(negative(reflect(dif(this.mirrorWorldPosition, lookVect), normal)), this.mirrorWorldPosition);
			// UP
			var ue = rotationMatrix.multiplyVector4(new Vector4([ 0, -1, 0, 0])).elements;
			var up = negative(reflect(new Vector3([ue[0],ue[1],ue[2]]), normal));
			// UPDATE CAMERA
			Camera.main.configureView(position, look, up);

			// Setup framebuffer & clean
			scene.renderTo(reflectionBuffer);
			scene.bind(); gl.clear(gl.DEPTH_BUFFER_BIT);

			// culling face to avoid mirror seen
			Camera.main.renderSkybox();
			gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
			scene.do("onRender", pool);
			gl.disable(gl.CULL_FACE);

			// Restore status
			scene.renderTo(bcBuffer);
			scene.bind();
			Camera.main.configureView(bcPosition, bcLook, bcUp);
		};
		shader.onPreRender = function(scene, pool){
			if(reflectionBuffer != scene.framebuffer) {
				pool["TextureEnabled"] = {type: "int", count: 1, values: [1]};
				pool["Texture"] = {type: gl.TEXTURE_2D, value: reflectionBuffer.texture};
				mirrorMaterial2.set("TextureMatrixEnabled", "int", 1, [1]);
				mirrorMaterial2.set("TextureMatrix", "matrix4x4", 16, textureMatrix.elements);
			}
		};
		shader.onPostRender = function(scene, pool){
			delete pool["TextureEnabled"];
			delete pool["Texture"];
		};
	});

	plane2.addComponent(mirrorMaterial2);

	scene.addObject(plane2);

	var raptor = new SceneObject(gl);
	var raptorRenderer = new Renderer(gl);
	raptorRenderer.loadObj("raptor.obj");
	raptor.addComponent(raptorRenderer);

	var raptorMaterial = new Material(gl);
	raptorMaterial.load("Point.json", "shaders/render/", function(material, shader){
		raptorMaterial.set("AmbientLight", "float", 3, [0.5, 0.5, 0.5]);
		loadTexture("raptor.jpg",function(texture){
			shader.onPreRender = function(scene, pool){
				pool["TextureEnabled"] = {name:"Texture", type: "int", count: 1,  values: [ 1 ]};
				pool["Texture"] = {name:"Texture", type:gl.TEXTURE_2D,  value: texture};
			};
			shader.onPostRender = function(scene, pool){
				delete pool["TextureEnabled"];
				delete pool["Texture"];
			};
		});
	});
	raptor.addComponent(raptorMaterial);
	raptor.setTranslate(2,1,0);
	raptor.scale(0.01,0.01,0.01);
	scene.addObject(raptor);

	var head = new SceneObject(gl);
	var headRenderer = new Renderer(gl);
	headRenderer.loadObj("head.obj");
	head.addComponent(headRenderer);
	head.addComponent(toonMaterial);
	head.setTranslate(-3,-1,0);
	head.rotate(180, 0,1,0);
	head.scale(0.03,0.03,0.03);
	scene.addObject(head);


	// Register the event handler
	currentAngle = [0.0, 0.0]; // [x-axis, y-axis] degrees
	initEventHandlers(canvas, currentAngle);

	lastFramebuffer = initFramebufferObject(gl, canvas.width, canvas.height)[0];
	currentFramebuffer = initFramebufferObject(gl, canvas.width, canvas.height)[0];
	swapBuffer = initFramebufferObject(gl, canvas.width, canvas.height)[0];

	var postRenderVertices = new Float32Array([
		0.0, 0.0, 0.0,  1.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0
	]);

	var postRenderColors = new Float32Array([ // Vertex coordinates
		1.0, 1.0, 1.0, 1.0,	 1.0, 1.0, 1.0, 1.0,	1.0, 1.0, 1.0, 1.0, 	1.0, 1.0, 1.0, 1.0
	]);

	var postRenderUVs = new Float32Array([ // Vertex coordinates
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0
	]);

	var postRenderIndexes = new Uint16Array([
		0, 1, 3, 0, 3, 2 // down
	]);

	postRenderMatrix = new Matrix4();
	postRenderMatrix.setScale(2.0, 2.0, 1.0);
	postRenderMatrix.translate(-0.5,-0.5,0.0);

	var postRenderObject = new SceneObject(gl);
	var postRenderRenderer = new Renderer(gl);
	postRenderRenderer.vertices = postRenderVertices;
	postRenderRenderer.colors = postRenderColors;
	postRenderRenderer.uvs = postRenderUVs;
	postRenderRenderer.triangles = postRenderIndexes;
	postRenderRenderer.onChangePoints();
	postRenderObject.addComponent(postRenderRenderer);
	postRenderMaterial = new Material(gl);
	postRenderObject.addComponent(postRenderMaterial);

	postRenderScene = new Scene(gl);
	postRenderScene.addObject(postRenderObject);

	var final = new SceneObject(gl);
	var finalRenderer = new Renderer(gl);
	finalRenderer.vertices = postRenderVertices;
	finalRenderer.colors = postRenderColors;
	finalRenderer.uvs = postRenderUVs;
	finalRenderer.triangles = postRenderIndexes;
	finalRenderer.onChangePoints();
	final.addComponent(finalRenderer);
	finalRendererMaterial = new Material(gl);
	final.addComponent(finalRendererMaterial);
	finalRendererMaterial.load("blit.json", "shaders/program/", function(material, shader){
		finalRendererMaterial.set("ProjMat", "matrix4x4", 16, postRenderMatrix.elements);
		shader.onPreRender = function(scene, pool){
			pool["DiffuseSampler"] = {name:"DiffuseSampler", type:gl.TEXTURE_2D,  value: swapBuffer.texture};
		};
	});

	finalScene = new Scene(gl);
	finalScene.addObject(final);

	var tick = function() {
		draw(gl);
		requestAnimationFrame(tick);// Request that the browser calls tick
	};
	tick();


}
var postRenderScene;
/**
 * Main draw method
 */

var cubeBackup = new Matrix4();
var ang = 0 ;

var lastFramebuffer;
var currentFramebuffer;

var yawn = 0, pitched = 0;

var lastCurrentShader = undefined;

function draw(gl) {

	/**
	 * Camera management
	 * */

	if(Controller.w) Camera.main.moveForward(0.1);
	if(Controller.a) Camera.main.moveLeft(0.1);
	if(Controller.s) Camera.main.moveBackwards(0.1);
	if(Controller.d) Camera.main.moveRight(0.1);
	if(Controller.space) Camera.main.moveUp(0.1);
	if(Controller.shift) Camera.main.moveDown(0.1);

	var toYaw = currentAngle[1] - yawn;
	var toPitch = currentAngle[0] - pitched;

	if(toYaw!=0){
		Camera.main.yaw(toYaw/2.0);
		yawn += toYaw;
	}
	if(toPitch!=0) {
		Camera.main.pitch(toPitch/2.0);
		pitched += toPitch;
	}

	/**
	 * Scene drawing
	 * */

	// ROTATION TRANSFORM
	cubeBackup.set(cube.matrix);

	cube.rotate(currentAngle[0], 1.0, 0.0, 0.0); // x-axis
	cube.rotate(currentAngle[1], 0.0, 1.0, 0.0); // y-axis*/
	cube.scale(0.3,0.3,0.3);

	ang+=0.02;

	positionalLightObject.setTranslate(Math.cos(ang)* 1.5, Math.sin(ang) * 1.5, 0);
	positionalLight.onParametersChanged();


	if(currentShader == null) scene.renderTo(null);
	else scene.renderTo(currentFramebuffer);

	scene.draw();

	/**
	 * PostProcessing shader
	 */

	if(currentShader != lastCurrentShader) {
		postRenderMaterial.clear();
		postRenderMaterial.load(currentShader, "shaders/program/", function(material, shader){

			postRenderMaterial.set("ProjMat", "matrix4x4", 16, postRenderMatrix.elements);

			if(shader.program.u_InSize !== undefined)
				postRenderMaterial.set("InSize", "float", 2, [currentFramebuffer.width, currentFramebuffer.height]);

			if(shader.program.u_OutSize !== undefined)
				postRenderMaterial.set("OutSize", "float", 2, [1.0, 1.0]);

			shader.onPreRender = function(scene, pool){
				// Just in case needed
				pool["DiffuseSampler"] = {name:"DiffuseSampler", type:gl.TEXTURE_2D,  value: currentFramebuffer.texture};
				pool["PrevSampler"] = {name:"PrevSampler", type:gl.TEXTURE_2D,  value: lastFramebuffer.texture};

				// Normal sampler generation
				if(shader.u_NormalSampler != undefined){
					scene.renderTo(normalProgram.framebuffer);
					scene.do("onRender",normalProgram);
					scene.renderTo(currentFramebuffer);
					pool["NormalSampler"] = {name:"NormalSampler", type:gl.TEXTURE_2D,  value: normalProgram.framebuffer.texture};
				}
			};
		});

		lastCurrentShader = currentShader;
	}

	if(currentShader != undefined) {
		postRenderScene.renderTo(swapBuffer);
		postRenderScene.draw();
		finalScene.draw();

		var aux = lastFramebuffer;
		lastFramebuffer = swapBuffer;
		swapBuffer = aux;
	}

	// RESTORE MATRIX
	cube.matrix.set(cubeBackup);

}

function switchProgram(gl, program){
	gl.useProgram(program);
	gl.program = program;
}

function getGL(){
	return gl;
}
