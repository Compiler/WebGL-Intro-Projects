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
var MAX_VEL = 1.5;

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

    update(){
        if(this.velocity[0] > MAX_VEL)this.velocity[0] = MAX_VEL;
        if(this.velocity[1] > MAX_VEL)this.velocity[1] = MAX_VEL;
        this.position[0] += this.velocity[0];
        this.position[1] += this.velocity[1];
        this.vertices = [];
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
       }

    }

    init(){        
        //triangulate circle
        for (var degs = 0; degs <= 360; ) {
            
             var radians = RadiansToDegs(degs);
             this.vertices.push((this.position[0]));
             this.vertices.push((this.position[1])); 
             this.vertices.push(0);  
             this.vertices.push(this.color[0]);this.vertices.push(this.color[1]);this.vertices.push(this.color[2]);
            
             this.vertices.push(this.position [0] + (Math.cos(radians) * this.radius));
             this.vertices.push(this.position [1] + (Math.sin(radians) * this.radius));
             this.vertices.push(0);
             this.vertices.push(this.color[0]);this.vertices.push(this.color[1]);this.vertices.push(this.color[2]);

             degs+=this.fineness;
             radians = RadiansToDegs(degs);

             this.vertices.push(this.position [0] + (Math.cos(radians) * this.radius));
             this.vertices.push(this.position [1] + (Math.sin(radians) * this.radius));
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
            new Ball(vec2(5.0, 10.0), vec3(1, 0, 0)),
            new Ball(vec2(10.0, 10.0), vec3(1, 0, 1)),
            new Ball(vec2(15.0, 10.0), vec3(1, 1, 0)),
            new Ball(vec2(20.0, 10.0), vec3(0, 1, 0)),
            new Ball(vec2(25.0, 10.0), vec3(0, 0, 0)),
            new Ball(vec2(30.0, 10.0), vec3(0, 0, 1)),
            new Ball(vec2(40.0, 10.0), vec3(0.7, 0, 0)),
            new Ball(vec2(50.0, 10.0), vec3(0.7, 0, 1)),
            new Ball(vec2(60.0, 10.0), vec3(0.7, 0.7, 0)),
            new Ball(vec2(70.0, 10.0), vec3(0, 0.7, 0)),
            new Ball(vec2(80.0, 10.0), vec3(0, 0.7, 0.7)),
            new Ball(vec2(90.0, 10.0), vec3(0, 0, 0.7)),
            new Ball(vec2(70.0, 10.0), vec3(0, 0.2, 0)),
            new Ball(vec2(80.0, 10.0), vec3(0, 0.2, 0.2)),
            new Ball(vec2(90.0, 10.0), vec3(0, 1, 1)),
            
            new Ball(vec2(2,2), vec3(0.5, 0.5, 0.5)),
            new Ball(vec2(82,2), vec3(0.5, 0.5, 0.5)),
            new Ball(vec2(82,54), vec3(0.5, 0.5, 0.5)),
            new Ball(vec2(2,54), vec3(0.5, 0.5, 0.5)),
            
        ];

        this.vertices = [];
        this.vertex_count = 0;

    }

    update(){
        this.vertices = [];
        
        for(var i = 0; i < this.balls.length; i++) {
            this.balls[i].update();
            Array.prototype.push.apply(this.vertices, this.balls[i].vertices);
        }
    }

    init(){
        this.vertex_count += 6;
        for(var i = 0; i < this.balls.length; i++) {
            this.balls[i].init();
            this.vertex_count += this.balls[i].vertex_count;
            Array.prototype.push.apply(this.vertices, this.balls[i].vertices);
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
        this.position = vec2(0, 0)
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

    rackem(){
        this.ballBag.balls[0].position = vec2( this.dims[0] / 4, this.dims[1] / 2)
        var r = 4 * this.ballBag.balls[0].radius
        var sx = this.dims[0] - this.dims[0] / 4
        var sy = this.dims[1] / 2
        this.ballBag.balls[1].position = vec2( sx, sy)

        this.ballBag.balls[2].position = vec2( sx + r, sy - r / 2)
        this.ballBag.balls[3].position = vec2( sx + r, sy + r / 2)

        this.ballBag.balls[4].position = vec2( sx + 2 * r, (sy + r / 2) - r / 2)
        this.ballBag.balls[5].position = vec2( sx + 2 * r, (sy + r / 2) + r / 2)
        this.ballBag.balls[6].position = vec2( sx + 2 * r, (sy + r / 2) - 3 * r / 2)

        this.ballBag.balls[7].position = vec2( sx + 3 * r, (sy + r / 16) - 3 * r / 2)
        this.ballBag.balls[8].position = vec2( sx + 3 * r, (sy + r / 16) -  r /  2)
        this.ballBag.balls[9].position = vec2( sx + 3 * r, (sy + r / 16) + r / 2 )
        this.ballBag.balls[10].position = vec2( sx + 3 * r, (sy + r / 16) + 1.5 * r )
        
        this.ballBag.balls[11].position = vec2( sx + 4 * r, (sy + r / 16) + 2 * r )
        this.ballBag.balls[12].position = vec2( sx + 4 * r, (sy + r / 16) + 2 * r / 2 )
        this.ballBag.balls[13].position = vec2( sx + 4 * r, (sy + r / 16))
        this.ballBag.balls[14].position = vec2( sx + 4 * r, (sy + r / 16) - 3 * r / 3)
        this.ballBag.balls[15].position = vec2( sx + 4 * r, (sy + r / 16) - 2 * r)



    }

    init(){
        this.program = initShaders( gl, "vertex-shader", "fragment-shader" ); // Compile and link shaders to form a program
        gl.useProgram(this.program);

        this.ballBag.init();
        this.rackem();
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

        gl.uniformMatrix4fv(this.projLoc, false, flatten(this.projection));          
        gl.uniformMatrix4fv(this.modelViewLoc, false, flatten(this.model_view));

    }

    update(){
        this.vertices=[];
        var w = 15;
        this.vertices = [        ];
        this.ballBag.update();
        Array.prototype.push.apply(this.vertices, this.table_vertices);
        Array.prototype.push.apply(this.vertices, this.ballBag.vertices);
    }

    render(){

        this.update();

        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.DYNAMIC_DRAW);         
        var workingVal = 6 + this.ballBag.vertex_count + 3;
      
        gl.drawArrays(gl.TRIANGLES, 0, workingVal / 3);


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
    //gl.bindBuffer(gl.ARRAY_BUFFER, linebufferId);                            // Bind this VBO to be the active one
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(lineVertices), gl.DYNAMIC_DRAW);  // Load the VBO with vertex data

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
    v[0] /= 50.0;
    v[1] /= 50.0;

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
    var ball1 = table.ballBag.balls[i];
    var ball2 = table.ballBag.balls[j];
    var v1 = ball1.velocity;
    var v2 = ball2.velocity;

    //u 
    var u = vec2((ball1.position[0] - ball2.position[0]) * (ball1.position[0] - ball2.position[0]), (ball1.position[1] - ball2.position[1]) * (ball1.position[1] - ball2.position[1])) ;
    var d = Math.sqrt(u[0] * u[0] + u[1] + u[1]);
    var n = vec2(u[0] * 1.0/d, u[1] * 1.0/d);
    var int_p = (v1[0] * n[0] + v1[1] + n[1]) - (v2[0] * n[0] + v2[1] + n[1]);
    console.log(int_p)
    var p = (2 * (int_p) / (ball1.mass + ball2.mass))
    console.log("Sup")
    var p1 = p * ball1.mass
    var p2 = p * ball2.mass
    console.log(v1[0], p, p1[0], n[0])
    ball1.velocity = vec2(v1[0] - (p1 * n[0] + p1 * n[1]), v1[1] - (p1 * n[0] + p1 * n[1]))
    ball2.velocity = vec2(v2[0] - (p2 * n[0] + p2 * n[1]), v2[1] - (p2 * n[0] + p2 * n[1]))
    console.log(ball1.velocity[0])

}

