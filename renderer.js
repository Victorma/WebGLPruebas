var Renderer = function(gl) {

	/**
	 * Context
	 */
	this.gl = gl;

	/**
	 * Form
	 */

	//this.triangles;
	//this.uvs;
	//this.colors;
	//this.vertices;

	/**
	 * Matrix
	 */

	//this.matrix;

	/**
	 * Buffers
	 */

	//this.bufferUvs;
	//this.bufferColors;
	//this.bufferVertices;
	//this.bufferTriangles;

	/**
	 * initialization
	 */

	this.onCreate();
};

/**
 * On Create called just in creation time
 */
Renderer.prototype.onCreate = function(){

	this.bufferUvs = this.gl.createBuffer();
	this.bufferVertices = this.gl.createBuffer();
	this.bufferColors = this.gl.createBuffer();
	this.bufferNormals = this.gl.createBuffer();
	this.bufferTriangles = this.gl.createBuffer();
};

Renderer.prototype.loadObj = function(obj){
	this.ready = false;
	var renderer = this;

	K3D.load(obj, function(data){
		var m = K3D.parse.fromOBJ(data);

		var ind = [];
		for(var i=0; i<m.i_verts.length; i++) ind.push(i);
		var colors = [];
		for(var i=0; i<m.i_verts.length; i++){
			colors.push(1.0); colors.push(1.0); colors.push(1.0); colors.push(1.0);
		}

		//	I need to index vertices and UVT with the same indices... 0, 1, 2, ...
		renderer.vertices = new Float32Array(K3D.edit.unwrap(m.i_verts, m.c_verts, 3));
		renderer.colors = new Float32Array(colors);
		renderer.uvs = new Float32Array(K3D.edit.unwrap(m.i_uvt  , m.c_uvt  , 2));
		renderer.normals = new Float32Array(K3D.edit.unwrap(m.i_norms  , m.c_norms  , 3));
		renderer.triangles = new Uint16Array(ind);
		renderer.onChangePoints(false);
	});
};

/**
 * On Change points should be called when points are changed
 */
Renderer.prototype.onChangePoints = function(opt_normals){
	if(opt_normals === undefined)
		opt_normals = true;

	this.nElem = putBuffer(this.gl, this.gl.ARRAY_BUFFER, this.bufferVertices, this.vertices, 3);
	putBuffer(this.gl, this.gl.ARRAY_BUFFER, this.bufferUvs, this.uvs, 2);
	putBuffer(this.gl, this.gl.ARRAY_BUFFER, this.bufferColors, this.colors, 4);
	putBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, this.bufferTriangles, this.triangles, 2);

	if(opt_normals) this.regenerateNormals();
	putBuffer(this.gl, this.gl.ARRAY_BUFFER, this.bufferNormals, this.normals, 3);
	this.ready = true;
};

Renderer.prototype.regenerateNormals = function(){

	var normalsAux = [];

	for(var i = 0; i<this.triangles.length; i+=3){
		var t1 = this.triangles[i],
			t2 = this.triangles[i+1],
			t3 = this.triangles[i+2];

		t1 *= 3;
		t2 *= 3;
		t3 *= 3;

		var P1 = [this.vertices[t1], this.vertices[t1+1], this.vertices[t1+2]],
			P2 = [this.vertices[t2], this.vertices[t2+1], this.vertices[t2+2]],
			P3 = [this.vertices[t3], this.vertices[t3+1], this.vertices[t3+2]];

		var V = [P2[0] - P1[0], P2[1] - P1[1], P2[2] - P1[2]];
			W = [P3[0] - P1[0], P3[1] - P1[1], P3[2] - P1[2]];


		var N = productoEscalar(V,W);
		N.normalize();

		normalsAux[t1]   = N.elements[0];
		normalsAux[t1+1] = N.elements[1];
		normalsAux[t1+2] = N.elements[2];

		normalsAux[t2]   = N.elements[0];
		normalsAux[t2+1] = N.elements[1];
		normalsAux[t2+2] = N.elements[2];

		normalsAux[t3]   = N.elements[0];
		normalsAux[t3+1] = N.elements[1];
		normalsAux[t3+2] = N.elements[2];
	}

	this.normals = new Float32Array(normalsAux);
};

/**
 * Draw to be called in draw moment
 */
Renderer.prototype.onRender = function(scene, uniformsPool, shader){

	if(!this.ready)
		return;

	var material = this.sceneObject.getComponent(Material);

	var normalMatrix = new Matrix4();
	normalMatrix.setInverseOf(scene.peekMatrix());
	normalMatrix.transpose();

	uniformsPool["ModelMatrix"] = { "type" : "matrix4x4", "count" : 16, "values" : scene.peekMatrix().elements };
	uniformsPool["NormalMatrix"] = { "type" : "matrix4x4", "count" : 16, "values" : normalMatrix.elements };

	if(shader){
		switchProgram(gl, shader);
		configureShaderUniforms(uniformsPool, shader, this.gl);
		this.draw(shader);
	}else{
		if(material === undefined)
			return;

		material.iterate();
		while(material.hasNext()){
			materialShader = material.next();
			shader = material.getProgram();
			if(shader === undefined)
				return;

			materialShader.onPreRender(scene, uniformsPool);
			material.configure(uniformsPool);
			this.draw(shader);
			materialShader.onPostRender(scene, uniformsPool);
		}
	}
};

Renderer.prototype.draw = function(shader){
	if(shader.a_Position !== undefined)
		enableBuffer(this.gl, this.bufferVertices, shader.a_Position);
	if(shader.a_Uv !== undefined)
		enableBuffer(this.gl, this.bufferUvs, shader.a_Uv);
	if(shader.a_Color !== undefined)
		enableBuffer(this.gl, this.bufferColors, shader.a_Color);
	if(shader.a_Normal !== undefined)
		enableBuffer(this.gl, this.bufferNormals, shader.a_Normal);

	enableBuffer(this.gl, this.bufferTriangles);

	//this.gl.drawArrays(this.gl.TRIANGLES, false, this.nElem);
	this.gl.drawElements(this.gl.TRIANGLES, this.triangles.length, this.gl.UNSIGNED_SHORT, 0);
};

/**
 * On destroy destroys all buffers and temp vars
 */
Renderer.prototype.onDestroy = function(){
	this.gl.destroyBuffer(this.bufferUvs);
	this.gl.destroyBuffer(this.bufferVertices);
	this.gl.destroyBuffer(this.bufferColors);
	this.gl.destroyBuffer(this.bufferVertices);
};