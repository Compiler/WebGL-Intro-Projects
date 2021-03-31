//
// Prof R CG lect6, diamondInteractive.js
//
var gl;
var program;
var canvas;

var delta_t = 0.01;      // simulation time step
var drag = false;
var linePoint1_W = vec2(0.0, 0.0);
var linePoint2_W = vec2(5.0, 5.0);
var linebufferId;
var circleBufferId;
var circleVertices = [];

var left = -10;           // left limit of world coords
var right = 10;           // right limit of world coords
var bottom = -10;         // bottom limit of world coords
var topBound = 10;        // top limit of worlds coord
var near = -10;           // near clip plane
var far = 10;             // far clip plane

function Ball() {
    this.color = vec3(0.9, 0.9, 0.9);  // ball color
    this.mass = 1.0;                   // ball mass
    this.recpMass = 1.0;               // 1.0 / mass
    this.position = vec2(0.0, 0.0);    // ball position
    this.velocity = vec2(0.0, 0.0);    // ball velocity 
}

var balls = [];

///////////////////////////////////////////////////////////////////////
//
// Define callback function for window.onload
//
///////////////////////////////////////////////////////////////////////
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" ); // Get HTML canvas
    
    gl = WebGLUtils.setupWebGL( canvas );                // Get an OpenGL context
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);  // What part of html are we looking at?
    gl.clearColor(0.0, 0.0, 0.0, 1.0);               // Set background color of the viewport to black

    var aspect = canvas.width / canvas.height;       // get the aspect ratio of the canvas
    left *= aspect;                                  // left limit of world coords
    right *= aspect;                                 // right limit of world coords
    
    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" ); // Compile and link shaders to form a program
    gl.useProgram(program);                                          // Make this the active shaer program

    var cueBall = new Ball;
    cueBall.position = vec2(0.0, 0.0);

    var redBall = new Ball;
    redBall.color = vec3(0.9, 0.0, 0.0);
    redBall.position = vec2(-5.0, 0.0)

    balls.push(cueBall);
    balls.push(redBall);

    // Circle

    circleVertices.push(vec2(0.0, 0.0));
    for (var degs = 0; degs <= 360; degs += 5) {
        var radians = RadiansToDegs(degs);

        circleVertices.push(vec2(Math.cos(radians), Math.sin(radians)));
    }


    // Create VBO for circle
    circleBufferId = gl.createBuffer();                                       // Generate a VBO id
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBufferId);                           // Bind this VBO to be the active one
    gl.bufferData(gl.ARRAY_BUFFER, flatten(circleVertices), gl.STATIC_DRAW);  // Load the VBO with vertex data
    
    // Line

    var lineVertices = [
        linePoint1_W,
        linePoint2_W,
    ];

    // Load the data into the GPU
    linebufferId = gl.createBuffer();                                        // Generate a VBO id
    gl.bindBuffer(gl.ARRAY_BUFFER, linebufferId);                            // Bind this VBO to be the active one
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lineVertices), gl.DYNAMIC_DRAW);  // Load the VBO with vertex data

    // Associate our shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );        // Link js vPosition with "vertex shader attribute variable" - vPosition
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0 );        // Specify layout of VBO memory
    gl.enableVertexAttribArray(vPosition);                               // Enable this attribute

    // Register mouse callbacks
    canvas.addEventListener("mousedown", mouseDown, false);
    canvas.addEventListener("mouseup", mouseUp, false);
    canvas.addEventListener("mouseout", mouseUp, false);
    canvas.addEventListener("mousemove", mouseMove, false);

    // Callback function for keydown events, rgeisters function dealWithKeyboard
    window.addEventListener("keydown", dealWithKeyboard, false);


    render();
};

// Function that gets called to parse keydown events
function dealWithKeyboard(e) {
    switch (e.keyCode) {
        case 37: // left arrow pan left
            { left += -0.1; right += -0.1 };
            break;
        case 38: // up arrow pan left
            { bottom += 0.1; topBound += 0.1 };
            break;
        case 39: // right arrow pan left
            { left += 0.1; right += 0.1 };
            break;
        case 40: // down arrow pan left
            { bottom += -0.1; topBound += -0.1 };
            break;
    }
}

