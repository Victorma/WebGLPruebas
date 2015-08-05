
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

/*
 * Shader aux functions
 */

function loadShaderFile(gl, fileName, shader) {
	var request = new XMLHttpRequest();
	request.onreadystatechange = function() {
		if (request.readyState === 4 && request.status !== 404) 
			onLoadShader(gl, request.responseText, shader);
	}
	request.open('GET', fileName, true);
	request.send(); // Send the request
};

function onLoadShader(gl, fileString, type) {
	if (type == gl.VERTEX_SHADER) { // The vertex shader is loaded
		VSHADER_SOURCE = fileString;
	} else if (type == gl.FRAGMENT_SHADER) { // The fragment shader is loaded
		FSHADER_SOURCE = fileString;
	}
	// Start rendering, after loading both shaders
	if (VSHADER_SOURCE && FSHADER_SOURCE) start(gl);
};