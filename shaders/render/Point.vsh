precision mediump int;
precision mediump float;

uniform mat4 ModelMatrix;
uniform mat4 ViewMatrix;
uniform mat4 ProjMatrix;
uniform mat4 NormalMatrix;

uniform int TextureMatrixEnabled;
uniform mat4 TextureMatrix;

// All lights
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

	float near;
	float far;

	// ShadowCast
	int casts;

	mat4 matrix;
};

uniform int NumLights;
uniform Light Lights[MAX_LIGHTS];

// Ambient
uniform vec3 AmbientLight;

attribute vec4 Position;
attribute vec4 Normal;
attribute vec4 Color;
attribute vec2 Uv;

varying vec3 ambient;
varying vec4 v_PositionFromLight[MAX_LIGHTS];

varying vec3 v_Normal;
varying vec4 v_Position;
varying vec4 v_Color;
varying vec2 v_Uv;
varying vec4 v_UvProj;
varying vec3 v_EyeDirection;

void main() {
	// Vertex position
	v_Position = ModelMatrix * Position;
	// Aux view vertex position
	vec3 EyePosition = (-ViewMatrix[3].xyz * mat3(ViewMatrix));
    v_EyeDirection = EyePosition - v_Position.xyz;
	// Final vertex rendering position (After view and projection transformations)
	gl_Position = ProjMatrix * ViewMatrix * v_Position;

	for(int i = 0; i<MAX_LIGHTS; i++){
		if(i < NumLights){
			v_PositionFromLight[i] = Lights[i].matrix * v_Position;
		}
	}

	// Normal inverse locator
	v_Normal = normalize(vec3(NormalMatrix * Normal));

    // Ambient Light
    ambient = AmbientLight * Color.xyz;

	v_Color = Color;
	if(TextureMatrixEnabled == 1){
		v_UvProj = TextureMatrix * v_Position;
	}else
		v_Uv = Uv;
	gl_PointSize = 1.0;
}
