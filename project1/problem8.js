//Luke Roche
/*
Use WASD to move awkwardly through the scene.
Click G to grow circle increment (fineness of cirlce) by double            
Click H to shrink...

G and H will steadily increase the elapsed time-- and i don't know why! oops
*/
var gl;
var points;
var program;
var iterations = 4;
var cameraPositionX = 0;
var cameraPositionY = 0;
var camSpeed = 0.3;
function onKeyPress(event){
    if(event.code == 'KeyS'){
        cameraPositionX -= 1.0;
    }
    if(event.code == 'KeyW'){
        cameraPositionX += 1.0;
    }

    if(event.code == 'KeyA'){
        cameraPositionY -= 1.0;
    }
    if(event.code == 'KeyD'){
        cameraPositionY += 1.0;
    }
    if(event.code == 'KeyG'){
        iterations *= 2;
        window.onload();
    }

    if(event.code == 'KeyH'){
        iterations /= 2;
        window.onload();
    }

}
window.onload = function init()
{
    startTime = new Date();
     var canvas = document.getElementById("gl-canvas");
     gl = WebGLUtils.setupWebGL( canvas );    
     if (!gl) 
     {
         alert("WebGL isn't available");
     }   
    document.addEventListener('keydown', onKeyPress, false);

    var vertices = [];    
    var circlePoints = [];
    var conversion = (Math.PI / 180.0); 
    var circleCenter = vec3(0, 0, 0);
    var l = 1.0;
    for(var i = 0; i < iterations; i++){
        var theta = (360.0 / iterations * i) * conversion;
        circlePoints[i] = vec3(l * Math.cos(theta), l*Math.sin(theta), 0.25);
    }
    console.log(circlePoints)
    for(var i = 0; i < iterations; i++){
        vertices.push(circleCenter);
        vertices.push(circlePoints[(i)]);
        vertices.push(circlePoints[(i + 1) % iterations]);
    }

    offsetLoc = 0;
    //  Configure WebGL   
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
var tmpOffset = 0;
var flag = 1;
function render() {
    //calculate the offset in time normalized in a hacky way
    tmpOffset += flag * 0.01;
    if(tmpOffset > 1.0) flag = -1;
    if(tmpOffset < -1.0) flag = 1;
    offsetLoc = (new Date() - startTime) / 1000.0;
    valVersion = (offsetLoc | 0) % 2 + 1;
    offsetLoc = valVersion + (offsetLoc % 1)
    gl.uniform1f(gl.getUniformLocation(program, "u_offset"), tmpOffset);
    gl.uniform1f(gl.getUniformLocation(program, "u_time"), (new Date() - startTime) / 1000.0);
    //set cam offset
    gl.uniform1f(gl.getUniformLocation(program, "u_camPosX"), cameraPositionX);
    gl.uniform1f(gl.getUniformLocation(program, "u_camPosY"), cameraPositionY);
    //clear and iterate
    gl.clear(gl.COLOR_BUFFER_BIT); 
    gl.drawArrays(gl.TRIANGLES, 0, iterations*3);
    window.requestAnimationFrame(render);
}
  
