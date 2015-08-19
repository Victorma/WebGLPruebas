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

    this.framebuffer = initFramebufferObject(this.gl);

    Light.LightCount++;
};

/**
 * On Destroy called just in destroy moment
 */
Light.prototype.onDestroy = function(){
    Light.LightCount--;
};

/**
 * On Change program should be called when program is changed
 */
Light.prototype.onChangeProgram = function(){
    switchProgram(this.gl, this.program);
    this.gl.activeTexture(glTextureIndex(this.gl, this.number));
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.framebuffer.texture);
};

/**
 * Draw to be called in draw moment
 */
Light.prototype.onPreRender = function(scene, shader){

    if((!shader || !this.framebuffer.shadowsCalculated) && this.casts) {
        // Lets generate the shadows
        switchProgram(this.gl, this.program);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
        this.gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.startShadowCalculation();
        scene.do("onRender", this.program);
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

        var position = new Vector3([0.0, 0.0, 0.0]);
        position = scene.peekMatrix().multiplyVector3(position);
        this.gl.uniform3fv(this.program.u_Lights[this.number].position, position.elements);
        this.gl.uniform3fv(this.program.u_Lights[this.number].color, this.color.elements);
        this.gl.uniform1f(this.program.u_Lights[this.number].range, this.range);
        this.gl.uniform1i(this.program.u_Lights[this.number].casts, this.casts);

        this.gl.uniform1i(this.program.u_Lights[this.number].shadows, this.number); // Pass gl.TEXTURE0

        var viewMatrix = new Matrix4();
        viewMatrix.setIdentity();
        viewMatrix.setLookAt(position.elements[0], position.elements[1], position.elements[2], 0,0,0,0,1,0);

        this.gl.uniformMatrix4fv(this.program.u_Lights[this.number].matrix, false, viewMatrix.elements);

        this.gl.uniform1i(this.program.u_NumLights, Light.LightsConfigured);
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

        if(this.program.u_ViewMatrix)
            this.gl.uniformMatrix4fv(this.program.u_ViewMatrix, false, scene.peekMatrix().elements);

        if(shader) {
            this.program = bcShader;
        }
    }

    if(!shader) { // Standard onRender call is performed without any shader

        if(this.lightPointShader) {
            switchProgram(this.gl, this.lightPointShader);

            this.gl.vertexAttrib4f(this.lightPointShader.a_Position, 0.0, 0.0, 0.0, 1.0);
            this.gl.uniform3fv(this.lightPointShader.u_Color, this.color.elements);
            this.gl.uniformMatrix4fv(this.lightPointShader.u_ModelMatrix, false, scene.peekMatrix().elements);
            this.gl.uniformMatrix4fv(this.lightPointShader.u_ViewMatrix, false, camera.elements);
            this.gl.uniformMatrix4fv(this.lightPointShader.u_ProjMatrix, false, projection.elements);

            this.gl.drawArrays(this.gl.POINTS, 0, 1);
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