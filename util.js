
/*
 * Buffer aux functions
 */

function putBuffer(gl, buffer_type, buffer, values, dimensions){

	gl.bindBuffer(buffer_type, buffer);

	var nPoints = values.length/dimensions;

	gl.bufferData(buffer_type, values, gl.STATIC_DRAW);

	buffer.type = buffer_type;
	buffer.num = dimensions;

	return nPoints;
};

function enableBuffer(gl, buffer, attribute){
	gl.bindBuffer(buffer.type, buffer);
	if(buffer.type == gl.ARRAY_BUFFER){
		gl.vertexAttribPointer(attribute, buffer.num, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(attribute);
	}
};

function initFramebufferObject(gl, width, height, textureType) {
	var framebuffer = [], texture, depthBuffer;

	/*
	 1. Create a framebuffer object ( gl.createFramebuffer() ).
	 2. Create a texture object and set its size and parameters ( gl.createTexture() ,
	 gl.bindTexture() , gl.texImage2D() , gl.Parameteri() ).
	 3. Create a renderbuffer object ( gl.createRenderbuffer() ).
	 4. Bind the renderbuffer object to the target and set its size ( gl.bindRenderbuffer() ,
	 gl.renderbufferStorage() ).
	 5. Attach the texture object to the color attachment of the framebuffer object
	 ( gl.bindFramebuffer() , gl.framebufferTexture2D() ).
	 6. Attach the renderbuffer object to the depth attachment of the framebuffer object
	 ( gl.framebufferRenderbuffer() ).
	 7. Check whether the framebuffer object is configured correctly ( gl.checkFramebuffer-
	 Status() ).
	 8. Draw using the framebuffer object ( gl.bindFramebuffer() ).
	 */

	// DEFINE TEXTURE TYPE
	if(textureType === undefined)
		textureType = gl.TEXTURE_2D;

	var faceDef = [];

	if(textureType === gl.TEXTURE_2D)
		faceDef[0] = gl.TEXTURE_2D;
	else for(var face = 0; face<6; face++)
			faceDef[face] = gl.TEXTURE_CUBE_MAP_POSITIVE_X + face;


	// Create a texture object and set its size and parameters
	texture = gl.createTexture(); // Create a texture object
	gl.bindTexture(textureType, texture);
	gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(textureType, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

	for(var face = 0; face<faceDef.length; face++) {
		gl.texImage2D(faceDef[face], 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		// Create a framebuffer object (FBO)
		framebuffer[face] = gl.createFramebuffer();
		framebuffer[face].texture = texture; // Store the texture object

		framebuffer[face].width = width;
		framebuffer[face].height = height;

		// Create a renderbuffer object and set its size and parameters
		depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);

		// Attach the texture and the renderbuffer object to the FBO
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer[face]);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, faceDef[face], texture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

		// Check whether FBO is configured correctly
		var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if (e !== gl.FRAMEBUFFER_COMPLETE) {
			console.log('Framebuffer object is incomplete: ' + e.toString());
			return error();
		}
	}

	return framebuffer;
}
/*
 * Shader aux functions
 */
function createProgramFiles(gl, vertFile, fragFile, callback) {

	var petition = {};

	loadShaderFile(gl, vertFile, gl.VERTEX_SHADER, petition, callback);
	loadShaderFile(gl, fragFile, gl.FRAGMENT_SHADER, petition, callback);
};

function loadShaderFile(gl, fileName, shader, petition, callback) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status !== 404) 
			onLoadShader(gl, request.responseText, shader, petition, callback);
	}
	request.open('GET', fileName, true);
	request.send(); // Send the request
};

function onLoadShader(gl, fileString, type, petition, callback) {
	if (type == gl.VERTEX_SHADER) { // The vertex shader is loaded
		petition.VSHADER_SOURCE = fileString;
	} else if (type == gl.FRAGMENT_SHADER) { // The fragment shader is loaded
		petition.FSHADER_SOURCE = fileString;
	}
	// Start rendering, after loading both shaders
	if (petition.VSHADER_SOURCE && petition.FSHADER_SOURCE){
		var program = createProgram(gl, petition.VSHADER_SOURCE, petition.FSHADER_SOURCE);
		callback(program);
	}
};


