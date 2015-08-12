/**
 * Created by Victorma on 12/08/2015.
 */
var Light = function(gl) {

    /**
     * Context
     */
    this.gl = gl;
    this.program = program;

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
    this.onChangeProgram();
};

/**
 * On Create called just in creation time
 */
Light.prototype.onCreate = function(){

    this.bufferUvs = this.gl.createBuffer();
    this.bufferVertices = this.gl.createBuffer();
    this.bufferColors = this.gl.createBuffer();
    this.bufferNormals = this.gl.createBuffer();
    this.bufferTriangles = this.gl.createBuffer();
};

/**
 * On Change program should be called when program is changed
 */
Light.prototype.onChangeProgram = function(){
    // Program management

    this.a_Position = this.gl.getAttribLocation(lightProgram, "a_Position");
    this.a_Uv = this.gl.getAttribLocation(lightProgram, "a_Uv");
    this.a_Color = this.gl.getAttribLocation(lightProgram, "a_Color");
    this.a_Normal  = this.gl.getAttribLocation(lightProgram, "a_Normal");

    this.u_ModelMatrix = this.gl.getUniformLocation(this.program, 'u_ModelMatrix');
    this.u_NormalMatrix = this.gl.getUniformLocation(this.program, 'u_NormalMatrix');

};

/**
 * On Change points should be called when points are changed
 */
Light.prototype.onChangePoints = function(){
    this.nElem = putBuffer(this.gl, this.gl.ARRAY_BUFFER, this.bufferVertices, this.vertices, 3);
    putBuffer(this.gl, this.gl.ARRAY_BUFFER, this.bufferUvs, this.uvs, 2);
    putBuffer(this.gl, this.gl.ARRAY_BUFFER, this.bufferColors, this.colors, 4);
    putBuffer(this.gl, this.gl.ELEMENT_ARRAY_BUFFER, this.bufferTriangles, this.triangles, 2);

    this.regenerateNormals();
    putBuffer(this.gl, this.gl.ARRAY_BUFFER, this.bufferNormals, this.normals, 3);
};


/**
 * Draw to be called in draw moment
 */
Light.prototype.onPreRenderer = function(lightNumber, shader){

    var bcShader;
    if(shader){
        bcShader = this.program;
        this.program = shader;
    }

    if(this.gl.program != this.program) {
        switchProgram(this.gl, this.program);
    }

    if(this.program.a_Position !== undefined)
        enableBuffer(this.gl, this.bufferVertices, this.program.a_Position);
    if(this.program.a_Uv !== undefined)
        enableBuffer(this.gl, this.bufferUvs, this.program.a_Uv);
    if(this.program.a_Color !== undefined)
        enableBuffer(this.gl, this.bufferColors, this.program.a_Color);
    if(this.program.a_Normal !== undefined)
        enableBuffer(this.gl, this.bufferNormals, this.program.a_Normal);

    enableBuffer(this.gl, this.bufferTriangles);

    if(this.program.u_ModelMatrix)
        this.gl.uniformMatrix4fv(this.program.u_ModelMatrix, false, scene.peekMatrix().elements);

    if(this.program.u_NormalMatrix){
        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(scene.peekMatrix());
        normalMatrix.transpose();
        this.gl.uniformMatrix4fv(this.program.u_NormalMatrix, false, normalMatrix.elements);
    }

    //this.gl.drawArrays(this.gl.TRIANGLES, false, this.nElem);
    this.gl.drawElements(this.gl.TRIANGLES, this.triangles.length, this.gl.UNSIGNED_BYTE, 0);

    if(shader){
        this.program = bcShader;
    }
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