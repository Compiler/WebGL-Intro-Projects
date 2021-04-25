
//
// Prof R CG lect14 lighting, shading
//
var program;
var canvas;
var gl;
var perspectiveProj = true;
var wireframe = false;

var numVertices  = 36;  // every vertex gets duplicated three times

var pointsArray = [];
var normalsArray = [];
var BC_Array = [];
 //                        0            3
 //                          __________
 //                        /|         /|                      
 //                       / |        / |                      
 //                      /  |     2 /  |
 //                   1 /___|______/   |                   y
 //                     |   |      |   |                   |
 //                     |   | 4    |   |                   |
 //                     |   /------|---| 7                 |
 //                     |  /       |  /                    |_______ x
 //                     | /        | /                    /
 //                     |/_________|/                    /
 //                    5             6                  /
 //                                                    z
 //

var vertices = [
     vec3(-0.5,  0.5, -0.5),  // 0
     vec3(-0.5,  0.5,  0.5),  // 1
     vec3( 0.5,  0.5,  0.5),  // 2
     vec3( 0.5,  0.5, -0.5),  // 3
     vec3(-0.5, -0.5, -0.5),  // 4
     vec3(-0.5, -0.5,  0.5),  // 5
     vec3( 0.5, -0.5,  0.5),  // 6
     vec3( 0.5, -0.5, -0.5)   // 7
];

// Define light and material properties

