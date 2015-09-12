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
    loadExternalShader("LightPoint.json", "shaders/render/", function(lightPointShader){
        callbackThis.lightPointShader = lightPointShader.program;
    });

    this.number = Light.LightCount;
    this.type = 0;
    this.enabled = 1;
    this.direction = new Vector3([0.0, 0.0, 1.0]);
    this.color = new Vector3([0.0, 0.0, 0.0]);
    this.range = 1;
    this.casts = 0;
    this.near = 0.05;
    this.far = 100.0;

    this.projection = new Matrix4();
    this.view = new Matrix4();
    this.matrix = new Matrix4();

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

function putImage(gl, destination, width, height){

    var data = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);

    // Create a 2D canvas to store the result
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');

    // Copy the pixels to a 2D canvas
    var imageData = context.createImageData(width, height);
    imageData.data.set(data);
    context.putImageData(imageData, 0, 0);

    var img = document.getElementById(destination);
    img.src = canvas.toDataURL();
}

Light.prototype.recalculate = function(scene){

    this.projection.setIdentity();

    if(this.type == 1){
        this.view.setIdentity();

        this.view.setLookAt(
            this.direction.elements[0]*3,
            this.direction.elements[1]*3,
            this.direction.elements[2]*3,
            0,0,0,0,1,0);
        this.projection.setOrtho(-10, 10, -10, 10, this.near, this.far);
        if(this.framebuffer == null)
            this.framebuffer = initFramebufferObject(this.gl, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT)[0];

        this.matrix = new Matrix4(this.bias).multiply(new Matrix4(this.projection).multiply(new Matrix4(this.view)));

    }else if(this.type == 2 || this.type == 3){
        if(this.view.constructor !== Array){
            this.view = [];
            for(var i = 0; i<6; i++)
                this.view[i] = new Matrix4();
        }

        if(this.framebuffer == null)
            this.framebuffer = initFramebufferObject(this.gl, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, this.gl.TEXTURE_CUBE_MAP);

        var position = new Vector4([0.0, 0.0, 0.0, 1.0]);
        position = scene.peekMatrix().multiplyVector4(position);



        var p = position.elements;

        this.faceDirections = [
            new Vector3([ 1,0,0]), //  X
            new Vector3([-1,0,0]), // -X
            new Vector3([0, 1,0]), //  Y
            new Vector3([0,-1,0]), // -Y
            new Vector3([0,0, 1]), //  Z
            new Vector3([0,0,-1])];// -Z

        this.upDirections = [
            new Vector3([0,-1,0]), //  X
            new Vector3([0,-1,0]), // -X
            new Vector3([0,0, 1]), //  Y
            new Vector3([0,0,-1]), // -Y
            new Vector3([0,-1,0]), //  Z
            new Vector3([0,-1,0])];// -Z

        for(var i = 0; i<6; i++) {
            this.view[i].setIdentity();
            var fd = this.faceDirections[i].elements;
            var ud = this.upDirections[i].elements;
            this.view[i].setLookAt(p[0], p[1], p[2], p[0]+fd[0], p[1]+fd[1], p[2]+fd[2],ud[0],ud[1],ud[2]);
        }

        this.projection.setPerspective(90, OFFSCREEN_WIDTH/OFFSCREEN_HEIGHT, this.near, this.far);

        this.matrix = new Matrix4(this.bias).multiply(new Matrix4(this.projection).multiply(new Matrix4(this.view[4])));
    }
};

/**
 * Draw to be called in draw moment
 */
