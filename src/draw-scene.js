import { gl, programInfo, buffer, torus, view, light } from "./properties.js";

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

    gl.uniform1f(uniforms.largeRadius, torus.largeRadius / view.zoom);
    gl.uniform1f(uniforms.smallRadius, torus.smallRadius / view.zoom);

    gl.uniform1i(uniforms.terrainDetail, Math.min(Math.max(torus.terrainDetail - view.zoomPrecise, torus.minTerrainDetail), torus.maxTerrainDetail));
    gl.uniform1f(uniforms.terrainSize, torus.terrainSize * view.zoom);
    gl.uniform1f(uniforms.terrainHeight, torus.terrainHeight / view.zoom);

    // set the shapes to draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffer.vertexCount);
}

// create a vector to define the camera's position
function getCameraPosition() {
    const r1 = -(torus.largeRadius / view.zoom);
    const r2 = -(view.cameraHeight + torus.smallRadius / view.zoom);

    const cameraPosition = vec4.fromValues(
        (Math.cos(view.theta) * r2 + r1) * Math.sin(view.phi),
        (Math.sin(view.theta) * -r2),
        (Math.cos(view.theta) * r2 + r1) * Math.cos(view.phi),
        0.0
    );

    return cameraPosition;
}

// create a view direction matrix to define the camera's angle
function getViewDirectionMatrix() {
    const matrix = mat4.create();

    mat4.rotate(matrix, matrix, view.phi, [0.0, 1.0, 0.0]);
    mat4.rotate(matrix, matrix, view.theta, [1.0, 0.0, 0.0]);

    if (view.firstPerson) {
        mat4.rotate(matrix, matrix, view.fphi, [0.0, 0.0, 1.0]);
        mat4.rotate(matrix, matrix, view.ftheta, [1.0, 0.0, 0.0]);
    }

    return matrix;
}

// create a light direction matrix to define the position of the sun
function getLightDirectionMatrix() {
    const matrix = mat4.create();

    mat4.rotate(matrix, matrix, view.time / light.dayLength * Math.PI * 2, light.dayAxis);
    mat4.rotate(matrix, matrix, view.time / (light.dayLength * light.yearLength) * Math.PI * 2, light.yearAxis);

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
