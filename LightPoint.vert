uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;

attribute vec4 a_Position;

void main() {

    vec4 a = a_Position;
    gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    gl_PointSize = 50.0;
}