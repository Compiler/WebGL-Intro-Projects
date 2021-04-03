//
// Prof R pool lect9
//
var gl;
var program;
var canvas;


var drag = false;
var linePoint1_W = vec2(0.0, 0.0);
var linePoint2_W = vec2(5.0, 5.0);
var linebufferId;
var circleBufferId;
var tableBufferId;
var circleVertices = [];

var left = -10;           // left limit of world coords
var right = 66;           // right limit of world coords
var bottom = -10;         // bottom limit of world coords
var topBound = 66;        // top limit of worlds coord
var near = -10;           // near clip plane
var far = 10;             // far clip plane

// pool ball weighs 5.5 oz (.34375 lbs), the cue ball weighs 6.0 oz

function Ball() {
    this.color = vec3(0.9, 0.9, 0.9);  // ball color
    this.radius = 1.0;
    this.mass = 0.010684;              // ball mass = .34375 lbs / (G = 32.174049)
    this.recpMass = 93.5979;           // 1.0 / mass
    this.elasticity = 0.8;
    this.position = vec2(0.0, 0.0);    // ball position
    this.velocity = vec2(0.0, 0.0);    // ball velocity 
    this.forceAccum = vec2(0.0, 0.0);  // force accumulator
}

// 
// Implicit equation of a line, see eq. 8 in lect 5
//
function Line() {
    this.A = 0.0;
    this.B = 0.0;
    this.C = 0.0;
}


// Globals
var balls = [];             // Array of pool balls (With a full rack this will be 15 colored balls, plus one cue ball
var cushsionLines = [];     // Array of pool table cushions (this will be a size of 4)

var simTime = 0.0;          // Simulation clock
var delta_t = 0.01;         // simulation time step
var delta_d = 0.01;         // collision distance delta
var xDot = vec2(0.0, 0.0);  // Derivative of position
var vDot = vec2(0.0, 0.0);  // Deriviative of velocity
var dragForce = 0.003;      // drag force

///////////////////////////////////////////////////////////////////////
//
// Define callback function for window.onload
//
///////////////////////////////////////////////////////////////////////
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" ); // Get HTML canvas
    
    gl = WebGLUtils.setupWebGL( canvas );                // Get an OpenGL context
    if (!gl) { alert("WebGL isn't available"); }

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
    cueBall.position = vec2(45.0, 27.4);

    var ball2 = new Ball;
    ball2.color = vec3(0.8, 0.8, 0.0);
    ball2.position = vec2(21.0, 28.0);

    balls.push(cueBall);
    balls.push(ball2);

    //
    // left, see equation 8 in lect5
    //
    var leftCushion = new Line;
    var p = vec2(0.0, 28.0);
    var norm = vec2(1.0, 0.0);
    MakeCushionLine(leftCushion, p, norm);
    cushsionLines.push(leftCushion);

    // Right
    var rightCushion = new Line;
    var p = vec2(84.0, 28.0);
    var norm = vec2(-1.0, 0.0);
    MakeCushionLine(rightCushion, p, norm);
    cushsionLines.push(rightCushion);

    // Bot
    
    // Top
    
    // Rectangle

    var tableVertices = [
        vec2(0.0, 0.0),
        vec2(84.0, 0.0),
        vec2(84.0, 56.0),
        vec2(0.0, 56.0)
    ];

    // Create VBO for table
    tableBufferId = gl.createBuffer();                                       // Generate a VBO id
    gl.bindBuffer(gl.ARRAY_BUFFER, tableBufferId);                           // Bind this VBO to be the active one
    gl.bufferData(gl.ARRAY_BUFFER, flatten(tableVertices), gl.STATIC_DRAW);  // Load the VBO with vertex data

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
 //   canvas.addEventListener("mouseout", mouseUp, false);
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

    balls[0].velocity = v;
};

var mouseMove = function (e) {
    if (!drag) return false;

    var point_S = vec2(e.pageX, Math.abs(e.pageY - canvas.height));
    linePoint2_W = ScreenToWorld2D(point_S);
 
    e.preventDefault();
};

/////////////////////////////////////////////////////////////////////////////
//
// Create the implicit equation for a line for a cushion, see eq. 8 in lect5
//
//////////////////////////////////////////////////////////////////////////////

function MakeCushionLine(line, p, norm)
{
    var len = length(norm);
    var n = norm;
    n[0] = norm[0] / len;
    n[1] = norm[1] / len;

    line.A = norm[0];
    line.B = norm[1];

    var u = negate(n);
    line.C = dot(u, p);
}

////////////////////////////////////////////////////////////////////
//
// Given a cushsionLines j, compute the min distance to a point p.
//
/////////////////////////////////////////////////////////////////////

function DistToPoint(j, p)
{
    var dist = cushsionLines[j].A * p[0] + cushsionLines[j].B * p[1] + cushsionLines[j].C;

    return dist;
}


///////////////////////////////////////////////////////////////////
//
//  Compute the distance between ball i and ball j
//  See eq. 9.2 in lect 9. This method computes d1
//
///////////////////////////////////////////////////////////////////

