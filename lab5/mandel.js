//
// Prof R CG lect6, diamondInteractive.js
//
var gl;
var program;

// Set Projection matrix

var left = -2;           // left limit of world coords
var right = 2;           // right limit of world coords
var bottom = -2;         // bottom limit of world coords
var topBound = 2;        // top limit of worlds coord
var near = -10;           // near clip plane
var far = 10;             // far clip plane

var canvas;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" ); // Get HTML canvas
    gl = WebGLUtils.setupWebGL( canvas );                // Get an OpenGL context
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
    // Four Vertices
    var v = 2;
    var vertices = [
        vec2(-v, v),
        vec2(-v, -v),
        vec2(v, -v),

        vec2(-v, v),
        vec2(v, v),
        vec2(v, -v),

    ];

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




window.addEventListener("keydown", dealWithKeyboard, false);

// Functions that gets called to parse keydown events
function dealWithKeyboard(e) {
    switch (e.keyCode) {
        case 33: // PageUp key , Zoom in
           {
               var range = (right - left);
               var delta = (range - range * 0.9) * 0.5;
               left += delta; right -= delta;
               range = topBound - bottom;
               delta = (range - range * 0.9) * 0.5;
               bottom += delta; topBound -= delta;
           }
       break;
       case 34: // PageDown key, zoom out
           {
               var range = (right - left);
               var delta = (range * 1.1 - range) * 0.5;
               left -= delta; right += delta;
               range = topBound - bottom;
               delta = (range * 1.1 - range) * 0.5;
               bottom -= delta; topBound += delta;
           }
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




function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);                             // Clear the canvas with gl.clearColor defined above


    var ploc = gl.getUniformLocation(program, "u_proj");
    gl.uniformMatrix4fv(ploc, false, flatten(ortho(left, right, bottom, topBound, near, far)));

    var viewportDims = vec2(canvas.width, canvas.height);
    var viewportDimensionsLoc= gl.getUniformLocation(program, 'viewportDimensions');
    var leftLoc= gl.getUniformLocation(program, 'left');
    var rightLoc= gl.getUniformLocation(program, 'right');
    var bottomLoc= gl.getUniformLocation(program, 'bottom');
    var topBoundLoc= gl.getUniformLocation(program, 'topBound');

    gl.uniform2fv(viewportDimensionsLoc, viewportDims);
    gl.uniform1f(leftLoc,  left);
    gl.uniform1f(rightLoc, right);
    gl.uniform1f(bottomLoc, bottom);
    gl.uniform1f(topBoundLoc, topBound);

    gl.drawArrays(gl.TRIANGLES, 0, 6);


    requestAnimFrame(render);                                  // swap buffers, continue render loop
}
