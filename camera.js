/**
 * Created by Victorma on 08/09/2015.
 */

var Camera = function() {
    //Main matrices
    this.view = new Matrix4();
    this.projection = new Matrix4();
    this.worldMatrix = new Matrix4();

    //Combined matrix
    this.pv = new Matrix4();

    // Matrix initialization
    this.view.setIdentity();
    this.projection.setIdentity();
    this.worldMatrix.setIdentity();
    this.pv.setIdentity();
};

Camera.main = null;

Camera.init = function(){
    Camera.main = new Camera();
    Camera.main.configureViewCoords(0,0,0,1,0,0,0,1,0);
    Camera.main.configureProjection(true, 1, 1, 1, 100);
};

function solveCuadraticEcuation(a,b,c){
    var solutions = [];

    var bb = b*b;
    var ac4 = 4*a*c;

    solutions[0] = (-b + Math.sqrt(bb - ac4)) / (2*a);
    solutions[1] = (-b - Math.sqrt(bb - ac4)) / (2*a);

    return solutions;
}

Camera.prototype.setSkybox = function(texture){

    this.auxScene = new Scene(gl);
    this.skybox = createCube(gl);
    var skyboxMaterial = new Material(gl);
    skyboxMaterial.load("Skybox.json", "shaders/render/", function(material, shader){
        shader.onPreRender = function(scene, pool){
            pool["Skybox"] = { "name" : "Skybox", "type" : gl.TEXTURE_CUBE_MAP, "value" : texture };
            pool["ViewMatrix"] = { "type" : "matrix4x4", "count" : 16, "values" : Camera.main.view.elements };
            pool["ProjMatrix"] = { "type" : "matrix4x4", "count" : 16, "values" : Camera.main.projection.elements };
            gl.disable(gl.DEPTH_TEST);
        };
        shader.onPostRender = function(scene, pool){
            gl.enable(gl.DEPTH_TEST);
        };
    });
    this.skybox.addComponent(skyboxMaterial);

    var p = this.position.elements;
    this.skybox.setTranslate(p[0],p[1],p[2]);
    //this.skybox.scale(0.5,0.5,0.5);

    this.auxScene.addObject(this.skybox);
};

Camera.prototype.renderSkybox = function(){

    //this.skybox.setTranslate(2,2,2);
    if(this.auxScene)
        this.auxScene.do("onRender", {});
};

Camera.prototype.configureView = function(position, look, opt_up){
    if(opt_up === undefined){
        var lookDir = normalize(dif(look, position));
        var de = lookDir.elements;

        if(de[1] == 0){
            opt_up = new Vector3([0,1,0]);
        }else {

            var vxz = new Vector3([de[0], 0, de[2]]);
            // La altura de mi nuevo vector es la longitud de la proyección
            var y = length(vxz);
            // Ahora lo normalizo y lo multiplico por la antigua "y"
            vxz = mult(normalize(vxz), -de[1]);
            // Ahora tengo un vector, que apoyado en (0,y,0) me lleva al punto de up.
            opt_up = sum(new Vector3([0,y,0]),vxz);

        }
    }

    var p = position.elements,
        l = look.elements,
        u = opt_up.elements;

    this.position = new Vector3(p);
    this.look = new Vector3(l);
    this.up = new Vector3(u);

    this.generateUVN();

    this.view.setLookAt(p[0], p[1], p[2], l[0], l[1], l[2], u[0], u[1], u[2]);
    this.pv = new Matrix4(this.projection).multiply(new Matrix4(this.view));

    compose(this.worldMatrix, this.position, getQuaternion(this.view), new Vector3([1.0,1.0,1.0]));

    if(this.skybox)
        this.skybox.setTranslate(p[0],p[1],p[2]);

};

Camera.prototype.configureViewCoords = function(px, py, pz, lx, ly, lz, ux, uy, uz){

    var position = new Vector3([px,py,pz]),
        look = new Vector3([lx,ly,lz]),
        up = new Vector3([ux,uy,uz]);

    this.configureView(position, look, up);
};

