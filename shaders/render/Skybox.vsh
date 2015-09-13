uniform mat4 ModelMatrix;
uniform mat4 ViewMatrix;
uniform mat4 ProjMatrix;

attribute vec4 Position;
attribute vec4 Color;

varying vec4 v_Color;
varying vec3 Direction;

void main() {
    gl_Position = ProjMatrix*ViewMatrix*ModelMatrix*Position;
    Direction = Position.xyz;
    v_Color = Color;
}