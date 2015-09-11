var SceneObject = function(gl) {

    /**
     * Context
     */
    this.gl = gl;


    /**
     * initialization
     */

    this.onCreate();
};

/**
 * On Create called just in creation time
 */
SceneObject.prototype.onCreate = function(){

    this.matrix = new Matrix4();
    this.matrix.setIdentity();
    this.childs = [];
    this.components = [];

};

/**
 * Draw to be called in draw moment
 */
SceneObject.prototype.setTranslate =    function(x,y,z){ this.matrix.setTranslate(x,y,z);};
SceneObject.prototype.setScale =        function(x,y,z){ this.matrix.setScale(x,y,z);};
SceneObject.prototype.setRotate =       function(angle, x,y,z){ this.matrix.setRotate(angle, x,y,z);};
SceneObject.prototype.translate =       function(x,y,z){ this.matrix.translate(x,y,z);};
SceneObject.prototype.scale =           function(x,y,z){ this.matrix.scale(x,y,z);};
SceneObject.prototype.rotate =          function(angle, x,y,z){ this.matrix.rotate(angle, x,y,z);};

SceneObject.prototype.addObject = function(o){
    if(this.childs.indexOf(o) == -1) {
        this.childs.push(o);
        o.setParent(this);
    }
};

SceneObject.prototype.setParent = function(parent){
    if(this.parent)
        this.parent.removeObject(this);

    this.parent = parent;
    this.parent.addObject(this);
};

SceneObject.prototype.removeObject = function(o){
    this.childs.remove(o);
};

SceneObject.prototype.notifyParent = function(){
    var i;

    if(this.parent){
        for(i = 0; i < this.childs.length; i++){
            this.childs[i].notifyParent();
        }

        for(i = 0; i< this.components.length; i++){
            this.parent.onObjectUpdate(this, this.components[i]);
        }
    }
};

SceneObject.prototype.onObjectUpdate = function(object, component) {
    if(this.parent)
        this.parent.onObjectUpdate(this, component);
};


SceneObject.prototype.getComponent = function(type){
    for(var c in this.components)
        if(this.components[c] instanceof type)
            return this.components[c];

    return undefined;
};

SceneObject.prototype.addComponent = function(component){
    this.components.push(component);
    component.sceneObject = this;
    this.onObjectUpdate(this,component);
};

/**
 LIFECICLE
 OnSomething can be OnPreRender, OnRender, OnPostRender, etc.
 */

SceneObject.prototype.onSomething = function(call, scene, pool, shader){
    if(this.components.length == 0 && this.childs.length == 0)
        return;

    scene.pushMatrix();
    scene.multiplyMatrix(this.matrix);

    var i;
    for(i = 0; i<this.components.length; i++){
        if(this.components[i][call])
            this.components[i][call](scene, pool, shader);
    }

    for(i = 0; i<this.childs.length; i++){
        this.childs[i].onSomething(call, scene, pool, shader);
    }

    scene.popMatrix();
};