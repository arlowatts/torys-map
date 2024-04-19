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
    gl.uniformMatrix4fv(uniforms.lightDirectionMatrix, false, light.directionMatrix);
    gl.uniform1f(uniforms.terrainResolution, view.zoom * torus.terrainResolution);
    gl.uniform1f(uniforms.terrainNormalResolution, view.zoom * torus.terrainNormalResolution);
    gl.uniform1f(uniforms.time, view.time);

    // set the shapes to draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffer.vertexCount);
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

function getCameraPosition() {
    const smallRotation = mat4.create();
    mat4.rotate(smallRotation, smallRotation, view.theta, [1.0, 0.0, 0.0]);

    const largeRotation = mat4.create();
    mat4.rotate(largeRotation, largeRotation, view.phi, [0.0, 1.0, 0.0]);

    const cameraPosition = vec4.create();

    vec4.add(cameraPosition, cameraPosition, [0.0, 0.0, -1.25, 0.0]);
    vec4.transformMat4(cameraPosition, cameraPosition, smallRotation);
    vec4.add(cameraPosition, cameraPosition, [0.0, 0.0, -1.0, 0.0]);
    vec4.transformMat4(cameraPosition, cameraPosition, largeRotation);

    return cameraPosition;
}

// create a view matrix to define only the camera's angle for the stars
function getViewDirectionMatrix() {
    const viewDirectionMatrix = mat4.create();
    mat4.rotate(viewDirectionMatrix, viewDirectionMatrix, view.phi, [0.0, 1.0, 0.0]);
    mat4.rotate(viewDirectionMatrix, viewDirectionMatrix, view.theta, [1.0, 0.0, 0.0]);

    return viewDirectionMatrix;
}
