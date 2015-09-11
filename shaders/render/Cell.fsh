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

	float near;
	float far;

	// ShadowCast
	int casts;

	//samplerCube shadowsCube;

	mat4 matrix;
};

uniform int NumLights;
uniform Light Lights[MAX_LIGHTS];
uniform float CelShading;

varying vec3 ambient;
varying vec4 v_PositionFromLight[MAX_LIGHTS];

uniform sampler2D Shadows[MAX_LIGHTS];
uniform samplerCube ShadowsCube[MAX_LIGHTS];

varying vec3 v_EyeDirection;

varying vec3 v_Normal;
varying vec4 v_Position;
varying vec4 v_Color;
varying vec4 v_Uv;

float unpack(vec4 rgbaDepth){
	return rgbaDepth.r;
}

float pointLightDepth(samplerCube sampler, vec3 direction){
	return unpack(textureCube(sampler, direction.xyz));
}

float directionalLightDepth(sampler2D sampler, vec3 coord){
	return unpack(texture2D(sampler, coord.xy));
}

float celShade(float d) {
  float E = 0.05;
  d *= CelShading;
  float r = 1.0 / (CelShading-0.5);
  float fd = floor(d);
  float dr = d * r;
  if (d > fd-E && d < fd+E) {
    float last = (fd - sign(d - fd))*r;
    return mix(last, fd*r,
      smoothstep((fd-E)*r, (fd+E)*r, dr));
  } else {
    return fd*r;
  }
}

vec3 diffuse(Light light){
	vec3 dir = light.direction;
	if(light.type == 2)
		dir = normalize(light.position - vec3(v_Position));

	float cosTheta = max(dot(dir, normalize(v_Normal)), 0.0);
	cosTheta = celShade(cosTheta);

	return light.color * vec3(v_Color) * cosTheta;
}

vec3 specular(Light light){
	vec3 dir = light.direction;
	if(light.type == 2)
		dir = normalize(light.position - vec3(v_Position));

    float E = 0.05;
	float cosAlpha = clamp(dot(normalize(v_EyeDirection), reflect(-dir,v_Normal)), 0.0, 1.0);

    if (cosAlpha > 0.5 - E && cosAlpha < 0.5 + E) {
        cosAlpha = smoothstep(0.5 - E, 0.5 + E, cosAlpha);
    } else {
        cosAlpha = step(0.5, cosAlpha);
    }
	return light.color * vec3(v_Color) * pow(cosAlpha,5.0);
}



// Thanks to  Benlitz & Andon M. Coleman, I really really thank this to you after days of failing constantly.
// (http://stackoverflow.com/questions/10786951/omnidirectional-shadow-mapping-with-depth-cubemap)
float VectorToDepth (vec3 Vec, Light light){
    vec3 AbsVec = abs(Vec);
    float LocalZcomp = max(AbsVec.x, max(AbsVec.y, AbsVec.z)),
    	n = light.near,
    	f = light.far;

    float NormZComp = (f+n) / (f-n) - (2.0*f*n)/(f-n)/LocalZcomp;
    return (NormZComp + 1.0) * 0.5;
}

void main() {

	// Point light
	vec3 point = vec3(0.0,0.0,0.0);

	for(int i = 0; i<MAX_LIGHTS; i++){
		float visibility = 1.0;
		float specularVisibility = 1.0;
		if(Lights[i].enabled == 1){

			if(Lights[i].casts == 1){
				// Visibility calc
				vec3 shadowCoord = (v_PositionFromLight[i].xyz / v_PositionFromLight[i].w);

				float depth;
				if(Lights[i].type == 1){
					depth = directionalLightDepth(Shadows[i], shadowCoord); // Retrieve the z value from R
				}else if(Lights[i].type == 2){
					vec3 LightVector = (v_Position.xyz/v_Position.w) - Lights[i].position;
					shadowCoord.z = VectorToDepth(LightVector,Lights[i]);
					depth = pointLightDepth(ShadowsCube[i], normalize(LightVector));
				}
				visibility = (shadowCoord.z > depth + 0.005) ? 0.3:1.0;
				specularVisibility = (shadowCoord.z > depth + 0.005) ? 0.0:1.0;
			}

			point +=  (diffuse(Lights[i]) * visibility + specular(Lights[i]) * specularVisibility);

		}
	}

	gl_FragColor = vec4(ambient * v_Color.xyz + point, v_Color.a);

}