var lightPosition = vec4(4.0, 6.0, 10.0, 1.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// Smooth gold
//var materialAmbient = vec4(1.0, 0.8, 0.0, 1.0);
//var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
//var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
//var materialShininess = 100.0;

// Smooth red plastic
var materialAmbient = vec4(0.8, 0.0, 0.0, 1.0);
var materialDiffuse = vec4(0.8, 0.3, 0.6, 1.0);
var materialSpecular = vec4(0.8, 0.8, 0.8, 1.0);
var materialShininess = 100.0 / 100.0;

var near = -5;
var far = 5;
var yaw = 0.0;
var pitch = 0.0;
var eyeRange = 3.0;
var dr = 0.5;   // degree step

var left = -1.5;
var right = 1.5;
var ytop = 1.5;
var bottom = -1.5;


var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var lightAtEye = false;
var roughness =  5;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// quad uses first index to set color for face

function quad(a, b, c, d, col) {
    var u = subtract(vertices[b], vertices[a]);
    var v = subtract(vertices[c], vertices[a]);
    var normal = cross(u, v);
    console.log(normal[0] + " " + normal[1] + " " + normal[2]);

     // triangle 1
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     BC_Array.push(vec3(1.0, 0.0, 0.0));

     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     BC_Array.push(vec3(0.0, 1.0, 0.0));

     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     BC_Array.push(vec3(0.0, 0.0, 1.0));

     // triangle 2
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     BC_Array.push(vec3(1.0, 0.0, 0.0));

     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     BC_Array.push(vec3(0.0, 1.0, 0.0));

     pointsArray.push(vertices[d]);
     normalsArray.push(normal); 
     BC_Array.push(vec3(0.0, 0.0, 1.0));
}

// Each face determines two triangles

function colorCube()
{
    quad( 0, 1, 2, 3, 0 );   // top
    quad( 4, 7, 6, 5, 1 );   // bot
    quad( 1, 5, 6, 2, 2 );   // front
    quad( 0, 3, 7, 4, 3 );   // back
    quad( 3, 2, 6, 7, 4 );   // right
    quad( 0, 4, 5, 1, 5 );   // left
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    //gl.clearColor( 0.4, .4, .8, 1.0 ); // Background color (clear color)  // blue
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Background color (clear color)    // black
    
    gl.enable(gl.DEPTH_TEST); // Hidden surface removal vis the z-buffer

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();
    for (var i = 0; i < 36; i++)
    {
        console.log(normalsArray[i][0] + " " + normalsArray[i][1] + " " + normalsArray[i][2]);
    }

    // Normal attribute VBO

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // BC attribute VBO

    var bcBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bcBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(BC_Array), gl.STATIC_DRAW );

    // Set up Vertex Shader attribute bcBuffer
    var bcCoord = gl.getAttribLocation( program, "bcCoord" );
    gl.vertexAttribPointer(bcCoord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(bcCoord);

    // VBO for points
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    // Set up Vertex Shader attribute vPosition
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition );
 
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    invProjectionMatrixLoc = gl.getUniformLocation(program, "invProjectionMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

    // Material uniforms

    


    // buttons to change viewing parameters

    document.getElementById("Button1").onclick = function () {pitch += dr;};                   // Sweep Up
    document.getElementById("Button2").onclick = function(){pitch -= dr;};                     // Sweep Down
    document.getElementById("Button3").onclick = function(){yaw -= dr;};                       // Sweep Right
    document.getElementById("Button4").onclick = function () { yaw += dr; };                   // Sweep Left

    document.getElementById("Button5").onclick = function () { eyeRange += 0.5; };             // Dolly Out
    document.getElementById("Button6").onclick = function ()                                   // Dolly Out
    {
        eyeRange -= 0.5;
        eyeRange = (eyeRange < 0.5) ? 0.5 : eyeRange;
    };              

    document.getElementById("Button7").onclick = function () { wireframe = !wireframe; };    // Z-buffer on
    document.getElementById("Button9").onclick = function () { gl.enable(gl.DEPTH_TEST); };    // Z-buffer on
    document.getElementById("Button10").onclick = function () { gl.disable(gl.DEPTH_TEST); };  // Z-buffer off
    document.getElementById("Button11").onclick = function () { perspectiveProj = true; };
    document.getElementById("Button12").onclick = function () { perspectiveProj = false; };
    document.getElementById("Button13").onclick = function () { lightAtEye = true; };
    document.getElementById("Button14").onclick = function () { lightAtEye = false; };
    document.getElementById("myRange").onchange = function () { roughness = this.value / 255.0; console.log(roughness) };
    document.getElementById("lr").onchange = function () {  lightDiffuse[0] = this.value/255.0 };
    document.getElementById("lg").onchange = function () {  lightDiffuse[1] = this.value/255.0 };
    document.getElementById("lb").onchange = function () {  lightDiffuse[2] = this.value/255.0 };

    document.getElementById("dr").onchange = function () {  materialDiffuse[0] = this.value/255.0 };
    document.getElementById("dg").onchange = function () {  materialDiffuse[1] = this.value/255.0 };
    document.getElementById("db").onchange = function () {  materialDiffuse[2] = this.value/255.0 };

    document.getElementById("macr").onchange = function () {  materialAmbient[0] = this.value/255.0 };
    document.getElementById("macg").onchange = function () {  materialAmbient[1] = this.value/255.0 };
    document.getElementById("macb").onchange = function () {  materialAmbient[2] = this.value/255.0 };
       
    render();
}

// Callback function for keydown events, rgeisters function dealWithKeyboard
window.addEventListener("keydown", dealWithKeyboard, false);

// Functions that gets called to parse keydown events
function dealWithKeyboard(e) {
    switch (e.keyCode) {
        case 37: // left arrow Sweep Left
            {yaw += dr * 20;}
        break;
        case 39: // right arrow Sweep right
            {yaw -= dr * 20;}
        break;
        case 38: // up arrow Sweep Up
            {pitch += dr * 20;}
        break;
        case 40: // down arrow Sweep Down
            {pitch -= dr * 20;}
        break;
    }
}


var render = function() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        v = vec4(0.0, 0.0, eyeRange, 1.0);             // default eye vector
        R1 = rotate(pitch, vec3(1.0, 0.0, 0.0));  // pitch about x-axis
        R2 = rotate(yaw, vec3(0.0, 1.0, 0.0));    // yaw about y-axis
        R = mult(R1, R2);                         // Combine view rotation matrices into one matrix
        v = mult(R, v);                           // multiple by the default eye position to get the current eye position
        
        modelViewMatrix = lookAt(vec3(v[0], v[1], v[2]), at, up);           // call lookat with eye postion

        // Create Normal Matrix (Take transpose of the inverse of ModelView 3x3 sub matrix)
        // var R3 = inverse4(R);  // bug with inverse4
        // So next 3 lines are inverse of R
        R1 = rotate(-pitch, vec3(1.0, 0.0, 0.0));  // pitch about x-axis
        R2 = rotate(-yaw, vec3(0.0, 1.0, 0.0));    // yaw about y-axis
        normalMatrix = mult(R2, R1);               // Inverse of 3 x 3 V matrix
        normalMatrix = transpose(normalMatrix);    // followed by the transpose

        if (perspectiveProj) {
            projectionMatrix = perspective(45.0, 1, 1, 1000);               // perspective projection
        }
        else {
            projectionMatrix = ortho(left, right, bottom, ytop, near, far); // orthographic projection
        }
        
       // Update modelView and prkection matrices in Vertex) shader
        var invProjectionMatrix = inverse4(projectionMatrix);

        var I = mult(invProjectionMatrix, projectionMatrix);
        if(lightAtEye){
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(v));
            lightPosition = v;
        }else{
            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
        }

        
        var ambientProduct = mult(lightAmbient, materialAmbient);
        var diffuseProduct = mult(lightDiffuse, materialDiffuse);
        var specularProduct = mult(lightSpecular, materialSpecular);

        gl.uniform4fv(gl.getUniformLocation(program, "viewPos"), flatten(v));
        gl.uniform4fv(gl.getUniformLocation(program, "lightColor"), flatten(lightDiffuse));
        gl.uniform4fv(gl.getUniformLocation(program, "objectColor"), flatten(materialDiffuse));

        gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
        gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
        gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
        gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess * roughness * 2.0);
        gl.uniform1f(gl.getUniformLocation(program, "viewPos"), flatten(v));

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));   
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(invProjectionMatrixLoc, false, flatten(invProjectionMatrix));
        gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));

        var widthLoc = gl.getUniformLocation(program, 'width');
        var width = (wireframe) ? 0.006 : 1.0;
        gl.uniform1f(widthLoc, width);

        gl.uniform1f(gl.getUniformLocation(program, 'yaw'),   -(yaw   * 0.017453292));
        gl.uniform1f(gl.getUniformLocation(program, 'pitch'), -(pitch * 0.017453292));
            
        gl.drawArrays(gl.TRIANGLES, 0, numVertices );  // Render the triangles of the box
        requestAnimFrame(render);
    }
