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
var table;
var circleVertices = [];

var left = -10;           // left limit of world coords
var right = 94;           // right limit of world coords
var bottom = -10;         // bottom limit of world coords
var topBound = 66;        // top limit of worlds coord
var near = -10;           // near clip plane
var far = 10;             // far clip plane

// pool ball weighs 5.5 oz (.34375 lbs), the cue ball weighs 6.0 oz
class Ball{

    constructor (pos, col) {
        this.color = col;  // ball color
        this.radius = 1.0;
        this.mass = 0.010684;              // ball mass = .34375 lbs / (G = 32.174049)
        this.recpMass = 93.5979;           // 1.0 / mass
        this.elasticity = 0.8;
        this.position = pos;    // ball position
        this.velocity = vec2(0.0, 0.0);    // ball velocity 
        this.forceAccum = vec2(0.0, 0.0);  // force accumulator
        this.vertices = [];
        this.vertex_count = 0;
        this.fineness = 5;
    }

    init(){        
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
        //triangulate circle
        for (var degs = 0; degs <= 360; ) {
            
             var radians = RadiansToDegs(degs);
             this.vertices.push((this.position[0]));
             this.vertices.push((this.position[1])); 
             this.vertices.push(0);  
             this.vertices.push(this.color[0]);this.vertices.push(this.color[1]);this.vertices.push(this.color[2]);
            
             this.vertices.push(this.position [0] + (Math.cos(radians) * radius));
             this.vertices.push(this.position [1] + (Math.sin(radians) * radius));
             this.vertices.push(0);
             this.vertices.push(this.color[0]);this.vertices.push(this.color[1]);this.vertices.push(this.color[2]);

             degs+=this.fineness;
             radians = RadiansToDegs(degs);

             this.vertices.push(this.position [0] + (Math.cos(radians) * radius));
             this.vertices.push(this.position [1] + (Math.sin(radians) * radius));
             this.vertices.push(0);
             this.vertices.push(this.color[0]);this.vertices.push(this.color[1]);this.vertices.push(this.color[2]);
             this.vertex_count += 9;


        }
        
    }

}

class BallBag{

    constructor(){
        this.balls = [
            new Ball(vec2(45.0, 27.4), vec3(0.9, 0.9, 0.9)),
            new Ball(vec2(21.0, 28.0), vec3(0.8, 0.8, 0.0))
        ];

        this.vertices = [];
        this.vertex_count = 0;

    }

    init(){
        this.vertex_count += 6;
        for(var i = 0; i < this.balls.length; i++) {
            this.balls[i].init();
            this.vertex_count += this.balls[i].vertex_count;
            for(var k = 0; k < this.balls[i].vertices.length; k++){
                this.vertices.push(this.balls[i].vertices[k]);
            }
        }
        

        
    }

}
// 
// Implicit equation of a line, see eq. 8 in lect 5
//
function Line() {
    this.A = 0.0;
    this.B = 0.0;
    this.C = 0.0;
}

function Pocket(pos){

    this.color = vec3(0.1, 0.1, 0.1);
    this.pos = pos;
    this.radius = 2;


}
class Table{
    constructor(){
        this.color = vec3(0.2, 0.5, 0.2);
        this.dims = vec2(84, 56);
        this.pockets = [Pocket(vec2(2,2)), Pocket(vec2(82,2)), Pocket(vec2(82,54)), Pocket(vec2(2,54))];
        //0 index for cue
        this.ballBag = new BallBag();
        this.wood_width = 5.0;
        this.vertices = [];
        this.table_vertices = [
            0.0, 0.0, 0.0, this.color[0], this.color[1], this.color[2],
            this.dims[0], 0.0, 0.0, this.color[0], this.color[1], this.color[2],
            this.dims[0], this.dims[1], 0.0, this.color[0], this.color[1], this.color[2],
            0.0, 0.0, 0.0, this.color[0], this.color[1], this.color[2],
            0.0, this.dims[1], 0.0, this.color[0], this.color[1], this.color[2],
            this.dims[0], this.dims[1], 0.0, this.color[0], this.color[1], this.color[2],
        ];

        this.projection = ortho(left, right, bottom, topBound, near, far);
        this.model_view = mat4();
        

    
    }

