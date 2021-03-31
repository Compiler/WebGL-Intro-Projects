


var gl;
var program;



var left = -10;           
var right = 10;           
var bottom = -10;         
var topBound = 10;        
var near = -10;           
var far = 10;             

var red = 1;            
var blue = 1;
var green = 1;




window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" ); 
    
    gl = WebGLUtils.setupWebGL( canvas );                
    if ( !gl ) { alert( "WebGL isn't available" ); }

    
    
    
    var vertices = [
        vec2(-0.5,-0.5),
        vec2( 0.5,-0.5),
        vec2( 0.5, 0.5),
        vec2(-0.5, 0.5)
    ];

    
    
    
    gl.viewport(0, 0, canvas.width, canvas.height);  
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );               
    
    
    program = initShaders( gl, "vertex-shader", "fragment-shader" ); 
    gl.useProgram(program);                                              

    var aspect = canvas.width / canvas.height;        
    left  *= aspect;                             
    right *= aspect;                             

    
    
    
    var bufferId = gl.createBuffer();                                    
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );                          
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW ); 

    
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );        
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0 );        
    gl.enableVertexAttribArray(vPosition);                             

    render();
};




function drawF()
{
    var colorLoc = gl.getUniformLocation(program, "color");      
    gl.uniform3f(colorLoc, red, green, blue);                    

    var scaleMat = scale(10.0, 10.0, 0.0);                       
    var translateMat = translate(0.0, 0.0, 0.0);                 
    var modelView = mult(translateMat, scaleMat);                
    
   
    var MV_loc = gl.getUniformLocation(program, "MV");           

    gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));      

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);                        

    gl.uniform3f(colorLoc, 0.0, 0.0, 0.0);                       

    
    modelView = mult(translate(-2.5, 0.40, 0.0), scale(1, 7, 0));
    gl.uniformMatrix4fv(MV_loc, false, flatten (modelView));
    gl.drawArrays(gl.LINE_LOOP, 0, 4); 
    
    modelView = mult(translate(-0.2, 3.40, 0.0), scale(3.5, 1, 0));
    gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));
    gl.drawArrays(gl.LINE_LOOP, 0, 4);  


    modelView = mult(translate(-1.1, 1.40, 0.0), scale(1.75, 1, 0));
    gl.uniformMatrix4fv(MV_loc, false, flatten(modelView));
    gl.drawArrays(gl.LINE_LOOP, 0, 4);  
    
    


}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);                             

    var PMat;                                                  
    PMat = ortho(left, right, bottom, topBound, near, far);    

    var P_loc = gl.getUniformLocation(program, "P");           
    gl.uniformMatrix4fv(P_loc, false, flatten(PMat));          

    drawF();

    requestAnimFrame(render);                                  
}