function DistToBall(i, j)
{

    return 1.0;
}

/////////////////////////////////////////////////////////////////////////////////////////////
//
// Given a circle i, compute the min distance from the circle perimeter to the cushion line j
//
/////////////////////////////////////////////////////////////////////////////////////////////

function DistToLine(i, j)
{
    var dist = DistToPoint(j, balls[i].position);   // distance from circle center to cushion line
    dist -= balls[i].radius;                        // subtract away circle radius

    return dist;
}


////////////////////////////////////////////////////////////////////
//
// Clear forces for ball i
//
////////////////////////////////////////////////////////////////////

function ClearForces(i)
{
    balls[i].forceAccum[0] = 0.0;
    balls[i].forceAccum[1] = 0.0;
}

////////////////////////////////////////////////////////////////////
//
// Compute derivatives necessary for Euler's method
//
//////////////////////////////////////////////////////////////////////

function ComputeDerivs(i)
{
    xDot = balls[i].velocity;               // xDot = v

    // vDot = f/m
    vDot = mult(balls[i].recpMass, balls[i].forceAccum);
}

////////////////////////////////////////////////////////////////////////
//
// Appyly forces
//
/////////////////////////////////////////////////////////////////////////

function ApplyForces(i) {
    // No gravity
   
    // Apply Viscous Drag

    v = negate(balls[i].velocity);                     // Have velocity point in opposite direction
    v = mult(dragForce, v);                            // Scalar multiply drag force by opposite pointing vector

    balls[i].forceAccum = add(balls[i].forceAccum, v); // Add to forcr accumulator
}

///////////////////////////////////////////////////////////////////////////////////////
//
// Advance time, and solve differental equations Newtonian motion using Euler's method.
// Runge-Kutta is a more accurate method.
// https://scicomp.stackexchange.com/questions/20172/why-are-runge-kutta-and-eulers-method-so-different
//
////////////////////////////////////////////////////////////////////////////////////////

function AdvanceTime(delta)
{
     simTime += delta;
     for (i = 0; i < balls.length; i++) {
         ClearForces(i);
     }
     // Solve ODEs using Euler's method
     for (i = 0; i < balls.length; i++) {
        ApplyForces(i);
        ComputeDerivs(i);

        // Euler's method
        var delta_v = vec2();
        var delta_a = vec2();
        delta_v = mult(delta, xDot);
        delta_a = mult(delta, vDot);

        balls[i].position = add(balls[i].position, delta_v);
        balls[i].velocity = add(balls[i].velocity, delta_a);
     }
}

/////////////////////////////////////////////////////////////////////////////////
//
// Compute an impulse between two circles (balls) colliding in the 2D plane See
// lect 9 slides, eqs. 9-13 - 9-17
//
///////////////////////////////////////////////////////////////////////////////////

function ImpulseWithBall(i, j)
{

}

/////////////////////////////////////////////////////////////////////////////////////
//
// Method to implment eq. 9.8 to compute impulse for ball i hitting a cushionLine j
// This method should alter the velocity of ball i
//
/////////////////////////////////////////////////////////////////////////////////////

function ImpulseWithCushion(i, j)
{

}

/////////////////////////////////////////////////////////////////////////////////////////////////
//
// This method will first test each ball pair for possible collision, then test each ball against
// each of the four cushions. If a collision occurs it will invike the appropriate impulse method.
//
//////////////////////////////////////////////////////////////////////////////////////////////////

function CollisionTest()
{
    // Loop to test each ball i against each ball j. If the collide need to call ImpulseWithBall(i, j)
   

    // Loop to test each ball i against each cushionLine j. If the collide need to call  ImpulseWithCushion((i, j)

}

///////////////////////////////////////////////////////////////////////

function render() {
    var lineVertices = [
       linePoint1_W,
       linePoint2_W
    ];

    AdvanceTime(delta_t);
    CollisionTest();

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

    // Draw the pool table, and pockets (circles), need to set colorLoc to the proper color for pixel shade
                                                                  // Set RGB color of line
    gl.bindBuffer(gl.ARRAY_BUFFER, tableBufferId);                // Bind this VBO to be the active one

    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);  // Specify layout of VBO memory
    gl.enableVertexAttribArray(vPosition);                        // Enable this attribute

                                                                  // Call gl.drawArrays

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

    // Render pool balls
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBufferId);                   // Bind this VBO to be the active one
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);      // Specify layout of VBO memory
    gl.enableVertexAttribArray(vPosition);

    // Loop to render each ball i, need to set pixel uniform shader colorLoc, and need to build MV_loc matrix via ball position
    gl.uniform3f(colorLoc, .5, .5, .5);
    for (i = 0; i < balls.length; i++)
    {
        var col = balls[i].color;
                                                                       // Set RGB color of ball

        var pos = balls[i].position;        
                                                                       // Create translate matrix MV         
        gl.uniformMatrix4fv(MV_loc, false, flatten(MV));                

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 74);
    }
 
    requestAnimFrame(render);                                          // swap buffers, continue render loop
}
