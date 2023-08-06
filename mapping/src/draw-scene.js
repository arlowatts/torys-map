export function drawScene(gl, programInfo, buffers) {
    // clear the screen to black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the parameters for the perspective matrix
    const fieldOfView = 0.25 * Math.PI;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;

    // create the projection matrix
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // create the model matrix at the center of the scene
    const modelMatrix = mat4.create();
    // mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, 0.0]);

    // create the view matrix distanced from the model to see it fully
    const viewMatrix = mat4.create();
    mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -15.0]);

    setPositionAttribute(gl, buffers, programInfo);

    gl.useProgram(programInfo.program);

    // set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix);
    gl.uniform4uiv(programInfo.uniformLocations.noiseScale, new Uint32Array([100, 100, 100, 100]));

    // set the shapes to draw
    const offset = 0;
    const vertexCount = 6;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
}

// define the mapping from the buffers to the attributes
function setPositionAttribute(gl, buffers, programInfo) {
    const numComponents = 2; // use two values per step
    const type = gl.FLOAT; // set the data type as 32 bit float
    const normalize = false;
    const stride = 0; // use default stride based on numComponents and type
    const offset = 0; // starting position in the buffer

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}
