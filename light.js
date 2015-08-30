/**
 * Created by Victorma on 12/08/2015.
 */
var Light = function(gl, program) {

    /**
     * Context
     */
    this.gl = gl;
    this.program = program;

    /**
     * initialization
     */

    this.onCreate();
    this.onChangeProgram();
};

Light.LightCount = 0;
Light.LightsConfigured = 0;

/**
 * On Create called just in creation time
 */
Light.prototype.onCreate = function(){

    var callbackThis = this;
    createProgramFiles(this.gl, "LightPoint.vert", "LightPoint.frag", function(lightPointShader){

        switchProgram(callbackThis.gl, callbackThis.lightPointShader);

        lightPointShader.u_ViewMatrix = callbackThis.gl.getUniformLocation(lightPointShader, 'u_ViewMatrix');
        lightPointShader.u_ProjMatrix = callbackThis.gl.getUniformLocation(lightPointShader, 'u_ProjMatrix');
        lightPointShader.u_ModelMatrix = callbackThis.gl.getUniformLocation(lightPointShader, "u_ModelMatrix");

        lightPointShader.u_Color = callbackThis.gl.getUniformLocation(lightPointShader, "u_Color");

        lightPointShader.a_Position = callbackThis.gl.getAttribLocation(lightPointShader, "a_Position");

        callbackThis.lightPointShader = lightPointShader;
    });

    this.number = Light.LightCount;
    this.type = 0;
    this.enabled = 1;
    this.direction = new Vector3([0.0, 0.0, 1.0]);
    this.color = new Vector3([0.0, 0.0, 0.0]);
    this.range = 1;
    this.casts = 0;

    this.bias = new Matrix4({
        elements : [0.5, 0.0, 0.0, 0.0,
            0.0, 0.5, 0.0, 0.0,
            0.0, 0.0, 0.5, 0.0,
            0.5, 0.5, 0.5, 1.0]
    });

    Light.LightCount++;
};

/**
 * On Destroy called just in destroy moment
 */
Light.prototype.onDestroy = function(){
    Light.LightCount--;
};

Light.prototype.onParametersChanged = function(){
    this.needToRecalculate = true;
};

/**
 * On Change program should be called when program is changed
 */
Light.prototype.onChangeProgram = function(){
    switchProgram(this.gl, this.program);
};