// Vectores
function productoEscalar(V, W) {
	var Nx = (V[1] * W[2]) - (V[2] * W[1]),
		Ny = (V[2] * W[0]) - (V[0] * W[2]),
		Nz = (V[0] * W[1]) - (V[1] * W[0]);

	return new Vector3([Nx,Ny,Nz]);
};

function glTextureIndex(gl, index){
	switch (index){
		case 0: return gl.TEXTURE0;
		case 1: return gl.TEXTURE1;
		case 2: return gl.TEXTURE2;
		case 3: return gl.TEXTURE3;
		case 4: return gl.TEXTURE4;
		case 5: return gl.TEXTURE5;
		case 6: return gl.TEXTURE6;
		case 7: return gl.TEXTURE7;
	}

	return undefined;
}

function addOption(label,text,object){
	var child = document.createElement("option");
	child.value = label;
	child.text = text.split(".")[0].replace("_", " ");
	object.appendChild(child);
}

var shaderDir = "shaders/program/";

function readShaderFiles(selectObject){
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status !== 404){
			var names = request.responseText.split("\n");
			addOption("-1", "Ninguno", selectObject);
			for(var n in names){
				addOption(names[n], names[n].split(".")[0].replace("_", " "), selectObject);
			}
		}
	}
	request.open('GET', shaderDir + "names.txt", true);
	request.send(); // Send the request
}

var shaders = [];
var shaderFiles = [];
var currentShader = null;

function onShaderChanged(select){
	var shader = select.value;
	if(shader == "-1"){
		currentShader = null;
	}else{
		loadPostShader(shader);
	}
}

function isBasic(type){
	return type == "float" || type == "int" || type == "matrix4x4" || type == "sampler2D" || type == "samplerCube";
}

function doUniforms(uniforms, structs, callback, opt_prefix){
	if(opt_prefix === undefined)
		opt_prefix = "";

	for(var u in uniforms)
		doUniform(uniforms[u], structs, callback, opt_prefix);
}

function doUniformsNames(names, type, callback){
	for(var name in names) {
		callback(names[name], type);
		//readUniformName(names[name], program);
	}
}

function doUniform(uniform, structs, callback, opt_prefix){
	if(opt_prefix === undefined)
		opt_prefix = "";

	if(isBasic(uniform.type))
		callback(opt_prefix+uniform.name,uniform.type, uniform.count, uniform.values);
	else
		doUniforms(findStruct(uniform.type, structs), structs, opt_prefix + uniform.name + ".");
}

function readUniformName(uniformName, program){
	program["u_"+uniformName] = gl.getUniformLocation(program, uniformName);
}

function doAttributes(names, callback){
	for(var name in names)
		callback(names[name]);
		//readAttributeName(names[name], program);
}

function readAttributeName(attributeName, program){
	program["a_"+attributeName] = gl.getAttribLocation(program, attributeName);
}

function doArrays(arrays, structs, callback){
	for(var ar in arrays)
		doArray(arrays[ar], structs, callback);
}

function doArray(array, structs, callback, opt_prefix){
	if(opt_prefix === undefined)
		opt_prefix = "";




	if(isBasic(array.type)){
		// Read single uniform
		for(var i = 0; i<array.size; i++) {
			var uName = opt_prefix + array.name + "[" + i + "]";
			callback(uName, array.type, array.count, array.values[i]);
			//readUniformName(uName, program);
		}
	}else{
		// Read struct unifrom
		for(var i = 0; i<array.size; i++) {
			var uName = opt_prefix + array.name + "[" + i + "].";
			doUniforms(findStruct(array.type, structs).vars, structs, callback, uName);
		}
	}
}

function findStruct(name, structs){
	for(var s in structs){
		if(structs[s].name == name)
			return structs[s];
	}
	return undefined;
}

function loadTexture(url, callback) {
	texture = gl.createTexture();
	image = new Image();
	image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		callback(texture);
	};
	image.src = url;
}

function loadCubeFace(face, glIndex, texture, callback){
	var f = new Image();
	f.onload = function () {
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
		gl.texImage2D(glIndex, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, f);
		callback(face);
	};
	f.src = face;
}

