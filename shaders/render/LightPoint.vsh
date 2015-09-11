uniform mat4 ModelMatrix;
uniform mat4 ViewMatrix;
uniform mat4 ProjMatrix;

attribute vec4 Position;

void main() {

    vec4 a = Position;
    gl_Position = ProjMatrix * ViewMatrix * ModelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 50.0;
}