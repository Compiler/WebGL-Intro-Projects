//
// Prof R Intro to CG Project 1 code for scanline algorithm
// Luke Roche
// USE A & D to cycle through line segments!! for some reason arrow keys won't register on my device.

var gl;
var program;
var points;

var bufferIdWireCircle;
var bufferIdSolidCircle;
var pixels = new Array(676);
var x1 = 1, x2 = 1, y1 = 23, y2 = 20;
var positions = [
    1,1,23,20,
    1,1,24,2,
    1,1,24,14,
    1,1,2,24,
    24,24,1,20,
    13,23,12,1
]
var index = 0;

function RadiansToDegs(degree) {
    var rad = degree * (Math.PI / 180);
    return rad;
}
function onKeyPress(event){
    if(event.code == 'KeyA') 
        if (index == 0) index = 5;
        else index = Math.abs((index - 1) % 6);
    if(event.code == 'KeyD') index = Math.abs((index + 1) % 6);


    x1 = positions[index + 0];
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    ClearPixels();
    window.onload();
}
window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
    }

    document.addEventListener('keypress', onKeyPress, false);
    //////////////////////////////////////////////////////////////////////  

    var verticesWire = [];
    for (var degs = 0; degs <= 360; degs += 5) {
        var radians = RadiansToDegs(degs);

        verticesWire.push(vec2(Math.cos(radians), Math.sin(radians)));
    }

    var verticesSolid = [];
    verticesSolid.push(vec2(0.0, 0.0));
    for (var degs = 0; degs <= 360; degs += 5) {
        var radians = RadiansToDegs(degs);

        verticesSolid.push(vec2(Math.cos(radians), Math.sin(radians)));
    }

    //  Configure WebGL   
    //    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);

    //  Load shaders and initialize attribute buffers

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU        
    bufferIdWireCircle = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdWireCircle);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesWire), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Solid circle
    bufferIdSolidCircle = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdSolidCircle);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesSolid), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Create 2d Orthographic view matrix
    var left = -20.0, right = 1020.0, bot = -20.0, top = 1020.0, near = -1.0, far = 1.0;
    var orthoMatrix = new Float32Array([
        2.0 / (right - left), 0.0, 0.0, 0.0,
        0.0, 2.0 / (top - bot), 0.0, 0.0,
        0.0, 0.0, -2.0 / (far - near), 0.0,
        -(right + left) / (right - left), -(top + bot) / (top - bot), -(far + near) / (far - near), 1.0

    ]);

    var u_orthoMatrix = gl.getUniformLocation(program, 'u_orthoMatrix');
    gl.uniformMatrix4fv(u_orthoMatrix, false, orthoMatrix);
    ScanLine(positions[0 + index], positions[1 + index], positions[2 + index],positions[3 + index]);
    DrawPixels();
    DrawLine(positions[0 + index], positions[1 + index], positions[2 + index],positions[3 + index]);
   

}


///////////////////////////////////////////////////////////////////////////////////////////////////

function DrawCircleWireframe()
{
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdWireCircle);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays(gl.LINE_STRIP, 0, 73);
}

///////////////////////////////////////////////////////////////////////////////////////////////////

function DrawCircleSolid() {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferIdSolidCircle);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 74);
}


////////////////////////////////////////////////////////////////////////////////////////////////////

function DrawLine(x1, y1, x2, y2)
{
    var verts = [];
    verts.push(vec2(x1 * 40 - 1, y1 * 40 - 1));
    verts.push(vec2(x2 * 40 - 1, y2 * 40 - 1));

    // Load the data into the GPU        
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verts), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer, Is this VAO?
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var xformMatrix = new Float32Array([
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    ]);

    var u_xformMatrix = gl.getUniformLocation(program, 'u_xformMatrix');
    gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);

    gl.drawArrays(gl.LINES, 0, 2);
}

////////////////////////////////////////////////////////////////////////////////////////////////////

function ClearPixels()
{
    for (i = 0; i < pixels.length; i++) {
        pixels[i] = false;
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////

function DrawPixels()
{
    // Create matrix to scale

    var Sx = 10.0, Sy = 10.0, Sz = 1.0;
    var xformMatrix = new Float32Array([
       Sx, 0.0, 0.0, 0.0,
       0.0, Sy, 0.0, 0.0,
       0.0, 0.0, Sz, 0.0,
       0.0, 0.0, 0.0, 1.0
    ]);

    var u_xformMatrix = gl.getUniformLocation(program, 'u_xformMatrix');

    for (i = 0; i < 26; i++) {
        for (j = 0; j < 26; j++) {
            xformMatrix[12] = i * 40.0 - 1;
            xformMatrix[13] = j * 40.0 - 1;
            gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
            if (pixels[i * 26 + j] == true) {
                DrawCircleSolid();
            }
            else
            {
                DrawCircleWireframe();
            }
        }
    }
}

function SetPixelOn(i, j)
{
    if ((i >= 0) && (i < 26) && (j >= 0) && (j < 26))
    {
        pixels[i * 26 + j] = true;
    }
}


///////////////////////////////////////////////////////////////////////

function Sign(val) {
    if (val < 0)
        return -1;
    if (val > 0)
        return 1;
    else
        return 0;
}

/***************************************************************************
 *
 * General Bresenhams's algorithm (Students need to implment algorithm)
 *
 ****************************************************************************/

function ScanLine(x1, y1, x2, y2){

    var rise = y2 - y1;
    var run = x2 - x1;
    //console.log("(", x1, ", ", y1, ") \t->\t","(", x2, ", ", y2, ")");
    //console.log("(", "run", ", ", "rise", ") = ", "(", run, ", ", rise, ")");

    if(run == 0){
        //console.log("run == 0");
        if(y2 < y1){
            var tmp = y1;
            y1 = y2;
            y2 = tmp;
        }
        for(var y = y1; y < y2 + 1; y++) SetPixelOn(x1, y);

    }else{
        //console.log("run != 0");

        var m = rise / run;
        //console.log("m = ", m)
        var adj = m >= 0 ? 1 : -1;
        offset = 0;
        threshold = 0.5;
        if(m <= 1 && m >= -1){
            //console.log("m <= 1 && m >= -1");

            var delta = m < 0 ? -m : m;//abs
            //console.log("delta > 0, delta = ", delta)
            var y = y1;
            if (x2 < x1){
                //console.log("x2 < x1");
                
                var tmp = x1;
                x1 = x2;
                x2 = tmp;
                y = y2;
            }
            for(var x = x1; x < x2 + 1; x++){
                SetPixelOn(x, y);
                offset+= delta;
                if(offset >= threshold){
                    y += adj;
                    threshold += 1;
                }
            }

        }else{
            //console.log("!(m <= 1 && m >= -1)");

            delta = run / rise < 0 ? -(run/rise) : run / rise;
            //console.log("delta > 0, delta = ", delta)
            var x = x1;
            if(y2 < y1){
                var tmp = y1;
                y1 = y2;
                y2 = tmp;
                x = x2;
            }
            for(var y = y1; y < y2 + 1; y++){
                SetPixelOn(x, y);
                offset+= delta;
                if(offset >= threshold){
                    x += adj;
                    threshold += 1;
                }
            }

        }


    }
}

