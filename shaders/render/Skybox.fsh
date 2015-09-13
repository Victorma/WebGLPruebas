precision mediump float;

uniform samplerCube Skybox;

varying vec3 Direction;
varying vec4 v_Color;
void main() {
    gl_FragColor = textureCube(Skybox, Direction);
}