function loadTextureCube(left, right, top, bottom, front, back, callback) {
	texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

	var faces = [left, right, top, bottom, front, back];
	var completed = 0;

	for(var face = 0; face < 6; face++){
		if(faces[face])
			loadCubeFace(faces[face], gl.TEXTURE_CUBE_MAP_POSITIVE_X + face, texture, function(name){
				completed++;
				if(completed == 6)
					callback(texture);
			});
		else{
			completed++;
			if(completed == 6)
				callback(texture);
		}
	}
}




function loadExternalShader(shaderName, shaderDir, callback){
	if(true/*shaders[shaderName] === undefined*/) {
		// lets load
		var request = new XMLHttpRequest();
		request.onreadystatechange = function() {
			if (request.readyState === 4 && request.status !== 404){
				shaders[shaderName] = JSON.parse(request.responseText);
				var s = shaders[shaderName];
				createProgramFiles(getGL(),
					shaderDir + s.vertex+".vsh",
					shaderDir + s.fragment+".fsh",
					function(program){
						console.log("Shader "+shaderName+" loaded: " + ((program)? "OK" : "FAIL"));
						s.program = program;
						switchProgram(gl,s.program);

						// Load the vars
						doUniforms(s.uniforms, s.structs, function(n){ readUniformName(n, s.program); });
						for(var sampler in s.samplers)
							if(s.samplers[sampler].type === undefined)
								s.samplers[sampler].type = "sampler2D";
						doUniforms(s.samplers, s.structs, function(n){ readUniformName(n, s.program); });
						doAttributes(s.attributes, function(n){ readAttributeName(n, s.program); });
						doArrays(s.arrays, s.structs, function(n){ readUniformName(n, s.program); });

						// Once loaded
						callback(s);
					}
				);
			}
		};
		request.open('GET', shaderDir + shaderName, true);
		request.send(); // Send the request
	}else // already load
		callback(shaders[shaderName]);
}


function loadPostShader(shaderName){
	currentShader = shaderName;
	/*loadExternalShader(shaderName, shaderDir, function(shader){
		currentShader = shaders[shaderName];
	});*/
};

function negative(v){
	var e = v.elements;
	return new Vector3([-e[0], -e[1], -e[2]]);
};

function sum(u,v){
	var eu = u.elements, ev = v.elements;

	var wx = eu[0] + ev[0],
		wy = eu[1] + ev[1],
		wz = eu[2] + ev[2];

	return new Vector3([wx,wy,wz]);
};

function dif(u,v){
	return sum(u,negative(v));
};

function normalize(v){
	var len = length(v), e = v.elements;
	return div(v,len);
};

function div(v,f){
	return mult(v,1/f);
};

function mult(v,f){
	var e = v.elements;
	var vx = e[0]*f,
		vy = e[1]*f,
		vz = e[2]*f;

	return new Vector3([vx,vy,vz]);
};

function length(v){
	var e = v.elements;
	return Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]);
};

function vect(u,v){
	var eu = u.elements,
		ev = v.elements;

	return productoEscalar(eu,ev);
};

function setMatrixRotationFromQuaternion(matrix, quaternion) {
	/*var q = quaternion.elements;
	var m = matrix.elements;

	var x = q[0], y = q[1], z = q[2], w = q[3];
	//  var g = c + c, h = d + d, k = e + e, a = c * g;
	var x2 = x + x, y2 = y + y, z2 = z + z;

	var l = x * y2,
		p = y * y2,
		a = x2 * x,
		c = x * z2,
		d = y * z2,
		e = z * z2,
		g = w * a,
		h = w * y2,
		f = w * z2;

	m[0] = 1 - (p + e);
	m[4] = l - f;
	m[8] = c + h;
	m[1] = l + f;
	m[5] = 1 - (a + e);
	m[9] = d - g;
	m[2] = c - h;
	m[6] = d + g;
	m[10] = 1 - (a + p);
	m[3] = 0;
	m[7] = 0;
	m[11] = 0;
	m[12] = 0;
	m[13] = 0;
	m[14] = 0;
	m[15] = 1;*/
	var q = quaternion.elements;
	var b = matrix.elements, c = q[0], d = q[1], e = q[2], f = q[3], g = c + c, h = d + d, k = e + e;
	a = c * g;
	var l = c * h, c = c * k, p = d * h, d = d * k, e = e * k, g = f * g, h = f * h, f = f * k;
	b[0] = 1 - (p + e);
	b[4] = l - f;
	b[8] = c + h;
	b[1] = l + f;
	b[5] = 1 - (a + e);
	b[9] = d - g;
	b[2] = c - h;
	b[6] = d + g;
	b[10] = 1 - (a + p);
	b[3] = 0;
	b[7] = 0;
	b[11] = 0;
	b[12] = 0;
	b[13] = 0;
	b[14] = 0;
	b[15] = 1;

};

