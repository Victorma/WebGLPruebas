precision mediump float;


#define MAX_POINT_LIGHTS 4
// Point
struct PointLight {
	vec3 position;
	vec3 color;
	float range;
};

uniform int u_NumPointLight;
uniform PositionalLight u_PointLight[MAX_POINT_LIGHTS];

uniform sampler2D u_ShadowMap;

varying vec3 dirAmb;

varying vec3 v_Normal;
varying vec4 v_Position;
varying vec4 v_PositionFromLight;
varying vec4 v_Color;
varying vec4 v_Uv;

void main() {

	vec3 shadowCoord = (v_PositionFromLight.xyz / v_PositionFromLight.w) / 2.0 + 0.5;
	vec4 rgbaDepth = texture2D(u_ShadowMap, shadowCoord.xy);
	float depth = rgbaDepth.r; // Retrieve the z value from R
	float visibility = (shadowCoord.z > depth + 0.005) ? 0.7:1.0;

	// Point light
	vec3 point = vec3(0.0,0.0,0.0);

	for(int i = 0; i < MAX_POINT_LIGHTS; i++){
		if(i >= u_NumPositionalLights) break;
		vec3 lightDirection = normalize(u_PointLight[i].position - vec3(v_Position));
		float nDotL = max(dot(lightDirection, normalize(v_Normal)), 0.0);
		point += u_PointLight[i].color * vec3(v_Color) * nDotL;
	}

	gl_FragColor = vec4((dirAmb + point)* visibility, v_Color.a);

}