Camera.prototype.generateUVN = function(){
    this.n = normalize(dif(this.position, this.look));
    this.u = normalize(vect(this.up, this.n));
    this.v = vect(this.n, this.u);
};

Camera.prototype.configureViewUVN = function(u,v,n){

    this.u = u;
    this.v = v;
    this.n = n;

    // Position stays
    var dist = length(dif(this.position, this.look));

    // Look is the old distance multiplied by the new looking vector n
    this.look = mult(this.n, -dist);

    // UP is negative v
    this.up = this.v;

    this.configureView(this.position, this.look, this.up);
};

/**
 *
 * @param ortho True for ortho config, false for perspective
 * @param width ortho: defines left and wright. pers: defines aspect
 * @param height ortho: defines botton and top. pers: defines aspect
 * @param near
 * @param far
 * @param opt_fov needed for perspective
 */
Camera.prototype.configureProjection = function(ortho, width, height, near, far, opt_fov){
    if(ortho){
        var mw = width / 2.0,
            mh = height / 2.0;

        this.projection.setOrtho(-mw, mw, -mh, mh, near, far);
    }else{
        if(opt_fov === undefined)
            opt_fov = 90;

        this.projection.setPerspective(opt_fov, width/height, near, far);
    }

    this.pv = new Matrix4(this.projection).multiply(new Matrix4(this.view));
};



Camera.prototype.moveForward = function(space){
    this.moveDir(normalize(dif(this.look, this.position)), space);
};

Camera.prototype.moveBackwards = function(space){
    this.moveDir(normalize(dif(this.look, this.position)), -space);
};

Camera.prototype.moveLeft = function(space){
    var dir = normalize(vect(this.up, normalize(dif(this.look, this.position))));
    this.moveDir(dir, space);
};

Camera.prototype.moveRight = function(space){
    var dir = normalize(vect(normalize(dif(this.look, this.position)), this.up));
    this.moveDir(dir, space);
};

Camera.prototype.moveUp = function(space){
    var dir = normalize(this.up);
    this.moveDir(dir, space);
};
Camera.prototype.moveDown = function(space){
    var dir = normalize(negative(this.up));
    this.moveDir(dir, space);
};


Camera.prototype.moveDir = function(dir, space){
    var move = mult(dir, space);

    this.position = sum(this.position,move);
    this.look = sum(this.look,move);

    this.configureView(this.position, this.look, this.up);
};

Camera.prototype.yaw = function(ang){
    var cs = Math.cos(Math.PI/180.0 * ang);
    var sn = Math.sin(Math.PI/180.0 * ang);

    var t = new Vector3(this.u.elements);

    this.u = normalize(dif(mult(this.u,cs), mult(this.n,sn)));
    this.n = normalize(sum(mult(this.n,cs), mult(t,sn)));

    this.configureViewUVN(this.u, this.v, this.n);
};

Camera.prototype.pitch = function(ang){
    var cs = Math.cos(Math.PI/180.0 * ang);
    var sn = Math.sin(Math.PI/180.0 * ang);

    var t = new Vector3(this.n.elements);

    this.n = normalize(dif(mult(this.n,cs), mult(this.v,sn)));
    this.v = normalize(sum(mult(this.v,cs), mult(t,sn)));

    this.configureViewUVN(this.u, this.v, this.n);
};

Camera.prototype.roll = function(ang){
    var cs = Math.cos(Math.PI/180.0 * ang);
    var sn = Math.sin(Math.PI/180.0 * ang);

    var t = new Vector3(this.u.elements);

    this.u = normalize(dif(mult(this.u,cs), mult(this.v,sn)));
    this.v = normalize(sum(mult(this.v*cs), mult(t,sn)));

    this.configureViewUVN(this.u, this.v, this.n);
};



