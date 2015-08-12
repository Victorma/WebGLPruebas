/**
 * Created by Victorma on 11/08/2015.
 */
var Scene = function(gl, lightProgram, shadowProgram) {
    this.rootObject = new SceneObject();
    this.lights = [];
    this.shaders = [];

    this.matrixStack = [];
    var identity = new Matrix4();
    identity.setIdentity();
    this.matrixStack.push(identity);
};

Scene.prototype.generateShadows = function(light){
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, light.framebuffer);
    this.gl.viewport(0,0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.onRender(light.program);

};

/**
 * On Create called just in creation time
 */
Scene.prototype.draw = function(){
    var i,j;

    for(i = 0; i< this.lights.length; i++){
        if(this.lights[i].castShadows){
            this.generateShadows(this.lights[i]);
        }

        for(j = 0; j< this.shaders.length; j++){
            this.lights[i].onPreRenderer(this.shaders[j]);
        }
    }

    this.onRender();
};

Scene.prototype.onRender = function(shader){

    if(shader){
        this.rootObject.onRender(this,shader);
    }else{

        // If no shader, lets clear the main buffer
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0,0, canvas.width, canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        for(i = 0; i< this.lights.length; i++){
            if(this.lights[i].castShadows){
                this.generateShadows(this.lights[i]);
            }
        }

        this.rootObject.onRender(this);
    }
};

/**
 * Called for adding new objects to scene
 */
Scene.prototype.addObject = function(o){
    this.rootObject.addObject(o);
    o.setParent(this);
    o.notifyParent();
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
    this.matrixStack.push(this.matrixStack[this.matrixStack.length]);
};

Scene.prototype.multiplyMatrix = function(otherMatrix){
    this.matrixStack[this.matrixStack.length].multiply(otherMatrix);
};

Scene.prototype.popMatrix = function(){
    this.matrixStack.pop();
};

Scene.prototype.peekMatrix = function(){
    return this.matrixStack[this.matrixStack.length];
};