function extractRotation(from, to){
	var c = to.elements,
		b = from.elements;

	var d = 1 / length(new Vector3([b[0], b[1], b[2]])),
		e = 1 / length(new Vector3([b[4], b[5], b[6]])),
		f = 1 / length(new Vector3([b[8], b[9], b[10]]));

	c[0] = b[0] * d;
	c[1] = b[1] * d;
	c[2] = b[2] * d;
	c[4] = b[4] * e;
	c[5] = b[5] * e;
	c[6] = b[6] * e;
	c[8] = b[8] * f;
	c[9] = b[9] * f;
	c[10] = b[10] * f;

	return to;
}

function dot(vector1, vector2){
	var v1 = vector1.elements,
		v2 = vector2.elements;

	return v1[0]*v2[0] + v1[1]*v2[1] + v1[2]*v2[2];
}

function reflect(vector, normal){
	var i = vector.elements,
		n = normal.elements;

	var s = 2*dot(vector, normal);
	var f = mult(normal, s);

	return dif(vector, f);
}

function getPositionFromMatrix(matrix){
	var a = matrix.elements;
	return new Vector3([a[12], a[13], a[14]]);
}

function setPosition (matrix, position) {
	var b = matrix.elements;
	var a = position.elements;
	b[12] = a[0];
	b[13] = a[1];
	b[14] = a[2];
};

function compose(matrix, position, rotationQuaternion, scale){
	setMatrixRotationFromQuaternion(matrix, rotationQuaternion);
	matrix.scale(scale.elements[0], scale.elements[1], scale.elements[2]);
	setPosition(matrix, position);
	return matrix;
};

function getQuaternion (matrix) {
	/*var c = ae[0], a = ae[4], d = ae[8], e = ae[1], f = ae[5],
		g = ae[9], h = ae[2], k = ae[6], b = ae[10], l = c + f + b;

	var _w, _x, _y, _z;

	if(0 < l){
		c = .5 / Math.sqrt(l + 1);
		_w = .25 / c;
		_x = (k - g) * c;
		_y = (d - h) * c;
		_z = (e - a) * c;
	}else{
		if(c > f && c > b ) {
			c = 2 * Math.sqrt(1 + c - f - b);
			_w = (k - g) / c;
			_x = .25 * c;
			_y = (a + e) / c;
			_z = (d + h) / c;
		}else{
			if(f > b){
				c = 2 * Math.sqrt(1 + f - c - b);
				_w = (d - h) / c;
				_x = (a + e) / c;
				_y = .25 * c;
				_z = (g + k) / c
			}else{
				c = 2 * Math.sqrt(1 + b - c - f);
				_w = (e - a) / c;
				_x = (d + h) / c;
				_y = (g + k) / c;
				_z = .25 * c;
			}
		}*/



	var b = matrix.elements, c = b[0], _x, _y,_z,_w;
	a = b[4];
	var d = b[8], e = b[1], f = b[5], g = b[9], h = b[2], k = b[6], b = b[10], l = c + f + b;
	0 < l ? (c = .5 / Math.sqrt(l + 1), _w = .25 / c, _x = (k - g) * c, _y = (d - h) * c, _z = (e - a) * c) : c > f && c > b ? (c = 2 * Math.sqrt(1 + c - f - b), _w = (k - g) / c, _x = .25 * c, _y = (a + e) / c, _z = (d + h) / c) : f > b ? (c = 2 * Math.sqrt(1 + f - c - b), _w = (d - h) / c, _x = (a + e) / c, _y = .25 * c, _z = (g + k) / c) : (c = 2 * Math.sqrt(1 + b - c - f), _w = (e - a) / c, _x = (d + h) / c, _y = (g + k) / c, _z = .25 * c);


	return new Vector4([_x,_y,_z,_w]);
}