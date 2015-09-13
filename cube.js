var cubeVertices = new Float32Array([ // Vertex coordinates
	 1.0, 1.0, 1.0, 	-1.0, 1.0, 1.0, 	-1.0,-1.0, 1.0,	  1.0,-1.0, 1.0,
	 1.0, 1.0, 1.0, 	 1.0,-1.0, 1.0, 	 1.0,-1.0,-1.0,	  1.0, 1.0,-1.0,
	 1.0, 1.0, 1.0, 	 1.0, 1.0,-1.0, 	-1.0, 1.0,-1.0,	 -1.0, 1.0, 1.0,
	-1.0,-1.0,-1.0, 	-1.0,-1.0, 1.0, 	-1.0, 1.0, 1.0,	 -1.0, 1.0,-1.0,
	-1.0,-1.0,-1.0, 	 1.0,-1.0,-1.0, 	 1.0,-1.0, 1.0,	 -1.0,-1.0, 1.0,
	 1.0,-1.0,-1.0, 	-1.0,-1.0,-1.0,		-1.0, 1.0,-1.0,	  1.0, 1.0,-1.0
]);

var cubeColors = new Float32Array([ // Vertex coordinates
	 1.0, 0.0, 0.0, 1.0,	 1.0, 0.0, 0.0, 1.0,	1.0, 0.0, 0.0, 1.0, 	1.0, 0.0, 0.0, 1.0,
	 0.0, 1.0, 0.0, 1.0,	 0.0, 1.0, 0.0, 1.0,	0.0, 1.0, 0.0, 1.0, 	0.0, 1.0, 0.0, 1.0,	
	 0.0, 0.0, 1.0, 1.0,	 0.0, 0.0, 1.0, 1.0,	0.0, 0.0, 1.0, 1.0, 	0.0, 0.0, 1.0, 1.0,	
	 1.0, 1.0, 0.0, 1.0,	 1.0, 1.0, 0.0, 1.0,	1.0, 1.0, 0.0, 1.0, 	1.0, 1.0, 0.0, 1.0,	
	 0.0, 1.0, 1.0, 1.0,	 0.0, 1.0, 1.0, 1.0,	0.0, 1.0, 1.0, 1.0, 	0.0, 1.0, 1.0, 1.0,	
	 1.0, 0.0, 1.0, 1.0,	 1.0, 0.0, 1.0, 1.0,	1.0, 0.0, 1.0, 1.0, 	1.0, 0.0, 1.0, 1.0
]);

var skyboxUVs = new Float32Array([ // Vertex coordinates
	0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0,
	0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0,
	0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0,
	0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0,
	0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0,
	0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0
]);

var cubeUVs = new Float32Array([ // Vertex coordinates
	0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0,
	0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0,
	0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0,
	0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0,
	0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0,
	0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0
]);

var cubeIndexes = new Uint16Array([
	0, 1, 2, 0, 2, 3, // front
	4, 5, 6, 4, 6, 7, // right
	8, 9, 10, 8, 10, 11, // up
	12, 13, 14, 12, 14, 15, // left
	16, 17, 18, 16, 18, 19, // down
	20, 21, 22, 20, 22, 23 // back
]);

function createCube(gl, program){
	var sceneObject = new SceneObject(gl, program);
	var renderer = new Renderer(gl, program);

	renderer.triangles = cubeIndexes;
	renderer.vertices = cubeVertices;
	renderer.colors = cubeColors;
	renderer.uvs = cubeUVs;
	renderer.onChangePoints();

	sceneObject.addComponent(renderer);
	
	return sceneObject;
};

function createSkybox(gl){
	var sceneObject = new SceneObject(gl);
	var renderer = new Renderer(gl);

	renderer.triangles = cubeIndexes;
	renderer.vertices = cubeVertices;
	renderer.colors = cubeColors;
	renderer.uvs = cubeUVs;
	renderer.onChangePoints();

	sceneObject.addComponent(renderer);

	return sceneObject;
};