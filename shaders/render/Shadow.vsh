uniform mat4 ModelMatrix;
uniform mat4 ViewMatrix;
uniform mat4 ProjMatrix;

attribute vec4 Position;

void main() {
    gl_Position = ProjMatrix * ViewMatrix * ModelMatrix * Position;
}