
//Luke Roche

var gl;
var points;
var program;
var startTime, endTime;
var proj;
window.onload = function init()
{
    startTime = new Date();
     var canvas = document.getElementById("gl-canvas");
     gl = WebGLUtils.setupWebGL( canvas );    
     if (!gl) 
     {
         alert("WebGL isn't available");
     }   
         //  Load shaders and initialize attribute buffers

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);   
     //gl.enable(gl.CULL_FACE)     
     gl.frontFace(gl.CCW);

     // Three Vertices        
    var aspect = canvas.width / canvas.height;
    proj = ortho(-10 * aspect, 10 * aspect, -10, 10, -100, 1000);
    console.log(proj);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "u_proj"),false, flatten(proj));
    var pos = vec3(-1, -1, 0);
    var offset = vec2(-3.5, 3.5)
    var scale = vec2(0.15, 0.15);
    var extent = 7;
    var vertices_rect = [
        vec3(-extent, -extent,1), vec3(0.35, 0, 0),
        vec3(-extent, extent, 1), vec3(0.35, 0, 0),
        vec3(extent, -extent, 1), vec3(0.35, 0, 0),
        vec3(extent, extent, 1),  vec3(0.35, 0, 0),
        vec3(-extent, extent, 1), vec3(0.35, 0, 0),
        vec3(extent, -extent, 1), vec3(0.35, 0, 0),

        vec3((-extent*scale[0]) + offset[0], (-extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3((-extent*scale[0]) + offset[0], ( extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3((-extent*scale[0]) + offset[0], ( extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(( extent*scale[0]) + offset[0], ( extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(( extent*scale[0]) + offset[0], ( extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(( extent*scale[0]) + offset[0], (-extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(( extent*scale[0]) + offset[0], (-extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3((-extent*scale[0]) + offset[0], (-extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        
        
        vec3(extent - (-extent*scale[0]) + offset[0], (-extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(extent - (-extent*scale[0]) + offset[0], ( extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(extent - (-extent*scale[0]) + offset[0], ( extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(extent - ( extent*scale[0]) + offset[0], ( extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(extent - ( extent*scale[0]) + offset[0], ( extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(extent - ( extent*scale[0]) + offset[0], (-extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(extent - ( extent*scale[0]) + offset[0], (-extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(extent - (-extent*scale[0]) + offset[0], (-extent*scale[1]) + offset[1], 1), vec3(0.65, 0.65, 0),

        
        vec3((-extent*scale[0]), (-extent*scale[1]), 1), vec3(0.65, 0.65, 0),
        vec3((-extent*scale[0]), ( extent*scale[1]), 1), vec3(0.65, 0.65, 0),
        vec3((-extent*scale[0]), ( extent*scale[1]), 1), vec3(0.65, 0.65, 0),
        vec3(( extent*scale[0]), ( extent*scale[1]), 1), vec3(0.65, 0.65, 0),
        vec3(( extent*scale[0]), ( extent*scale[1]), 1), vec3(0.65, 0.65, 0),
        vec3(( extent*scale[0]), (-extent*scale[1]), 1), vec3(0.65, 0.65, 0),
        vec3(( extent*scale[0]), (-extent*scale[1]), 1), vec3(0.65, 0.65, 0),
        vec3((-extent*scale[0]), (-extent*scale[1]), 1), vec3(0.65, 0.65, 0),


        vec3((-extent*4*scale[0]), (-extent*scale[1]) - offset[1], 1), vec3(0.65, 0.65, 0),
        vec3((-extent*4*scale[0]), ( extent*scale[1]) - offset[1], 1), vec3(0.65, 0.65, 0),
        vec3((-extent*4*scale[0]), ( extent*scale[1]) - offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(( extent*4*scale[0]), ( extent*scale[1]) - offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(( extent*4*scale[0]), ( extent*scale[1]) - offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(( extent*4*scale[0]), (-extent*scale[1]) - offset[1], 1), vec3(0.65, 0.65, 0),
        vec3(( extent*4*scale[0]), (-extent*scale[1]) - offset[1], 1), vec3(0.65, 0.65, 0),
        vec3((-extent*4*scale[0]), (-extent*scale[1]) - offset[1], 1), vec3(0.65, 0.65, 0),
        

    ];    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1);   //show the bounds of canvas
     
     
    
    // Load the data into the GPU        

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices_rect), gl.STATIC_DRAW );  
    // Associate our shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    var vColor = gl.getAttribLocation( program, "vColor");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
    gl.enableVertexAttribArray(vPosition);
    gl.enableVertexAttribArray(vColor);
    render();
};
var tmpOffset = 0;
var flag = 1;
function render() {
    tmpOffset += flag * 0.01;
    if(tmpOffset > 1.0) flag = -1;
    if(tmpOffset < -1.0) flag = 1;
    offsetLoc = (new Date() - startTime) / 1000.0;
    valVersion = (offsetLoc | 0) % 2 + 1;
    offsetLoc = valVersion + (offsetLoc % 1)
    //gl.uniform1f(gl.getUniformLocation(program, "u_offset"), tmpOffset);
    gl.clear(gl.COLOR_BUFFER_BIT); 
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
    gl.drawArrays(gl.LINES, 6, 32);

}
  