    init(){
        this.program = initShaders( gl, "vertex-shader", "fragment-shader" ); // Compile and link shaders to form a program
        gl.useProgram(this.program);

        this.ballBag.init();
        Array.prototype.push.apply(this.vertices, this.table_vertices);
        Array.prototype.push.apply(this.vertices, this.ballBag.vertices);


        
        this.vboid = gl.createBuffer();                                       
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboid);                          
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW); 
        
        
        
        var vPosition = gl.getAttribLocation( this.program, "vPosition" );        
        gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);       
        gl.enableVertexAttribArray(vPosition); 
        
        var vColor = gl.getAttribLocation( this.program, "vColor" );        
        gl.vertexAttribPointer(vColor,3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);       
        gl.enableVertexAttribArray(vColor);
        
        this.projLoc = gl.getUniformLocation(this.program, "u_proj");
        this.modelViewLoc = gl.getUniformLocation(this.program, "u_mv");

        

    }

    render(){
        Array.prototype.push.apply(this.vertices, this.table_vertices);
        Array.prototype.push.apply(this.vertices, this.ballBag.vertices);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);               


        
        
        gl.uniformMatrix4fv(this.projLoc, false, flatten(this.projection));          
        gl.uniformMatrix4fv(this.modelViewLoc, false, flatten(this.model_view));
        gl.drawArrays(gl.TRIANGLES, 0, 6 + this.ballBag.vertex_count + 500);

    }
}


// Globals
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
    table = new Table();
    table.init();
    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height);  // What part of html are we looking at?
    gl.clearColor(0.32, 0.32, 0.32, 1.0);               // Set background color of the viewport to black

    var aspect = canvas.width / canvas.height;       // get the aspect ratio of the canvas
    left *= aspect;                                  // left limit of world coords
    right *= aspect;                                 // right limit of world coords
    

    //
    // left, see equation 8 in lect5
    //
    var leftCushion = new Line;
    var p = vec2(0.0, 28.0);
    var norm = vec2(1.0, 0.0);
    MakeCushionLine(leftCushion, p, norm);
    cushsionLines.push(leftCushion);

    // // Right
    var rightCushion = new Line;
    var p = vec2(84.0, 28.0);
    var norm = vec2(-1.0, 0.0);
    MakeCushionLine(rightCushion, p, norm);
    cushsionLines.push(rightCushion);



    



    
    // // Line

    var lineVertices = [
        linePoint1_W,
        linePoint2_W,
    ];

    // // Load the data into the GPU
    linebufferId = gl.createBuffer();                                        // Generate a VBO id
    gl.bindBuffer(gl.ARRAY_BUFFER, linebufferId);                            // Bind this VBO to be the active one
    gl.bufferData(gl.ARRAY_BUFFER, flatten(lineVertices), gl.DYNAMIC_DRAW);  // Load the VBO with vertex data

    // // Associate our shader variables with our data buffer
    

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
    var diff = 1.5;
    switch (e.keyCode) {
        case 37: // left arrow pan left
            { left += -diff; right += -diff };
            break;
        case 38: // up arrow pan left
            { bottom += diff; topBound += diff };
            break;
        case 39: // right arrow pan left
            { left += diff; right += diff };
            break;
        case 40: // down arrow pan left
            { bottom += -diff; topBound += -diff };
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

    table.ballBag.balls[0].velocity = v;
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
    var dist = DistToPoint(j, table.ballBag.balls[i].position);   // distance from circle center to cushion line
    dist -= table.ballBag.balls[i].radius;                        // subtract away circle radius

    return dist;
}


