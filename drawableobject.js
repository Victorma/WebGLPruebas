var DrawableObject = function(gl, a_Position, a_Color, a_Uv, u_ModelMatrix) {

	/**
	 * Context
	 */
	this.gl = gl;
	this.a_Position = a_Position;
	this.a_Color = a_Color;
	this.a_Uv = a_Uv;
	this.u_ModelMatrix = u_ModelMatrix;
	
	/**
	 * Form
	 */
	
	this.triangles;
	this.uvs;
	this.colors;
	this.vertices;	

	/**
	 * Matrix
	 */

	this.matrix;
	
	/**
	 * Buffers
	 */

	this.bufferUvs;
	this.bufferColors;
	this.bufferVertices;
	this.bufferTriangles;
	
	/**
	 * initialization
	 */
	 
	 this.onCreate();
};

/**
 * On Create called just in creation time
 */
DrawableObject.prototype.onCreate = function(){

	this.matrix = new Matrix4();
	this.matrix.setIdentity();

	this.bufferUvs = this.gl.createBuffer();
	this.bufferVertices = this.gl.createBuffer();
	this.bufferColors = this.gl.createBuffer();
	this.bufferTriangles = this.gl.createBuffer();
};

/**
 * On Change points should be called when points are changed
 */
DrawableObject.prototype.onChangePoints = function(){
	this.nElem = putBuffer(this.gl, this.gl.ARRAY_BUFFER, this.bufferVertices, this.vertices, 3);
	putBuffer(this.gl, this.gl.ARRAY_BUFFER, this.bufferUvs, this.uvs, 2);
	putBuffer(this.gl, this.gl.ARRAY_BUFFER, this.bufferColors, this.colors, 4);
	putBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, this.bufferTriangles, this.triangles, 2);
};

/**
 * Draw to be called in draw moment
 */
DrawableObject.prototype.draw = function(){

	enableBuffer(this.gl, this.bufferVertices, this.a_Position);
	enableBuffer(this.gl, this.bufferUvs, this.a_Uv);
	enableBuffer(this.gl, this.bufferColors, this.a_Color);
	enableBuffer(this.gl, this.bufferTriangles);

	this.gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.matrix.elements);

	//this.gl.drawArrays(this.gl.TRIANGLES, false, this.nElem);
	this.gl.drawElements(this.gl.TRIANGLES, this.triangles.length, this.gl.UNSIGNED_BYTE, 0);
};

/**
 * On destroy destroys all buffers and temp vars
 */
DrawableObject.prototype.onDestroy = function(){
	this.gl.destroyBuffer(this.bufferUvs);
	this.gl.destroyBuffer(this.bufferVertices);
	this.gl.destroyBuffer(this.bufferColors);
	this.gl.destroyBuffer(this.bufferVertices);
};