function putImage(gl, destination){

    var data = new Uint8Array(OFFSCREEN_WIDTH * OFFSCREEN_HEIGHT * 4);
    gl.readPixels(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, gl.RGBA, gl.UNSIGNED_BYTE, data);

    // Create a 2D canvas to store the result
    var canvas = document.createElement('canvas');
    canvas.width = OFFSCREEN_WIDTH;
    canvas.height = OFFSCREEN_HEIGHT;
    var context = canvas.getContext('2d');

    // Copy the pixels to a 2D canvas
    var imageData = context.createImageData(OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
    imageData.data.set(data);
    context.putImageData(imageData, 0, 0);

    var img = document.getElementById(destination);
    img.src = canvas.toDataURL();
}

/**
 * Draw to be called in draw moment
 */
Light.prototype.onPreRender = function(scene, shader){


    if(this.needToRecalculate){
        this.needToRecalculate = false;

        this.projection = new Matrix4();
        this.view = new Matrix4();
        this.projection.setIdentity();
        this.view.setIdentity();

        if(this.type == 1){
            this.view.setLookAt(
                this.direction.elements[0]*3,
                this.direction.elements[1]*3,
                this.direction.elements[2]*3,
                0,0,0,0,1,0);
            this.projection.setOrtho(-10, 10, -10, 10, 0.01 , 100);

            this.framebuffer = initFramebufferObject(this.gl)[0];
            this.matrix = new Matrix4(this.bias).multiply(new Matrix4(this.projection).multiply(new Matrix4(this.view)));

        }else if(this.type == 2 || this.type == 3){
            var position = new Vector4([0.0, 0.0, 0.0, 1.0]);
            position = scene.peekMatrix().multiplyVector4(position);

            this.view = [];

            var p = position.elements;

            this.faceDirections = [
                new Vector3([ 1,0,0]), //  X
                new Vector3([-1,0,0]), // -X
                new Vector3([0, 1,0]), //  Y
                new Vector3([0,-1,0]), // -Y
                new Vector3([0,0, 1]), //  Z
                new Vector3([0,0,-1])];// -Z

            this.upDirections = [
                new Vector3([ 0,1,0]), //  X
                new Vector3([ 0,1,0]), // -X
                new Vector3([-1,0,0]), //  Y
                new Vector3([ 1,0,0]), // -Y
                new Vector3([ 0,1,0]), //  Z
                new Vector3([ 0,1,0])];// -Z

            for(var i = 0; i<6; i++) {
                this.view[i] = new Matrix4();
                this.view[i].setIdentity();
                var fd = this.faceDirections[i].elements;
                var ud = this.upDirections[i].elements;
                this.view[i].setLookAt(p[0], p[1], p[2], p[0]+fd[0], p[1]+fd[1], p[2]+fd[2],ud[0],ud[1],ud[2]);
            }

            this.projection.setPerspective(90, OFFSCREEN_WIDTH/OFFSCREEN_HEIGHT, 1, 100);
            this.framebuffer = initFramebufferObject(this.gl, this.gl.TEXTURE_CUBE_MAP);
            this.matrix = /*new Matrix4(this.bias).multiply*/(new Matrix4(this.projection).multiply(new Matrix4(this.view[0])));
        }


        //this.matrix = /*this.bias.multiply*/(this.projection.multiply(this.view));
    }

    if((!shader || !this.framebuffer.shadowsCalculated) && this.casts) {
        // Lets generate the shadows
        switchProgram(this.gl, this.program);

        this.startShadowCalculation();

        if(this.type == 1){
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
            this.gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);


            this.gl.uniformMatrix4fv(this.program.u_ProjMatrix, false, this.projection.elements);
            this.gl.uniformMatrix4fv(this.program.u_ViewMatrix, false, this.view.elements);

            scene.do("onRender", this.program);

            putImage(this.gl, "img"+(this.number));
        }else if(this.type == 2){
            this.gl.uniformMatrix4fv(this.program.u_ProjMatrix, false, this.projection.elements);
            // Render 6 times for cubemap
            for(var i = 0; i<6; i++){
                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer[i]);
                this.gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
                this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

                this.gl.uniformMatrix4fv(this.program.u_ViewMatrix, false, this.view[i].elements);
                scene.do("onRender", this.program);
                //putImage(this.gl, "img"+(this.number+i));
            }
        }

        //

        this.endShadowCalculation();
        this.framebuffer.shadowsCalculated = true;
    }

    var bcShader;
    if(shader){
        bcShader = this.program;
        this.program = shader;
    }

    if(this.gl.program != this.program) {
        switchProgram(this.gl, this.program);
    }

    if(this.program.u_Lights !== undefined && this.program.u_Lights[this.number] !== undefined) {
        this.gl.uniform1i(this.program.u_Lights[this.number].type, this.type);
        this.gl.uniform1i(this.program.u_Lights[this.number].enabled, this.enabled);
        this.direction.normalize();
        this.gl.uniform3fv(this.program.u_Lights[this.number].direction, this.direction.elements);

        var position = new Vector4([0.0, 0.0, 0.0, 1.0]);
        position = scene.peekMatrix().multiplyVector4(position);
        this.gl.uniform3f(this.program.u_Lights[this.number].position, position.elements[0],position.elements[1], position.elements[2]);
        this.gl.uniform3fv(this.program.u_Lights[this.number].color, this.color.elements);
        this.gl.uniform1f(this.program.u_Lights[this.number].range, this.range);
        this.gl.uniform1i(this.program.u_Lights[this.number].casts, this.casts);

        this.gl.activeTexture(glTextureIndex(this.gl, this.number));
        if(this.type == 1){
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.framebuffer.texture);
            this.gl.uniform1i(this.program.u_Lights[this.number].shadows, this.number); // Pass gl.TEXTURE0
        }else if(this.type == 2){
            this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.framebuffer[0].texture);
            this.gl.uniform1i(this.program.u_Lights[this.number].shadowsCube, this.number); // Pass gl.TEXTURE0
        }

        this.gl.uniformMatrix4fv(this.program.u_Lights[this.number].matrix, false, this.matrix.elements);

        this.gl.uniform1i(this.program.u_NumLights, Light.LightCount);
    }

    if(shader){
        this.program = bcShader;
    }
};

Light.prototype.onRender = function(scene, shader){

    if(this.isCalculatingShadows){
        var bcShader;
        if(shader){
            bcShader = this.program;
            this.program = shader;
        }

        if(this.gl.program != this.program) {
            switchProgram(this.gl, this.program);
        }

        if(shader) {
            this.program = bcShader;
        }
    }
};

Light.prototype.onPostRender = function(scene, shader){


    if(!shader) { // Standard onRender call is performed without any shader

        if(this.lightPointShader) {
            switchProgram(this.gl, this.lightPointShader);

            this.gl.vertexAttrib4f(this.lightPointShader.a_Position, 0.0, 0.0, 0.0, 1.0);
            this.gl.uniform3fv(this.lightPointShader.u_Color, this.color.elements);
            this.gl.uniformMatrix4fv(this.lightPointShader.u_ModelMatrix, false, scene.peekMatrix().elements);
            this.gl.uniformMatrix4fv(this.lightPointShader.u_ViewMatrix, false, camera.elements);
            this.gl.uniformMatrix4fv(this.lightPointShader.u_ProjMatrix, false, projection.elements);

            this.gl.depthMask(false);

            this.gl.drawArrays(this.gl.POINTS, 0, 1);

            this.gl.depthMask(true);
        }

        this.framebuffer.shadowsCalculated = false;

    }
};

Light.prototype.startShadowCalculation = function(){
    this.isCalculatingShadows = true;
};

Light.prototype.endShadowCalculation = function(){
    this.isCalculatingShadows = false;
};