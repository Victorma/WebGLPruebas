
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


function loadExternalShader(shaderName, shaderDir, callback){
	if(shaders[shaderName] === undefined) {
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
						s.program = program;
						switchProgram(gl,s.program);

						// Load the vars
						doUniforms(s.uniforms, s.structs, function(n){ readUniformName(n, s.program); });
						doUniformsNames(s.samplers, "sampler", function(n){ readUniformName(n, s.program); });
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
	loadExternalShader(shaderName, shaderDir, function(shader){
		currentShader = shaders[shaderName];
	});
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