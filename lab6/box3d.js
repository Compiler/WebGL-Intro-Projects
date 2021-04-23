
//
// Prof R CG lect1, ortho1.js
//
var canvas;
var gl;

var numVertices  = 36;  // every vertex gets duplicated three times

var pointsArray = [];
var colorsArray = [];
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

var vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0),   // black, top
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red, bottom
        vec4( 0.0, 1.0, 1.0, 1.0 ),  // cyan, front
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green, back
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue, right
        vec4( 1.0, 0.0, 1.0, 1.0 )   // magenta, left
    ];

var near = -5;
var far = 5;
var yaw = 0.0;
var pitch = 0.0;
var dr = 0.5;   // degree step

var left = -1.5;
var right = 1.5;
var ytop = 1.5;
var bottom = -1.5;


var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// quad uses first index to set color for face

function quad(a, b, c, d, col) {
     // triangle 1
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[col]); 
     pointsArray.push(vertices[b]); 
     colorsArray.push(vertexColors[col]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[col]);

     // triangle 2
     pointsArray.push(vertices[a]); 
     colorsArray.push(vertexColors[col]); 
     pointsArray.push(vertices[c]); 
     colorsArray.push(vertexColors[col]); 
     pointsArray.push(vertices[d]); 
     colorsArray.push(vertexColors[col]);   
}

// Each face determines two triangles

function colorCube()
{
    quad( 0, 1, 2, 3, 0 );   // top
    quad( 4, 7, 6, 5, 1 );   // bot
    quad( 1, 5, 6, 2, 2 );   // front
    quad( 0, 3, 7, 4, 3 );   // back
    quad( 3, 7, 6, 2, 4 );   // right
    quad( 0, 4, 5, 1, 5 );   // left
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor( 0.4, .4, .8, 1.0 ); // Background color (clear color)
    
    gl.enable(gl.DEPTH_TEST); // Hidden surface removal vis the z-buffer

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();

    // Color attribute VBO
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );
    
    // Set up Vertex Shader attribute vColor
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor);

    // VBO for points
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    // Set up Vertex Shader attribute vPosition
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition );
 
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

    // buttons to change viewing parameters

    document.getElementById("Button1").onclick = function () {pitch += dr;};  
    document.getElementById("Button2").onclick = function(){pitch -= dr;};  
    document.getElementById("Button3").onclick = function(){yaw -= dr;};    
    document.getElementById("Button4").onclick = function(){yaw += dr;};    
    document.getElementById("Button5").onclick = function () { eyeRange += 0.5; };             
    document.getElementById("Button6").onclick = function (){                                   
        eyeRange -= 0.5;
        eyeRange = (eyeRange < 0.5) ? 0.5 : eyeRange;
    };              
    document.getElementById("Button7").onclick = function () { wireframe = !wireframe; };    
    document.getElementById("Button9").onclick = function () { gl.enable(gl.DEPTH_TEST); };    
    document.getElementById("Button10").onclick = function () { gl.disable(gl.DEPTH_TEST); }; 
    document.getElementById("Button11").onclick = function () { perspectiveProj = true; };
    document.getElementById("Button12").onclick = function () { perspectiveProj = false; };
       
       
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
        
        v = vec4(0.0, 0.0, 1.0, 1.0);             // default eye vector
        R1 = rotate(pitch, vec3(1.0, 0.0, 0.0));  // pitch about x-axis
        R2 = rotate(yaw, vec3(0.0, 1.0, 0.0));    // yaw about y-axis
        R = mult(R1, R2);                         // Combine view rotation matrices into one matrix
        v = mult(R, v);                           // multiple by the default eye position to get the current eye position
        
        modelViewMatrix = lookAt(vec3(v[0], v[1], v[2]), at , up);       // call lookat with eye postion
        projectionMatrix = ortho(left, right, bottom, ytop, near, far);  // set up a 3D orthoganal projection
        
        // Update modelView and prkection matrices in Vertex shader
        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));   
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
            
        gl.drawArrays(gl.TRIANGLES, 0, numVertices );  // Render the triangles of the box
        requestAnimFrame(render);
    }
