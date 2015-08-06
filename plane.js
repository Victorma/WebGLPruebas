/**
 * Created by Victorma on 05/08/2015.
 */
var planeVertices = new Float32Array([ // Vertex coordinates
    -1.0, 0.0,-1.0, 	 1.0, 0.0,-1.0, 	 1.0, 0.0, 1.0,	 -1.0, 0.0, 1.0
]);

var planeColors = new Float32Array([ // Vertex coordinates
    1.0, 1.0, 1.0, 1.0,	 1.0, 1.0, 1.0, 1.0,	1.0, 1.0, 1.0, 1.0, 	1.0, 1.0, 1.0, 1.0
]);

var planeUVs = new Float32Array([ // Vertex coordinates
    0.0, 0.0,	 1.0, 0.0,  1.0, 1.0,	0.0, 1.0
]);

var planeIndexes = new Uint8Array([
    0, 2 , 1, 0, 3, 2 // down
]);

function createPlane(gl, program){
    var plane = new DrawableObject(gl, program);

    plane.triangles = planeIndexes;
    plane.vertices = planeVertices;
    plane.colors = planeColors;
    plane.uvs = planeUVs;
    plane.onChangePoints();

    return plane;
};