import { torys, view, light } from "./properties.js";

// draw the starry background
export function drawStars(gl, programInfo, buffers) {
    gl.useProgram(programInfo.stars.program);
    setPositionAttribute(gl, buffers.stars, programInfo.stars);

    // disable depth testing
    gl.disable(gl.DEPTH_TEST);

    // set the shader uniforms
    gl.uniformMatrix4fv(programInfo.stars.uniformLocations.viewDirectionMatrix, false, getViewDirectionMatrix(gl));
    gl.uniformMatrix4fv(programInfo.stars.uniformLocations.lightDirectionMatrix, false, getLightDirectionMatrix(gl));

    // set the shapes to draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.stars.vertexCount);
}

// draw the planet
export function drawTorus(gl, programInfo, buffers) {
    gl.useProgram(programInfo.torus.program);
    setPositionAttribute(gl, buffers.torus, programInfo.torus);

    // enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // clear the scene
    gl.clearDepth(1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // set the shader uniforms
    gl.uniformMatrix4fv(programInfo.torus.uniformLocations.projectionMatrix, false, getProjectionMatrix(gl));
    gl.uniformMatrix4fv(programInfo.torus.uniformLocations.viewMatrix, false, getViewMatrix(gl));
    gl.uniform4fv(programInfo.torus.uniformLocations.lightDirection, new Float32Array(light.direction));
    gl.uniform1f(programInfo.torus.uniformLocations.lightAmbience, light.ambience);
    gl.uniform1f(programInfo.torus.uniformLocations.zoomLevel, view.zoom);

    // set the shapes to draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.torus.vertexCount);
}

// define the mapping from the buffers to the attributes
function setPositionAttribute(gl, buffers, programInfo) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.data);

    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        buffers.numComponents,
        buffers.type,
        buffers.normalize,
        buffers.stride,
        buffers.offset
    );

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

// create a projection matrix to render the torus with a 3D perspective
function getProjectionMatrix(gl) {
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let fieldOfView, zNear, zFar;

    // to avoid bad clipping, don't move the camera too close
    // instead just narrow the field of view at high zoom levels
    if (view.zoomPrecise >= 0) {
        fieldOfView = 0.25 * Math.PI;
        zNear = view.zoom * 0.5;
        zFar = (view.zoom + torys.largeRadius + torys.smallRadius) * 2;
    }
    else {
        fieldOfView = 0.25 * Math.PI * view.zoom;
        zNear = 0.5;
        zFar = (torys.largeRadius + torys.smallRadius) * 2;
    }

    // create the projection matrix
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    return projectionMatrix;
}

// create a view matrix to define the camera's position and angle
function getViewMatrix(gl) {
    const viewMatrix = mat4.create();
    mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -torys.smallRadius - Math.max(view.zoom, 1.0)]);
    mat4.rotate(viewMatrix, viewMatrix, view.theta, [1.0, 0.0, 0.0]);
    mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -torys.largeRadius]);
    mat4.rotate(viewMatrix, viewMatrix, view.phi, [0.0, 1.0, 0.0]);

    return viewMatrix;
}

// create a view matrix to define only the camera's angle
function getViewDirectionMatrix(gl) {
    const viewDirectionMatrix = mat4.create();
    mat4.rotate(viewDirectionMatrix, viewDirectionMatrix, view.theta, [1.0, 0.0, 0.0]);
    mat4.rotate(viewDirectionMatrix, viewDirectionMatrix, view.phi, [0.0, 1.0, 0.0]);

    return viewDirectionMatrix;
}

// create a matrix to define the direction of light
function getLightDirectionMatrix(gl) {
    const lightDirectionMatrix = mat4.create();

    return lightDirectionMatrix;
}
