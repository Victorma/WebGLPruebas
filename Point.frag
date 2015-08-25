precision mediump float;
precision mediump int;


#define MAX_LIGHTS 2

struct Light {
	// Type 1: Directional
	// Type 2: Point
	// Type 3: Focational
	int type;
	// Light enabled
	int enabled;

	// Main properties (use depends from type)
	vec3 direction;
	vec3 position;
	vec3 color;

	// Range (<0 means unlimited)
	float range; // TODO RANGE ATTENUATION

	// ShadowCast
	int casts;

	mat4 matrix;
};

uniform int u_NumLights;
uniform Light u_Lights[MAX_LIGHTS];
uniform sampler2D u_Shadows[MAX_LIGHTS];

varying vec3 ambient;
varying vec4 v_PositionFromLight[MAX_LIGHTS];

varying vec3 v_Normal;
varying vec4 v_Position;
varying vec4 v_Color;
varying vec4 v_Uv;

const float numLayers = 4.0;
const float factor = 1.0/numLayers;

void main() {

	// Point light
	vec3 point = vec3(0.0,0.0,0.0);


	for(int i = 0; i<MAX_LIGHTS; i++){
		if(i >= u_NumLights)
			break;

		float visibility = 1.0;
		if(u_Lights[i].enabled == 1){
			//if(i >= u_NumPositionalLights) break;

			if(u_Lights[i].casts == 1){
				//vec3 shadowCoord = (v_PositionFromLight[i].xyz / v_PositionFromLight[i].w) / 2.0 + 0.5;
				// Visibility calc
				//visibility = (shadowCoord.z > (texture2D(u_Shadows[i], shadowCoord.xy).r + 0.005)) ? 0.7:1.0;
				vec3 shadowCoord = (v_PositionFromLight[i].xyz / v_PositionFromLight[i].w) / 2.0 + 0.5;
				if(shadowCoord.x < 0.0 || shadowCoord.x > 1.0 || shadowCoord.y < 0.0 || shadowCoord.y > 1.0){
					visibility = 1.0;
				}else{
					vec4 rgbaDepth = texture2D(u_Shadows[i], shadowCoord.xy);
					float depth = rgbaDepth.r; // Retrieve the z value from R
					visibility = (shadowCoord.z > depth + 0.005) ? 0.7:1.0;
				}
			}

			if(u_Lights[i].type == 1){
				// Directional light
				float nDirL = max(dot(u_Lights[i].direction, v_Normal), 0.0);
				nDirL = floor(nDirL*numLayers)*factor;
				point += (u_Lights[i].color * vec3(v_Color) * nDirL) * visibility;

			}else if(u_Lights[i].type == 2){
				// Point light
				vec3 lightDirection = normalize(u_Lights[i].position - vec3(v_Position));
				float nDotL = max(dot(lightDirection, normalize(v_Normal)), 0.0);
				nDotL = floor(nDotL*numLayers)*factor;
				if(nDotL == 0.0)
					nDotL = factor*0.5;
				point += (u_Lights[i].color * vec3(v_Color) * nDotL) * visibility;
			}
		}
	}

	gl_FragColor = vec4(ambient * v_Color.xyz + point, v_Color.a);

}