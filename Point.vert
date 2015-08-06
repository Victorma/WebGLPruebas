uniform mat4 u_ModelMatrix;
uniform mat4 u_LightViewMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjMatrix;
uniform mat4 u_NormalMatrix;

// Ambient
uniform vec3 u_AmbientLight;
// Directional
uniform vec3 u_LightDirection;
uniform vec3 u_DirectionalLight;

attribute vec4 a_Position;
attribute vec4 a_Normal;
attribute vec4 a_Color;
attribute vec4 a_Uv;

varying vec3 dirAmb;

varying vec3 v_Normal;
varying vec4 v_Position;
varying vec4 v_PositionFromLight;
varying vec4 v_Color;
varying vec4 v_Uv;

void main() {
	// Vertex position
	v_Position = u_ModelMatrix * a_Position;
	// Final vertex rendering position (After view and projection transformations)
	gl_Position = u_ProjMatrix * u_ViewMatrix * v_Position;
	v_PositionFromLight = u_ProjMatrix * u_LightViewMatrix * v_Position;

	// Normal inverse locator
	v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));

    // Ambient Light
    vec3 ambient = u_AmbientLight * vec3(a_Color);

	// Directional light
    float nDirL = max(dot(u_LightDirection, v_Normal), 0.0);
    vec3 directional = u_DirectionalLight * vec3(a_Color) * nDirL;

	dirAmb = directional + ambient;

	v_Color = a_Color;
	v_Uv = a_Uv;
	gl_PointSize = 1.0;
}
