precision mediump float;

uniform vec3 Color;

void main() {

    float distance = distance(vec2(0.5,0.5), gl_PointCoord);
    if(distance >= 0.5)
        discard;
    float MaxLength = length(vec3(1.0,1.0,1.0));
    gl_FragColor = vec4(Color.x, Color.y, Color.z, (1.0 - distance*2.0)* (length(Color) / MaxLength));
}