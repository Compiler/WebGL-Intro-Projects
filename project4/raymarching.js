//Luke Roche

var gl;
var points;
var program;
var startTime, endTime;
var offsetLoc;
window.onload = function init()
{
    startTime = new Date();
     var canvas = document.getElementById("gl-canvas");
     gl = WebGLUtils.setupWebGL( canvas );    
     if (!gl) 
     {
         alert("WebGL isn't available");
     }   
     //gl.enable(gl.CULL_FACE)     
     gl.frontFace(gl.CCW);

     // Three Vertices        

     var d = 1;
    var vertices = [
        vec3(  -d, -d, 0 ), 
        vec3(  d,  -d, 0 ),
        vec3(  d, d, 0 ),

        vec3(  -d, -d, 0 ), 
        vec3(  -d,  d, 0 ),
        vec3( d, d, 0 )
    ];    
    offsetLoc = 0;
    //  Configure WebGL   
    //    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.9, 0.9, 0.9, 1);   //show the bounds of canvas
     
    //  Load shaders and initialize attribute buffers

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);        
    
    // Load the data into the GPU        

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );  
    // Associate our shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    render();
};


// Callback function for keydown events, rgeisters function dealWithKeyboard
window.addEventListener("keydown", dealWithKeyboard, false);
var yaw = 0.0;
var pitch = 0.0;
// Functions that gets called to parse keydown events
function dealWithKeyboard(e) {
    var dr = 0.005;
    switch (e.keyCode) {
        case 37: // left arrow Sweep Left
            {yaw += dr * 20;}
        break;
        case 39: // right arrow Sweep right
            {yaw -= dr * 20;}
        break;
        case 38: // up arrow Sweep Up
            {pitch -= dr * 20;}
        break;
        case 40: // down arrow Sweep Down
            {pitch += dr * 20;}
        break;
    }
}
var tmpOffset = 0;
var flag = 1;
function render() {
    tmpOffset += flag * 0.01;
    if(tmpOffset > 1.0) flag = -1;
    if(tmpOffset < -1.0) flag = 1;
    offsetLoc = (new Date() - startTime) / 1000.0;
    valVersion = (offsetLoc | 0) % 2 + 1;
    offsetLoc = valVersion + (offsetLoc % 1)
    gl.uniform1f(gl.getUniformLocation(program, "u_offset"), tmpOffset);
    gl.uniform1f(gl.getUniformLocation(program, "offsetX"), yaw);
    gl.uniform1f(gl.getUniformLocation(program, "offsetY"), pitch);
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), (new Date() - startTime) / 1000.0);

    gl.clear(gl.COLOR_BUFFER_BIT); 
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    window.requestAnimationFrame(render);
}
  
