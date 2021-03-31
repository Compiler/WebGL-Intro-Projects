//
// Prof R CG lect6, diamondInteractive.js
//
var gl;
var program;

// Set Projection matrix

var left = -10;           // left limit of world coords
var right = 10;           // right limit of world coords
var bottom = -10;         // bottom limit of world coords
var topBound = 10;        // top limit of worlds coord
var near = -10;           // near clip plane
var far = 10;             // far clip plane

var chosen_leftEye = 0;
var chosen_rightEye = 1;
var chosen_nose  = 2;
var chosen_mouth = 3;
var chosenItem = 0;

var startTime, endTime;

var red = .5;            
var blue = 0.0;
var green = 0.0;

//var MV;                   // Model View Matrix

// Define callback function for window.onload
window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" ); // Get HTML canvas
    startTime = new Date();
    
    gl = WebGLUtils.setupWebGL( canvas );                // Get an OpenGL context
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
    // Four Vertices
    
    var vertices = [
        vec2(-0.5,-0.5),
        vec2( 0.5,-0.5),
        vec2( 0.5, 0.5),
        vec2(-0.5, 0.5)
    ];

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);  // What part of html are we looking at?
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );               // Set background color of the viewport to black
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" ); // Compile and link shaders to form a program
    gl.useProgram(program);                                              // Make this the active shaer program

    var aspect = canvas.width / canvas.height;        // get the aspect ratio of the canvas
    left  *= aspect;                             // left limit of world coords
    right *= aspect;                             // right limit of world coords

    // Done setting View Transformation matrix
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();                                    // Generate a VBO id
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );                          // Bind this VBO to be the active one
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW ); // Load the VBO with vertex data

    // Associate our shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );        // Link js vPosition with "vertex shader attribute variable" - vPosition
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0 );        // Specify layout of VBO memory
    gl.enableVertexAttribArray(vPosition);                             // Enable this attribute

    render();
};



// Four callback functions for the four Pan buttons
document.getElementById("LeftEye").onclick = function () { chosenItem = chosen_leftEye; };
document.getElementById("RightEye").onclick = function () { chosenItem = chosen_rightEye; };
document.getElementById("Nose").onclick = function () { chosenItem = chosen_nose; };
document.getElementById("Mouth").onclick = function () { chosenItem = chosen_mouth; };

// Callback function for keydown events, rgeisters function dealWithKeyboard
window.addEventListener("keydown", dealWithKeyboard, false);

// Functions that gets called to parse keydown events
function dealWithKeyboard(e) {
    switch (e.keyCode) {
       case 37: // left arrow pan left
            {left += -0.1; right += -0.1};
       break;
       case 38: // up arrow pan left
            {bottom += 0.1; topBound += 0.1};
       break;
       case 39: // right arrow pan left
            {left += 0.1; right += 0.1};
       break;
       case 40: // down arrow pan left
            {bottom += -0.1; topBound += -0.1};
       break;
    }
}

function DrawBlockHead()
{
    var time = (new Date() - startTime);
    var colorLoc = gl.getUniformLocation(program, "color");      // Get fragment shader memory location of color
    gl.uniform3f(colorLoc, red, green, blue);                    // Set RGB of frangment shader uniform variable "color" to (red,green, blue)

    var scaleMat = scale(10.0, 10.0, 0.0);                       // Scale unit square by a factor of 10
    var translateMat = translate(0.0, 0.0, 0.0);                 // Translate the 5x5 square no where
    var modelView = mult(translateMat, scaleMat);                // Compose the scale and the translate via matrix multiply storing the result in the modelView matrix
    // var modelView = mult(scaleMat, translateMat);             // Incorrect multiplication order
   
    var MV_loc = gl.getUniformLocation(program, "MV");           // Get Vertex shader memory location for the MV matrix

    gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);                        // Draw two triangles using the TRIANGLE_FAN primitive using 4 vertices

    gl.uniform3f(colorLoc, 1.0, 1.0, 0.0);                       // Set RGB of frangment shader uniform variable "color" to yellow

    var rotation = rotate(time, vec3(0.5, 1, 1));

    
    // Left eye
    modelView = translate(-2.5, 2.0, 0.0);                       // translate the unit square -2.5 in the x direction, and 2.0 in the y direction storing in modelView
    if(chosenItem == chosen_leftEye) modelView = mult(translate(-2.5, 2.0, 0.0), rotation);
    gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
    gl.drawArrays(gl.LINE_LOOP, 0, 4);                           // Invoke the render of the left eye

    // Right eye
    modelView = translate(2.5, 2.0, 0.0);                        // translate the unit square -2.5 in the x direction, and 2.0 in the y direction storing in modelView
    if(chosenItem == chosen_rightEye) modelView = mult(translate(2.5, 2.0, 0.0), rotation);
    gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
    gl.drawArrays(gl.LINE_LOOP, 0, 4);                           // Invoke the render of the right eye

    // Nose
    modelView = translate(0.0, 0.0, 0.0);   
    if(chosenItem == chosen_nose) modelView = rotation;
                         // Set the modelView matrix to the identity matrix
    gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
    gl.drawArrays(gl.LINE_LOOP, 0, 4);                           // Invoke the render of the nose

    // Mouth
    scaleMat = scale(5.0, 1.0, 0.0);                             // Scale unit square in x-direction by 5.0 to form a 5x1 rectangle
    translateMat = translate(0.0, -2.0, 0.0);                    // Translate the 5x1 rectangle down -2.0 in the y direction
    modelView = mult(translateMat, scaleMat);  
    if(chosenItem == chosen_mouth) modelView = mult(mult(translateMat, scaleMat), rotation);
                      // Compose the scale and the translate via matrix multiply storing the result in the modelView matrix
    gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));      // push values of modelView matrix down to the vertex shader uniform variable MV
    gl.drawArrays(gl.LINE_LOOP, 0, 4);                           // Invoke the render of the mouth rectangle


}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);                             // Clear the canvas with gl.clearColor defined above

    var PMat;                                                  // js variable to hold projection matrix
    PMat = ortho(left, right, bottom, topBound, near, far);    // Call function to compute orthographic projection matrix

    var P_loc = gl.getUniformLocation(program, "P");           // Get Vertex shader memory location for P
    gl.uniformMatrix4fv(P_loc, false, flatten(PMat));          // Set uniform variable P on GPU 

    DrawBlockHead();

    requestAnimFrame(render);                                  // swap buffers, continue render loop
}
