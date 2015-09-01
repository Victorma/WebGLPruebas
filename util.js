
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

function initFramebufferObject(gl, textureType) {
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
		gl.texImage2D(faceDef[face], 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

		// Create a framebuffer object (FBO)
		framebuffer[face] = gl.createFramebuffer();
		framebuffer[face].texture = texture; // Store the texture object

		// Create a renderbuffer object and set its size and parameters
		depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

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