uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;

attribute vec4 a_Position;
attribute vec4 a_Normal;

varying vec4 v_Normal;

void main() {
    v_Normal = a_Normal;
    gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
}