/////////////////////////////////////////////////////////////////

function ScreenToWorld2D(screen)
{
    var a = screen[0] / canvas.width;
    var b = screen[1] / canvas.height;
    x_W = left + a * (right - left);
    y_W = bottom + b * (topBound - bottom);

    return vec2(x_W, y_W);
}

/////////////////////////////////////////////////////////////////

function RadiansToDegs(degree) {
    var rad = degree * (Math.PI / 180);
    return rad;
}

//================= Mouse events ======================*/


var mouseDown = function (e) {
    drag = true;

    var point_S = vec2(e.pageX, Math.abs(e.pageY - canvas.height))
    linePoint1_W = ScreenToWorld2D(point_S);

    e.preventDefault();
    return false;
};

var mouseUp = function (e) {
    drag = false;

    var v = vec2();
    v = subtract(linePoint1_W, linePoint2_W);
    console.log(v[0], " ", v[1]);
    balls[0].velocity = v;
};

var mouseMove = function (e) {
    if (!drag) return false;

    var point_S = vec2(e.pageX, Math.abs(e.pageY - canvas.height));
    linePoint2_W = ScreenToWorld2D(point_S);
 
    e.preventDefault();
};

function Simulate()
{
    for (i = 0; i < balls.length; i++)
    {
        var pos      = balls[i].position;
        var velocity = balls[i].velocity;
        pos[0] = pos[0] + velocity[0] * delta_t;
        pos[1] = pos[1] + velocity[1] * delta_t ;
    }
}


function render() {
    var lineVertices = [
       linePoint1_W,
       linePoint2_W
    ];

    Simulate();

    gl.clear(gl.COLOR_BUFFER_BIT);                             // Clear the canvas with gl.clearColor defined above

    var PMat;                                                  // js variable to hold projection matrix
    PMat = ortho(left, right, bottom, topBound, near, far);    // Call function to compute orthographic projection matrix
    var P_loc = gl.getUniformLocation(program, "P");           // Get Vertex shader memory location for P
    gl.uniformMatrix4fv(P_loc, false, flatten(PMat));          // Set uniform variable P on GPU 

    var MV = mat4();                                           // Identity Matrix
    var MV_loc = gl.getUniformLocation(program, "MV");         // Get Vertex shader memory location for P
    gl.uniformMatrix4fv(MV_loc, false, flatten(MV));

    var colorLoc = gl.getUniformLocation(program, "color");    // Get fragment shader memory location of color
    var vPosition = gl.getAttribLocation(program, "vPosition");  // Link js vPosition with "vertex shader attribute variable" - vPosition

    // Draw drag line
    if (drag)
    {
        gl.uniform3f(colorLoc, 1.0, 1.0, 0.0);                     // Set RGB color of line
        gl.bindBuffer(gl.ARRAY_BUFFER, linebufferId);                            // Bind this VBO to be the active one
        gl.bufferData(gl.ARRAY_BUFFER, flatten(lineVertices), gl.DYNAMIC_DRAW);  // Load the VBO with vertex data

        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);  // Specify layout of VBO memory
        gl.enableVertexAttribArray(vPosition);                        // Enable this attribute

        gl.drawArrays(gl.LINES, 0, 2);
    }

    // Draw a balls
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBufferId);                   // Bind this VBO to be the active one
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);      // Specify layout of VBO memory
    gl.enableVertexAttribArray(vPosition);

    for (i = 0; i < balls.length; i++)
    {
        var col = balls[i].color;
        gl.uniform3f(colorLoc, col[0], col[1], col[2]);               // Set RGB color of ball

        var pos = balls[i].position;
        MV = translate(pos[0], pos[1], 0.0);
        gl.uniformMatrix4fv(MV_loc, false, flatten(MV));

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 74);
    }
 
    requestAnimFrame(render);                                          // swap buffers, continue render loop
}
