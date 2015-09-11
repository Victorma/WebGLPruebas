precision mediump float;
attribute vec3 Position;
attribute vec3 Normal;

uniform mat4 ProjMatrix;
uniform mat4 ModelMatrix;
uniform mat4 ViewMatrix;
uniform float Offset;

void main() {
  gl_Position = ProjMatrix * ViewMatrix * ModelMatrix * vec4(Position+Normal*Offset, 1.0);
}