precision mediump float;

// Point
uniform vec3 u_LightPosition;
uniform vec3 u_PositionalLight;
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
	vec3 lightDirection = normalize(u_LightPosition - vec3(v_Position));
	float nDotL = max(dot(lightDirection, normalize(v_Normal)), 0.0);
	vec3 point = u_PositionalLight * vec3(v_Color) * nDotL;

	gl_FragColor = vec4((dirAmb + point)* visibility, v_Color.a);

}