uniform mat4 ModelMatrix;
uniform mat4 ViewMatrix;
uniform mat4 ProjMatrix;

attribute vec4 Position;
attribute vec4 Normal;

varying vec4 v_Normal;

void main() {
    v_Normal = Normal;
    gl_Position = ProjMatrix * ViewMatrix * ModelMatrix * Position;
}