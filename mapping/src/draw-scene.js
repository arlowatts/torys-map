import { torys } from "./properties.js";

// draw the scene to the given webgl context
export function drawScene(gl, programInfo, buffers, view, lightDirection) {
    // clear the screen to black
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // set the parameters for the perspective matrix
    const fieldOfView = 0.25 * Math.PI;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = view.zoom * 0.5;
    const zFar = (view.zoom + torys.largeRadius + torys.smallRadius) * 2;

    // create the projection matrix
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // create the view matrix
    const viewMatrix = mat4.create();
    mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -torys.smallRadius - view.zoom]);
    mat4.rotate(viewMatrix, viewMatrix, view.theta, [1.0, 0.0, 0.0]);
    mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -torys.largeRadius]);
    mat4.rotate(viewMatrix, viewMatrix, view.phi, [0.0, 1.0, 0.0]);

    setPositionAttribute(gl, buffers, programInfo);

    gl.useProgram(programInfo.program);

    // set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.viewMatrix, false, viewMatrix);
    gl.uniform4fv(programInfo.uniformLocations.lightDirection, new Float32Array(lightDirection));
    gl.uniform1f(programInfo.uniformLocations.zoomLevel, view.zoom);

    // set the shapes to draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.position.vertexCount);
}

// define the mapping from the buffers to the attributes
function setPositionAttribute(gl, buffers, programInfo) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position.data);

    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        buffers.position.numComponents,
        buffers.position.type,
        buffers.position.normalize,
        buffers.position.stride,
        buffers.position.offset
    );

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}
