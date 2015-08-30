/**
 * Created by Victorma on 27/08/2015.
 */
var Material = function(gl, program) {

    /**
     * Context
     */
    this.gl = gl;
    this.program = program;


    this.onCreate();
    this.onChangeProgram();
};

/**
 * On Create called just in creation time
 */
Material.prototype.onCreate = function(){

};

/**
 * On Change program should be called when program is changed
 */
Material.prototype.onChangeProgram = function(){

};

Material.prototype.onPreRender = function(scene, shader){


    var bcShader;
    if(shader){
        bcShader = this.program;
        this.program = shader;
    }

    if(this.gl.program != this.program)
        switchProgram(this.gl, this.program);

    // Pre Render

    if(this.program)


    // End Pre Render

    if(shader)
        this.program = bcShader;
};
/**
 * Draw to be called in draw moment
 */
Material.prototype.onRender = function(scene, shader){

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
Material.prototype.onDestroy = function(){

};