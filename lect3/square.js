
//Luke Roche

var gl;
var points;
var program;
var startTime, endTime;
var iterations = 15.0;
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

    var dim = 0.15;
    var offsets = vec2(-0.75, 0.75);
    var vertOff = 1.0;
    var distFactor = vec2(1.35, 1.1);


    var polyPoints = {};
    var l = 0.25;
    var curPoint, nextPoint;
    var step = (2*Math.PI) / 8.0;
    for(var i = 0; i < 8; i++){

        var currentIndex = i % 8;
        var nextIndex = (i+1) % 8;
        polyPoints[currentIndex] = vec3(l*Math.cos(currentIndex * step), l*Math.sin(currentIndex * step), vertOff);
        polyPoints[nextIndex] = vec3(l*Math.cos(nextIndex * step), l*Math.sin(nextIndex * step), vertOff);
    }
    var circlePoints = {};
    var conversion = (Math.PI / 180.0); 
    var circleCenter = vec3(0, 0, vertOff);
    for(var i = 0; i < iterations; i++){
        var theta = (360.0 / iterations * i) * conversion;
        circlePoints[i] = vec3(l * Math.cos(theta), l*Math.sin(theta), vertOff);
    }
        var vertices_rect = [
        vec3(  -dim + offsets[0], -dim + offsets[1], vertOff ), vec3(0, 1, 0),
        vec3(  -dim + offsets[0],  dim + offsets[1], vertOff ), vec3(1, 0, 0),
        vec3(   dim + offsets[0], -dim + offsets[1], vertOff ), vec3(0, 0, 1),

        vec3(  dim + offsets[0], dim + offsets[1], vertOff ),   vec3(0, 1, 0),
        vec3(  -dim + offsets[0],  dim + offsets[1], vertOff ), vec3(1, 0, 0),
        vec3(   dim + offsets[0], -dim + offsets[1], vertOff ), vec3(0, 0, 1),

        //conv polygon from-to
        polyPoints[0], vec3(1,0,0), polyPoints[1], vec3(0,1,0),
        polyPoints[1], vec3(0,1,0), polyPoints[2], vec3(0,0,1),
        polyPoints[2], vec3(0,0,1), polyPoints[3], vec3(1,0,0),
        polyPoints[3], vec3(0,0,1), polyPoints[4], vec3(1,0,0),
        polyPoints[4], vec3(0,0,1), polyPoints[5], vec3(1,0,0),
        polyPoints[5], vec3(0,0,1), polyPoints[6], vec3(1,0,0),
        polyPoints[6], vec3(0,0,1), polyPoints[7], vec3(1,0,0),
        polyPoints[7], vec3(0,0,1), polyPoints[0], vec3(1,0,0),

    ];    
    vertices_rect.push(circlePoints[0]);
    vertices_rect.push(vec3(1,0,0));
    for(var i = 0; i < iterations; i++){
        vertices_rect.push(circlePoints[i]);vertices_rect.push(vec3(1,0,0));
        vertices_rect.push(circlePoints[i]);vertices_rect.push(vec3(1,0,0));
    }
    vertices_rect.push(circlePoints[0]);
    vertices_rect.push(vec3(1,0,0));



    for(var i = 0; i < iterations; i++){
        vertices_rect.push(circleCenter); vertices_rect.push(vec3(0,0,1));
        vertices_rect.push(circlePoints[(i + 0) % iterations]); vertices_rect.push(vec3(0,0,1));
        vertices_rect.push(circlePoints[(i + 1) % iterations]); vertices_rect.push(vec3(0,0,1));
    }

    offsetLoc = 0;
    //  Configure WebGL   
    //    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.5, 0.5, 0.5, 1);   //show the bounds of canvas
     
    //  Load shaders and initialize attribute buffers

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);        
    
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
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), (new Date() - startTime) / 1000.0);
    
    gl.clear(gl.COLOR_BUFFER_BIT); 
    gl.uniform1f(gl.getUniformLocation(program, "u_offset"), 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
    gl.uniform1f(gl.getUniformLocation(program, "u_offset"), 0.5);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.uniform1f(gl.getUniformLocation(program, "u_offset"), -0.65);
    gl.drawArrays(gl.LINES, 6, 16);

    gl.uniform1f(gl.getUniformLocation(program, "u_offset"), 0);
    gl.drawArrays(gl.LINES, 24, 20);

    gl.uniform1f(gl.getUniformLocation(program, "u_offset"), 0);
    gl.drawArrays(gl.LINES, 24, iterations * 2);

    gl.uniform1f(gl.getUniformLocation(program, "u_offset"), 0.67);
    gl.drawArrays(gl.TRIANGLES, 24 + iterations * 2, 50);
    window.requestAnimationFrame(render);
}
  
