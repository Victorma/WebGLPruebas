/**
 * Created by Victorma on 11/08/2015.
 */
var Scene = function(gl) {

    this.gl = gl;

    this.rootObject = new SceneObject();
    this.lights = [];
    this.shaders = [];

    this.matrixStack = [];
    this.identity = new Matrix4();
    this.identity.setIdentity();
    this.matrixStack.push(this.identity);

    this.framebuffer = null;
};

Scene.prototype.bind = function(){
    var width = canvas.width,
        height = canvas.height;

    if(this.framebuffer != null){
        width = this.framebuffer.width;
        height = this.framebuffer.height;
    }

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.framebuffer);
    this.gl.viewport(0, 0, width, height);
};

/**
 * On Create called just in creation time
 */
Scene.prototype.draw = function(){

    var pool = {};

    // Lets put the camera in the pool :D
    pool["ViewMatrix"] = { "type" : "matrix4x4", "count" : 16, "values" : Camera.main.view.elements };
    pool["ProjMatrix"] = { "type" : "matrix4x4", "count" : 16, "values" : Camera.main.projection.elements };

    //Skybox
    /*if(Camera.main.skybox){
        pool["SkyBox"] = { "type" : "matrix4x4", "count" : 16, "values" : Camera.main.skybox };
        Camera.main.renderSkybox();
    }*/

    // Prerender things
    this.do("onPreRender", pool);

    // Render things
    this.bind();
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    //Skybox
    if(Camera.main.skybox){
        pool["SkyBox"] = { "name" : "Skybox", "type" : gl.TEXTURE_CUBE_MAP, "value" : Camera.main.skybox };
        Camera.main.renderSkybox();
    }
    this.do("onRender", pool);

    // PostRender things
    this.do("onPostRender");
};

Scene.prototype.do = function(call, pool, shader){
    var oldMatrixStack = this.matrixStack;
    this.matrixStack = [];
    this.matrixStack.push(this.identity);

    if(shader){
        this.rootObject.onSomething(call, this, pool, shader);
    }else{
        // If no shader, lets clear the main buffer
        this.rootObject.onSomething(call, this, pool);
    }

    this.matrixStack = oldMatrixStack;
};

/**
 * Called for adding new objects to scene
 */
Scene.prototype.addObject = function(o){
    this.rootObject.addObject(o);
};

Scene.prototype.removeObject = function(o){
    this.rootObject.removeObject(o);
};

Scene.prototype.onObjectUpdate = function(objectUpdated, componentAdded){
    if(componentAdded instanceof Light){
        this.lights.push(componentAdded);
    }else if(componentAdded instanceof Renderer && componentAdded.program !== undefined){
        if(!this.shaders.contains(componentAdded.program))
            this.shaders.push(componentAdded.program);
    }
};

Scene.prototype.pushMatrix = function(){
    this.matrixStack.push(new Matrix4(this.peekMatrix()));
};

Scene.prototype.multiplyMatrix = function(otherMatrix){
    this.matrixStack[this.matrixStack.length-1].multiply(otherMatrix);
};

Scene.prototype.popMatrix = function(){
    this.matrixStack.pop();
};

Scene.prototype.peekMatrix = function(){
    return this.matrixStack[this.matrixStack.length-1];
};

Scene.prototype.renderTo = function(framebuffer){
    this.framebuffer = framebuffer;
};
