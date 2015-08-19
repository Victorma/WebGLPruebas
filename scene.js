/**
 * Created by Victorma on 11/08/2015.
 */
var Scene = function(gl, lightProgram, shadowProgram) {

    this.gl = gl;
    this.lightProgram = lightProgram;
    this.shadowProgram = shadowProgram;

    this.rootObject = new SceneObject();
    this.lights = [];
    this.shaders = [];

    this.matrixStack = [];
    var identity = new Matrix4();
    identity.setIdentity();
    this.matrixStack.push(identity);
};

/**
 * On Create called just in creation time
 */
Scene.prototype.draw = function(){
    this.do("onPreRender");
    this.do("onPreRender", lightProgram);
    this.do("onRender");
};

Scene.prototype.do = function(call, shader){
    if(shader){
        this.rootObject.onSomething(call, this, shader);
    }else{
        // If no shader, lets clear the main buffer
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0,0, canvas.width, canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.rootObject.onSomething(call, this);
    }
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
