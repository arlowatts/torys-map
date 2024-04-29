import { gl, programInfo, buffer, torus, view, zoom, pan, look } from "./properties.js";

// draw the scene
export function drawScene() {
    gl.useProgram(programInfo.program);
    setPositionAttribute();

    // disable depth testing
    gl.disable(gl.DEPTH_TEST);

    let uniforms = programInfo.uniformLocations;

    // set the shader uniforms
    gl.uniform4fv(uniforms.cameraPosition, getCameraPosition());

    gl.uniformMatrix4fv(uniforms.viewDirectionMatrix, false, getViewDirectionMatrix());
    gl.uniformMatrix4fv(uniforms.lightDirectionMatrix, false, getLightDirectionMatrix());

    gl.uniform1f(uniforms.largeRadius, torus.radius.large / zoom.val);
    gl.uniform1f(uniforms.smallRadius, torus.radius.small / zoom.val);

    gl.uniform1i(uniforms.terrainDetail, Math.min(Math.max(torus.terrainDetail.base - zoom.precise, torus.terrainDetail.min), torus.terrainDetail.max));
    gl.uniform1f(uniforms.terrainSize, torus.terrain.size * zoom.val);
    gl.uniform1f(uniforms.terrainHeight, torus.terrain.height / zoom.val);

    // set the shapes to draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffer.vertexCount);
}

// create a vector to define the camera's position
function getCameraPosition() {
    const r1 = -(torus.radius.large / zoom.val);
    const r2 = -(view.camera.height + torus.radius.small / zoom.val);

    return vec4.fromValues(
        (Math.cos(pan.theta) * r2 + r1) * Math.sin(pan.phi),
        (Math.sin(pan.theta) * -r2),
        (Math.cos(pan.theta) * r2 + r1) * Math.cos(pan.phi),
        0
    );
}

// create a view direction matrix to define the camera's angle
function getViewDirectionMatrix() {
    const matrix = mat4.create();

    mat4.rotate(matrix, matrix, pan.phi, [0, 1, 0]);
    mat4.rotate(matrix, matrix, pan.theta, [1, 0, 0]);

    if (view.isFirstPerson) {
        mat4.rotate(matrix, matrix, look.phi, [0, 0, 1]);
        mat4.rotate(matrix, matrix, look.theta, [1, 0, 0]);
    }

    return matrix;
}

// create a light direction matrix to define the position of the sun
function getLightDirectionMatrix() {
    const matrix = mat4.create();

    mat4.rotate(matrix, matrix, torus.time / torus.length.day * Math.TAU, torus.axis.day);
    mat4.rotate(matrix, matrix, torus.time / (torus.length.day * torus.length.year) * Math.TAU, torus.axis.year);

    return matrix;
}

// define the mapping from the buffers to the attributes
function setPositionAttribute() {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.data);

    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        buffer.numComponents,
        buffer.type,
        buffer.normalize,
        buffer.stride,
        buffer.offset
    );

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}