Light.prototype.onPreRender = function(scene, uniformsPool, shader){

    if(this.needToRecalculate){
        this.needToRecalculate = false;
        this.recalculate(scene);
    }

    if(this.casts && (!shader || !this.framebuffer.shadowsCalculated)) {
        // Lets generate the shadows
        switchProgram(this.gl, this.program);

        this.startShadowCalculation();

        var oldProjection = uniformsPool["ProjMatrix"];
        var oldView = uniformsPool["ViewMatrix"];

        if(this.type == 1){
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
            this.gl.viewport(0, 0, this.framebuffer.width, this.framebuffer.height);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

            uniformsPool["ViewMatrix"] = { "type" : "matrix4x4", "count" : 16, "values" : this.view.elements };
            uniformsPool["ProjMatrix"] = { "type" : "matrix4x4", "count" : 16, "values" : this.projection.elements };

            scene.do("onRender", uniformsPool, this.program);

            //putImage(this.gl, "img"+(this.number), this.framebuffer.width, this.framebuffer.height);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.gl.viewport(0, 0, canvas.width, canvas.height);

        }else if(this.type == 2){
            uniformsPool["ProjMatrix"] = { "type" : "matrix4x4", "count" : 16, "values" : this.projection.elements };
            // Render 6 times for cubemap
            for(var i = 0; i<6; i++){
                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer[i]);
                this.gl.viewport(0, 0, this.framebuffer[i].width, this.framebuffer[i].height);
                this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

                uniformsPool["ViewMatrix"] = { "type" : "matrix4x4", "count" : 16, "values" : this.view[i].elements };

                scene.do("onRender", uniformsPool, this.program);
                //putImage(this.gl, "img"+(this.number + i), this.framebuffer[i].width, this.framebuffer[i].height);
            }

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            this.gl.viewport(0, 0, canvas.width, canvas.height);
        }

        uniformsPool["ProjMatrix"] = oldProjection;
        uniformsPool["ViewMatrix"] = oldView;

        //
        this.endShadowCalculation();
        this.framebuffer.shadowsCalculated = true;
    }

    this.direction.normalize();
    var position = new Vector4([0.0, 0.0, 0.0, 1.0]);
    position = scene.peekMatrix().multiplyVector4(position);
    position = [position.elements[0],position.elements[1], position.elements[2]];

    /*
     * FILL THE UNIFORMS POOL
     */

    var l = "Lights["+this.number+"].";
    uniformsPool[l+"type"] = { "type" : "int", "count" : 1, "values" : [ this.type ]};
    uniformsPool[l+"enabled"] = { "type" : "int", "count" : 1, "values" : [ this.enabled ]};
    uniformsPool[l+"direction"] = { "type" : "float", "count" : 3, "values" : this.direction.elements};
    uniformsPool[l+"position"] = { "type" : "float", "count" : 3, "values" : position};
    uniformsPool[l+"color"] = { "type" : "float", "count" : 3, "values" : this.color.elements};
    uniformsPool[l+"range"] = { "type" : "float", "count" : 1, "values" : [ this.range ]};
    uniformsPool[l+"casts"] = { "type" : "int", "count" : 1, "values" : [ this.casts ]};
    uniformsPool[l+"near"] = { "type" : "float", "count" : 1, "values" : [ this.near ]};
    uniformsPool[l+"far"] = { "type" : "float", "count" : 1, "values" : [ this.far ]};
    uniformsPool[l+"matrix"] = { "type" : "matrix4x4", "count" : 16, "values" : this.matrix.elements };
    uniformsPool["NumLights"] = { "type" : "int", "count" : 1, "values" : [ Light.LightCount ]};

    var lt = (this.type == 2) ? this.gl.TEXTURE_CUBE_MAP : this.gl.TEXTURE_2D;
    var s = (this.type == 2) ? "ShadowsCube["+this.number+"]" : "Shadows["+this.number+"]";
    var t = (this.type == 2) ? this.framebuffer[0].texture : this.framebuffer.texture;
    uniformsPool[s] = { "type" : lt, "value" : t};

};


Light.prototype.onPostRender = function(scene, shader){


    if(!shader) { // Standard onRender call is performed without any shader

        if(this.lightPointShader) {
            // TODO update this to new format
            switchProgram(this.gl, this.lightPointShader);

            this.gl.vertexAttrib4f(this.lightPointShader.a_Position, 0.0, 0.0, 0.0, 1.0);
            this.gl.uniform3fv(this.lightPointShader.u_Color, this.color.elements);
            this.gl.uniformMatrix4fv(this.lightPointShader.u_ModelMatrix, false, scene.peekMatrix().elements);
            this.gl.uniformMatrix4fv(this.lightPointShader.u_ViewMatrix, false, Camera.main.view.elements);
            this.gl.uniformMatrix4fv(this.lightPointShader.u_ProjMatrix, false, Camera.main.projection.elements);

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