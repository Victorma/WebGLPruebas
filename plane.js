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

var planeIndexes = new Uint16Array([
    0, 2 , 1, 0, 3, 2 // down
]);

function createPlane(gl, program){
    var sceneObject = new SceneObject(gl, program);
    var renderer = new Renderer(gl, program);

    renderer.triangles = planeIndexes;
    renderer.vertices = planeVertices;
    renderer.colors = planeColors;
    renderer.uvs = planeUVs;
    renderer.onChangePoints();

    sceneObject.addComponent(renderer);

    return sceneObject;
};