/////////////////////////////////////////////////////////////////////////////////////
//
// Method to implment eq. 9.8 to compute impulse for ball i hitting a cushionLine j
// This method should alter the velocity of ball i
//
/////////////////////////////////////////////////////////////////////////////////////
//0 = bottom
//1 = top
//2 = left
//3 = right
function ImpulseWithCushion(i, j)
{
    var velX = table.ballBag.balls[i].velocity[0];
    var velY = table.ballBag.balls[i].velocity[1];
    if(j == 0){
        table.ballBag.balls[i].velocity[1] = -2 * (velY) + velY; 
    }else if(j == 1){
        table.ballBag.balls[i].velocity[1] = -2 * (-1 * -velY) + velY; 
    }else if(j == 2){
        table.ballBag.balls[i].velocity[0] = -2 * (-1 * -velX) * 1 + velX; 
    }else if(j == 3){
        table.ballBag.balls[i].velocity[0] = -2 * (velX) + velX; 
    }

}

function check_for_cushion_collision(i){
    var curBall = this.table.ballBag.balls[i];
    if(curBall.position[0] + curBall.radius > table.position[0] + table.dims[0]){
        ImpulseWithCushion(i, 3);
    }
    if(curBall.position[0] - curBall.radius < 0){
        ImpulseWithCushion(i, 2);
    }
    if(curBall.position[1] + curBall.radius > table.position[1] + table.dims[1]){
        ImpulseWithCushion(i, 1);
    }
    if(curBall.position[1] - curBall.radius < 0){
        ImpulseWithCushion(i, 0);
    }
}
var num_sunk = 0;
function interects(i, j){
    var b1 = this.table.ballBag.balls[i];
    var b2 = this.table.ballBag.balls[j];
    var b1x = b1.position[0];var b1y = b1.position[1];var b1r = b1.radius;
    var b2x = b2.position[0];var b2y = b2.position[1];var b2r = b2.radius;
    var xdif = b2x > b1x ? b2x - b1x : b1x - b2x;var ydif = b2y > b1y ? b2y - b1y : b1y - b2y;
    var dsts = xdif * xdif + ydif * ydif;
    var intersects = dsts < (b1r + b2r) * (b1r + b2r);
    if(intersects){
        if(j > 15){
            b1.position[0] = -5; //sunk ball
            b1.position[1] = 5 * num_sunk++;
            b1.velocity = vec2(0, 0);
            return false;
        }
        if(i > 15){
            b2.position[0] = -5; //sunk ball
            b2.position[1] = 5 * num_sunk++;
            b2.velocity = vec2(0, 0);
            return false;
        }
    }
    return intersects;

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
    for(var i = 0; i < this.table.ballBag.balls.length-1; i++){
        check_for_cushion_collision(i);
        for(var k = i+1; k < this.table.ballBag.balls.length; k++){
            check_for_cushion_collision(k);
            if(interects(i, k)){
                console.log("intersection")
                ImpulseWithBall(i, k);
            }


        }
    }

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
