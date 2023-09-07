import { drawStars, drawTorus } from "./draw-scene.js";
import { initTorusBuffer, initBackgroundBuffer } from "./init-buffers.js";
import { gl, programInfo, torus, view, light } from "./properties.js";
import * as properties from "./properties.js";
import * as torusFragment from "./gl-shader-torus-fragment.js";
import * as torusVertex from "./gl-shader-torus-vertex.js";
import * as starsFragment from "./gl-shader-stars-fragment.js";
import * as starsVertex from "./gl-shader-stars-vertex.js";

main();

function main() {
    // check that the webgl context opened correctly
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // initialize the shader programs
    const torusProgram = initShaderProgram(torusVertex.source, torusFragment.source);
    const starsProgram = initShaderProgram(starsVertex.source, starsFragment.source);

    // collect information about the shader programs
    // the torus (planet) program
    programInfo.torus.program = torusProgram;

    programInfo.torus.attribLocations = {
        vertexPosition: gl.getAttribLocation(torusProgram, "aVertexPosition")
    };

    programInfo.torus.uniformLocations = {
        projectionMatrix: gl.getUniformLocation(torusProgram, "uProjectionMatrix"),
        viewMatrix: gl.getUniformLocation(torusProgram, "uViewMatrix"),
        lightDirection: gl.getUniformLocation(torusProgram, "uLightDirection"),
        lightAmbience: gl.getUniformLocation(torusProgram, "uLightAmbience"),
        zoomLevel: gl.getUniformLocation(torusProgram, "uZoomLevel")
    };

    // the stars (background) program
    programInfo.stars.program = starsProgram;
    
    programInfo.stars.attribLocations= {
        vertexPosition: gl.getAttribLocation(starsProgram, "aVertexPosition")
    };

    programInfo.stars.uniformLocations = {
        viewDirectionMatrix: gl.getUniformLocation(starsProgram, "uViewDirectionMatrix"),
        lightDirectionMatrix: gl.getUniformLocation(starsProgram, "uLightDirectionMatrix"),
    };

    // initialize the data buffers for the scene
    initTorusBuffer();
    initBackgroundBuffer();

    // ensure that the zoom and pan values are correct
    onMouseMove({buttons: 1, movementX: 0.0, movementY: 0.0});
    onWheel({wheelDelta: 0.0});

    // create the event listeners for pan and zoom
    addEventListener("mousemove", onMouseMove);
    addEventListener("wheel", onWheel);

    // draw the scene and update it each frame
    requestAnimationFrame(render);
}

function render(now) {
    light.direction = [Math.cos(now * 0.0005), Math.sin(now * 0.0005), 0.0, 0.0];

    drawStars();
    drawTorus();

    requestAnimationFrame(render);
}

// adjust the view location when the mouse is dragged
function onMouseMove(event) {
    if (event.buttons == 1) {
        // track the precise angle values as BigInts to avoid loss of precision
        view.phiPrecise += BigInt(Math.round(event.movementX * torus.smallRadius * view.panSensitivity));
        view.thetaPrecise += BigInt(Math.round(event.movementY * torus.largeRadius * view.panSensitivity));

        // wrap the values when they have completed a full rotation
        view.phiPrecise %= properties.PAN_LIMIT;
        view.thetaPrecise %= properties.PAN_LIMIT;

        // compute the actual angles as Numbers
        view.phi = Number(view.phiPrecise) * properties.BASE_PAN_SENSITIVITY;
        view.theta = Number(view.thetaPrecise) * properties.BASE_PAN_SENSITIVITY;
    }
}

// zoom when the scroll wheel is used
function onWheel(event) {
    // track the precise zoom value to avoid loss of precision
    view.zoomPrecise -= event.wheelDelta * properties.SCROLL_SENSITIVITY;
    view.zoomPrecise = Math.min(Math.max(view.zoomPrecise, properties.MIN_ZOOM), properties.MAX_ZOOM);

    // recompute the exponential zoom value and the updated pan sensitivity
    view.zoom = 2 ** view.zoomPrecise;
    view.panSensitivity = Math.min(2 ** (view.zoomPrecise - properties.MIN_ZOOM), properties.MAX_PAN_SENSITIVITY);
}

// initialize the shader program with a vertex shader and a fragment shader
// vsSource defines the source code for the vertex shader
// fsSource defines the source code for the fragment shader
// returns a shader program object
function initShaderProgram(vsSource, fsSource) {
    // compile the shaders
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    // create the shader program and link the shaders
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // check that the shader program compiled correctly
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram,)}`);
        return null;
    }

    return shaderProgram;
}

// type defines the type of shader
// source defines the source code of the shader
// returns a compiled shader object
function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // check that the shader compiled properly
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