////////////////////////////////////////////////////////////////////
//
// Clear forces for ball i
//
////////////////////////////////////////////////////////////////////

function ClearForces(i)
{
    table.ballBag.balls[i].forceAccum[0] = 0.0;
    table.ballBag.balls[i].forceAccum[1] = 0.0;
}

////////////////////////////////////////////////////////////////////
//
// Compute derivatives necessary for Euler's method
//
//////////////////////////////////////////////////////////////////////

function ComputeDerivs(i)
{
    xDot = table.ballBag.balls[i].velocity;               // xDot = v

    // vDot = f/m
    vDot = mult(table.ballBag.balls[i].recpMass, table.ballBag.balls[i].forceAccum);
}

////////////////////////////////////////////////////////////////////////
//
// Appyly forces
//
/////////////////////////////////////////////////////////////////////////

function ApplyForces(i) {
    // No gravity
   
    // Apply Viscous Drag

    v = negate(table.ballBag.balls[i].velocity);                     // Have velocity point in opposite direction
    v = mult(dragForce, v);                            // Scalar multiply drag force by opposite pointing vector

    table.ballBag.balls[i].forceAccum = add(table.ballBag.balls[i].forceAccum, v); // Add to forcr accumulator
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
     for (i = 0; i < table.ballBag.balls.length; i++) {
         ClearForces(i);
     }
     // Solve ODEs using Euler's method
     for (i = 0; i < table.ballBag.balls.length; i++) {
        ApplyForces(i);
        ComputeDerivs(i);

        // Euler's method
        var delta_v = vec2();
        var delta_a = vec2();
        delta_v = mult(delta, xDot);
        delta_a = mult(delta, vDot);

        table.ballBag.balls[i].position = add(table.ballBag.balls[i].position, delta_v);
        table.ballBag.balls[i].velocity = add(table.ballBag.balls[i].velocity, delta_a);
     }
}

/////////////////////////////////////////////////////////////////////////////////
//
// Compute an impulse between two circles (table.ballBag.balls) colliding in the 2D plane See
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

    


    // Draw the pool table, and pockets (circles), need to set colorLoc to the proper color for pixel shade
                                                                  // Set RGB color of line
    table.render();
    // Call gl.drawArrays

    // Draw drag line
    if (drag)
    {
        // gl.uniform3f(colorLoc, 1.0, 1.0, 0.0);                     // Set RGB color of line
        // gl.bindBuffer(gl.ARRAY_BUFFER, linebufferId);                            // Bind this VBO to be the active one
        // gl.bufferData(gl.ARRAY_BUFFER, flatten(lineVertices), gl.DYNAMIC_DRAW);  // Load the VBO with vertex data

        // gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);  // Specify layout of VBO memory
        // gl.enableVertexAttribArray(vPosition);                        // Enable this attribute

        // gl.drawArrays(gl.LINES, 0, 2);
    }

    // Render pool table.ballBag.balls
   // gl.bindBuffer(gl.ARRAY_BUFFER, circleBufferId);                   // Bind this VBO to be the active one
    //gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);      // Specify layout of VBO memory
    //gl.enableVertexAttribArray(vPosition);

    // Loop to render each ball i, need to set pixel uniform shader colorLoc, and need to build MV_loc matrix via ball position
    //gl.uniform3f(colorLoc, .5, .5, .5);
    for (i = 0; i < table.ballBag.balls.length; i++)
    {
        // var col = table.ballBag.balls[i].color;
        //                                                                // Set RGB color of ball

        // var pos = table.ballBag.balls[i].position;        
        //                                                                // Create translate matrix MV         
        // gl.uniformMatrix4fv(MV_loc, false, flatten(MV));                

        // gl.drawArrays(gl.TRIANGLE_FAN, 0, 74);
    }
 
    requestAnimFrame(render);                                          // swap buffers, continue render loop
}
