uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;

attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec4 a_UV;
varying vec4 v_Color;
varying vec4 v_UV;
void main() {
	gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
	v_Color = a_Color;
	v_UV = a_UV;
	gl_PointSize = 1.0;
}