import { gl, programInfo, buffers, torus, view, light } from "./properties.js";
import * as properties from "./properties.js";

// draw the starry background
export function drawStars() {
    gl.useProgram(programInfo.stars.program);
    setPositionAttribute(buffers.stars, programInfo.stars);

    // disable depth testing
    gl.disable(gl.DEPTH_TEST);

    let uniforms = programInfo.stars.uniformLocations;

    // set the shader uniforms
    gl.uniform4fv(uniforms.cameraPosition, getCameraPosition());
    gl.uniform4fv(uniforms.lightDirection, light.direction);
    gl.uniformMatrix4fv(uniforms.viewDirectionMatrix, false, getViewDirectionMatrix());
    gl.uniformMatrix4fv(uniforms.lightDirectionMatrix, false, light.directionMatrix);
    gl.uniform1f(uniforms.terrainResolution, view.zoom * torus.terrainResolution);
    gl.uniform1f(uniforms.terrainHeightScale, getTerrainHeightScale());
    gl.uniform1f(uniforms.terrainNormalResolution, view.zoom * torus.terrainNormalResolution);
    gl.uniform1f(uniforms.time, view.time);

    // set the shapes to draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.stars.vertexCount);
}

// draw the planet
export function drawTorus() {
    gl.useProgram(programInfo.torus.program);
    setPositionAttribute(buffers.torus, programInfo.torus);

    // enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // enable face culling
    gl.enable(gl.CULL_FACE);

    // clear the scene
    gl.clearDepth(1.0);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    let uniforms = programInfo.torus.uniformLocations;

    // set the shader uniforms
    gl.uniformMatrix4fv(uniforms.projectionMatrix, false, getProjectionMatrix());
    gl.uniformMatrix4fv(uniforms.viewMatrix, false, getViewMatrix());

    gl.uniform4fv(uniforms.lightDirection, light.direction);

    gl.uniform1f(uniforms.lightAmbience, light.ambience);
    gl.uniform1f(uniforms.zoomLevel, view.zoom);
    gl.uniform1f(uniforms.terrainResolution, view.zoom * torus.terrainResolution);
    gl.uniform1f(uniforms.terrainHeightScale, getTerrainHeightScale());
    gl.uniform1f(uniforms.terrainNormalResolution, view.zoom * torus.terrainNormalResolution);
    gl.uniform1f(uniforms.time, view.time);
    gl.uniform1i(uniforms.showClouds, view.zoomPrecise > 1 ? 1 : 0);

    // set the shapes to draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.torus.vertexCount);
}

// define the mapping from the buffers to the attributes
function setPositionAttribute(buffer, program) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.data);

    gl.vertexAttribPointer(
        program.attribLocations.vertexPosition,
        buffer.numComponents,
        buffer.type,
        buffer.normalize,
        buffer.stride,
        buffer.offset
    );

    gl.enableVertexAttribArray(program.attribLocations.vertexPosition);
}

// create a projection matrix to render the torus with a 3D perspective
function getProjectionMatrix() {
    let fov, zNear, zFar;

    // to avoid bad clipping, don't move the camera too close
    // instead just narrow the field of view at high zoom levels
    if (view.zoom > properties.MIN_CAMERA_DISTANCE) {
        fov = view.fov;

        // adjust the near clipping plane to clip the near side of the torus
        // when viewing the far side at a distance
        if (view.zoom > 2 * (torus.largeRadius + torus.smallRadius)) {
            zNear = view.zoom - 2 * torus.largeRadius;
        }
        else if (view.zoom > torus.largeRadius + torus.smallRadius) {
            zNear = view.zoom - torus.largeRadius;
        }
        else {
            zNear = view.zoom * 0.5;
        }

        zFar = (view.zoom + torus.largeRadius + torus.smallRadius) * 2;
    }
    else {
        fov = view.fov * view.zoom / properties.MIN_CAMERA_DISTANCE;
        zNear = properties.MIN_CAMERA_DISTANCE * 0.5;
        zFar = (torus.largeRadius + torus.smallRadius) * 2;
    }

    // create the projection matrix
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fov, view.aspect, zNear, zFar);

    return projectionMatrix;
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

// create a view matrix to define the camera's position and angle
function getViewMatrix() {
    const viewMatrix = mat4.create();
    mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -torus.smallRadius - Math.max(view.zoom, properties.MIN_CAMERA_DISTANCE)]);
    mat4.rotate(viewMatrix, viewMatrix, view.theta, [1.0, 0.0, 0.0]);
    mat4.translate(viewMatrix, viewMatrix, [0.0, 0.0, -torus.largeRadius]);
    mat4.rotate(viewMatrix, viewMatrix, view.phi, [0.0, 1.0, 0.0]);

    return viewMatrix;
}

// create a view matrix to define only the camera's angle for the stars
function getViewDirectionMatrix() {
    const viewDirectionMatrix = mat4.create();
    mat4.rotate(viewDirectionMatrix, viewDirectionMatrix, -view.theta, [1.0, 0.0, 0.0]);
    mat4.rotate(viewDirectionMatrix, viewDirectionMatrix, -view.phi, [0.0, 1.0, 0.0]);

    return viewDirectionMatrix;
}

function getTerrainHeightScale() {
    let scale = 0.0;
    let height = 0.5;

    do {
        scale += height;
        height *= 0.5;
    }
    while (height >= view.zoom * torus.terrainResolution);

    return 1.0 / scale;
}
