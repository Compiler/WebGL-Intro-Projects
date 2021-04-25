//Luke Roche



var program;
var canvas;
var gl;
var perspectiveProj = true;
var wireframe = false;

var numVertices  = 36;  

var pointsArray = [];
var normalsArray = [];
var BC_Array = [];
 

var vertices = [
     vec3(-0.5,  0.5, -0.5),  
     vec3(-0.5,  0.5,  0.5),  
     vec3( 0.5,  0.5,  0.5),  
     vec3( 0.5,  0.5, -0.5),  
     vec3(-0.5, -0.5, -0.5),  
     vec3(-0.5, -0.5,  0.5),  
     vec3( 0.5, -0.5,  0.5),  
     vec3( 0.5, -0.5, -0.5)   
];


var lightPosition = vec4(4.0, 6.0, 10.0, 1.0);
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var lightDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);


var materialAmbient = vec4(0.8, 0.0, 0.0, 1.0);
var materialDiffuse = vec4(0.8, 0.0, 0.0, 1.0);
var materialSpecular = vec4(0.8, 0.8, 0.8, 1.0);
var materialShininess = 100.0;

var near = -5;
var far = 5;
var yaw = 0.0;
var pitch = 0.0;
var eyeRange = 3.0;
var dr = 0.5;   

var left = -1.5;
var right = 1.5;
var ytop = 1.5;
var bottom = -1.5;


var modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
function quad(a, b, c, d, col) {
    var u = subtract(vertices[b], vertices[a]);
    var v = subtract(vertices[c], vertices[a]);
    var normal = cross(u, v);
    console.log(normal[0] + " " + normal[1] + " " + normal[2]);

     
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     BC_Array.push(vec3(1.0, 0.0, 0.0));

     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     BC_Array.push(vec3(0.0, 1.0, 0.0));

     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     BC_Array.push(vec3(0.0, 0.0, 1.0));

     
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

function colorCube()
{
    quad( 0, 1, 2, 3, 0 );   
    quad( 4, 7, 6, 5, 1 );   
    quad( 1, 5, 6, 2, 2 );   
    quad( 0, 3, 7, 4, 3 );   
    quad( 3, 2, 6, 7, 4 );   
    quad( 0, 4, 5, 1, 5 );   
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    
    gl.clearColor(0.0, 1.0, 1.0, 1.0); 
    
    gl.enable(gl.DEPTH_TEST); 
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();



    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var bcBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bcBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(BC_Array), gl.STATIC_DRAW );

    var bcCoord = gl.getAttribLocation( program, "bcCoord" );
    gl.vertexAttribPointer(bcCoord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(bcCoord);

    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    
    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition );
 
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    invProjectionMatrixLoc = gl.getUniformLocation(program, "invProjectionMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

    

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    console.log("ambientProduct = " + ambientProduct[0] + " " + ambientProduct[1] + " " + ambientProduct[2]);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));

    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    document.getElementById("Button1").onclick = function () {pitch += dr;};                   
    document.getElementById("Button2").onclick = function(){pitch -= dr;};                     
    document.getElementById("Button3").onclick = function(){yaw -= dr;};                       
    document.getElementById("Button4").onclick = function () { yaw += dr; };                   

    document.getElementById("Button5").onclick = function () { eyeRange += 0.5; };             
    document.getElementById("Button6").onclick = function ()                                   
    {
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


window.addEventListener("keydown", dealWithKeyboard, false);


function dealWithKeyboard(e) {
    switch (e.keyCode) {
        case 37: 
            {yaw += dr * 20;}
        break;
        case 39: 
            {yaw -= dr * 20;}
        break;
        case 38: 
            {pitch += dr * 20;}
        break;
        case 40: 
            {pitch -= dr * 20;}
        break;
    }
}


var render = function() {
        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        v = vec4(0.0, 0.0, eyeRange, 1.0);             
        R1 = rotate(pitch, vec3(1.0, 0.0, 0.0));  
        R2 = rotate(yaw, vec3(0.0, 1.0, 0.0));    
        R = mult(R1, R2);                         
        v = mult(R, v);                           
        
        modelViewMatrix = lookAt(vec3(v[0], v[1], v[2]), at, up);           

        R1 = rotate(-pitch, vec3(1.0, 0.0, 0.0));  
        R2 = rotate(-yaw, vec3(0.0, 1.0, 0.0));    
        normalMatrix = mult(R2, R1);               
        normalMatrix = transpose(normalMatrix);    

        if (perspectiveProj) {
            projectionMatrix = perspective(45.0, 1, 1, 1000);               
        }
        else {
            projectionMatrix = ortho(left, right, bottom, ytop, near, far); 
        }
        
       
        var invProjectionMatrix = inverse4(projectionMatrix);

        var I = mult(invProjectionMatrix, projectionMatrix);

        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));   
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
        gl.uniformMatrix4fv(invProjectionMatrixLoc, false, flatten(invProjectionMatrix));
        gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix));

        var widthLoc = gl.getUniformLocation(program, 'width');
        var width = (wireframe) ? 0.006 : 1.0;
        gl.uniform1f(widthLoc, width);

        gl.uniform1f(gl.getUniformLocation(program, 'yaw'),   -(yaw   * 0.017453292));
        gl.uniform1f(gl.getUniformLocation(program, 'pitch'), -(pitch * 0.017453292));
            
        gl.drawArrays(gl.TRIANGLES, 0, numVertices );  
        requestAnimFrame(render);
    }
