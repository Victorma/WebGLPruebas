/**
 * Created by Victorma on 27/08/2015.
 */
var Material = function(gl, opt_shader) {

    /**
     * Context
     */
    this.gl = gl;
    this.shader = (opt_shader !== undefined) ? opt_shader : [];
    this.ready = (opt_shader !== undefined);

    // Lets init some textures in case missing in shader
    if(!Material.DefaultSampler){
        texture = gl.createTexture(); // Create a texture object
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        Material.DefaultSampler = texture;
    }

    if(!Material.DefaultCubemap) {
        texture = gl.createTexture(); // Create a texture object
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        //gl.texParameteri(textureType, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        for (var face = 0; face < 6; face++) {
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + face, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
        Material.DefaultCubemap = texture;
    }
};

Material.DefaultSampler = undefined;
Material.DefaultCubemap = undefined;

/**
 * On Create called just in creation time
 */
Material.prototype.onCreate = function(){

};

Material.prototype.load = function(shaderName, shaderPath, callback){
    this.ready = false;
    var material = this;
    material.shader[shaderName] = undefined;

    loadExternalShader(shaderName, shaderPath, function(shader){
        material.shader[shaderName] = shader;
        material.shader[shaderName].onPreRender = function(){};
        material.shader[shaderName].onPostRender = function(){};
        material.currentShader = shaderName;
        material.ready = true;
        material.bind();
        doUniforms(material.shader.uniforms, material.shader.structs, function(n, t, c, v){
            material.set.apply(material,[n,t,c,v]);
        });
        doArrays(material.shader.arrays, material.shader.structs, function(n,t,c,v){
            material.set.apply(material,[n,t,c,v]);
        });
        callback(material,shader);
    });
};

/*Material.prototype.setDefault = function(uniformName, type, count, uniformValue){
  this.defaults[uniformName] = { "name": uniformName, "type": type, "count": count, values: uniformValue };
};*/

Material.prototype.set = function(uniformName, type, count, uniformValue, opt_program){
    if(opt_program === undefined)
        opt_program = this.shader[this.currentShader].program;

    //console.log("setting: " + uniformName + " value: " + uniformValue);
    switch(type){
        case "matrix4x4":
            gl.uniformMatrix4fv(opt_program["u_"+uniformName], false, uniformValue);
            break;
        case "float":
            gl["uniform"+ count + "fv"](opt_program["u_"+uniformName], uniformValue);
            break;
        case "int":
            gl["uniform"+ count + "iv"](opt_program["u_"+uniformName], uniformValue);
            break;
    }
};

function isTexture(type, gl) {
    return type == "sampler2D" || type == "samplerCube" || type == gl.TEXTURE_CUBE_MAP || type == gl.TEXTURE_2D;
}

function configureShaderUniforms(pool, program, gl, opt_material) {
    var used = 0;
    var texture2D = undefined;
    var textureCube = undefined;

    var samplersSetted = {};

    for (var u in program) {
        var instance = typeof u === "string";
        var indexof = u.indexOf("u_");
        if (instance && indexof == 0) { // Is uniform
            var name = u.substr(2);
            if (pool[name] !== undefined) {
                if (isTexture(pool[name].type, gl)) {
                    // BindTexture
                    gl.activeTexture(glTextureIndex(this.gl, used));
                    gl.bindTexture(pool[name].type, pool[name].value);
                    gl.uniform1i(program["u_" + name], used);

                    samplersSetted[name] = true;

                    if (pool[name].type == gl.TEXTURE_2D) texture2D = used;
                    else textureCube = used;

                    used++;
                } else {
                    // Bind Uniform
                    Material.prototype.set(name, pool[name].type, pool[name].count, pool[name].values, program);
                }
            }
        }
    }

    if (opt_material) {
        for (var s in opt_material.shader[opt_material.currentShader].samplers) {
            var name = opt_material.shader[opt_material.currentShader].samplers[s];
            if (!samplersSetted[name]) {
                // TODO fix sampler cube detection
                if (name.indexOf("Cube") != -1) {
                    if (textureCube === undefined) {
                        gl.activeTexture(glTextureIndex(this.gl, used));
                        gl.bindTexture(gl.TEXTURE_CUBE_MAP, Material.DefaultCubemap);
                        textureCube = used;
                        used++;
                    }

                    gl.uniform1i(program["u_" + name], textureCube);
                } else {
                    if (texture2D === undefined) {
                        gl.activeTexture(glTextureIndex(this.gl, used));
                        gl.bindTexture(gl.TEXTURE_2D, Material.DefaultSampler);
                        texture2D = used;
                        used++;
                    }

                    gl.uniform1i(program["u_" + name], texture2D);
                }
            }
        }
    }
}

Material.prototype.setCurrentShader = function(shaderName){
    this.currentShader = shaderName;
};

Material.prototype.iterate = function(){
    this.shaderNames = [];
    for(var s in this.shader)
        this.shaderNames.push(s);

    this.iterator = 0;
    this.currentShader = undefined;
};

Material.prototype.next = function(){
    this.currentShader = this.shaderNames[this.iterator];
    this.bind();
    this.iterator++;
    if(this.iterator >= this.shaderNames.length)
        delete this.shaderNames;

    return this.shader[this.currentShader];
};

Material.prototype.hasNext = function(){
    return this.shaderNames !== undefined;
};

Material.prototype.configure = function(pool){
    if(!this.ready)
        return;

    configureShaderUniforms(pool, this.shader[this.currentShader].program, this.gl, this);
};

Material.prototype.bind = function(){
    if(this.ready)
        switchProgram(gl, this.shader[this.currentShader].program);
};

Material.prototype.getProgram = function(){
    var p = undefined;
    if(this.ready)
        p = this.shader[this.currentShader].program;

    return p;
};

/**
 * On PreRender
 */

Material.prototype.onPreRender = function(scene, shader){

    if(shader){
        return;
    }

    this.prerender(scene);
};