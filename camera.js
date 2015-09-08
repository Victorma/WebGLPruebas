/**
 * Created by Victorma on 08/09/2015.
 */

var Camera = function() {
    //Main matrices
    this.view = new Matrix4();
    this.projection = new Matrix4();

    //Combined matrix
    this.pv = new Matrix4();

    // Matrix initialization
    this.view.setIdentity();
    this.projection.setIdentity();
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

            /*var d = y / de[1];

            var n = mult(lookDir, d);
            var vn = normalize(dif(n, new Vector3([0,y,0])));

            var a = 1;
            var b = vn.elements[0] + vn.elements[2];
            var c = d*d + y*y + n.elements[0] + n.elements[2];

            var s = solveCuadraticEcuation(a,b,c);
            var h = s[0]>0 ? s[0] : s[1];*/
        }
    }

    var p = position.elements,
        l = look.elements,
        u = opt_up.elements;

    this.position = new Vector3(p);
    this.look = new Vector3(l);
    this.up = new Vector3(u);


    this.view.setLookAt(p[0], p[1], p[2], l[0], l[1], l[2], u[0], u[1], u[2]);
    this.pv = new Matrix4(this.projection).multiply(new Matrix4(this.view));
};

Camera.prototype.configureViewCoords = function(px, py, pz, lx, ly, lz, ux, uy, uz){

    var position = new Vector3([px,py,pz]),
        look = new Vector3([lx,ly,lz]),
        up = new Vector3([ux,uy,uz]);

    this.configureView(position, look, up);
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
    this.look = sum(this.position,move);

    this.configureView(this.position, this.look, this.up);
}
