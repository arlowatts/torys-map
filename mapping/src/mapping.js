import { drawScene } from "./draw-scene.js";
import { initBuffers } from "./init-buffers.js";
import { fsSource } from "./gl-shader-fragment.js";
import { vsSource } from "./gl-shader-vertex.js";
import { torys, view, light } from "./properties.js";
import * as properties from "./properties.js";

// load the canvas
const canvas = document.getElementById("mapcanvas")
const gl = canvas.getContext("webgl2");

// declare objects for the shader program
let programInfo, buffers;

main();

function main() {
    // check that the webgl context opened correctly
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // set the background color and clear depth
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);

    // initialize the shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // collect information about the shaderProgram, such as attribute and uniform locations
    programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition")
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            viewMatrix: gl.getUniformLocation(shaderProgram, "uViewMatrix"),
            lightDirection: gl.getUniformLocation(shaderProgram, "uLightDirection"),
            lightAmbience: gl.getUniformLocation(shaderProgram, "uLightAmbience"),
            zoomLevel: gl.getUniformLocation(shaderProgram, "uZoomLevel")
        }
    };

    // initialize the data buffers for the scene
    buffers = initBuffers(gl);

    // draw the scene and update it each frame
    requestAnimationFrame(render);
    addEventListener("mousemove", onMouseMove);
    addEventListener("wheel", onWheel);
    onMouseMove({buttons: 1, movementX: 0.0, movementY: 0.0});
    onWheel({wheelDelta: 0.0});
}

function render(now) {
    light.direction = [Math.sin(now * 0.0005), Math.cos(now * 0.0005), 0.0, 0.0];

    drawScene(gl, programInfo, buffers);

    requestAnimationFrame(render);
}

// adjust the view location when the mouse is dragged
function onMouseMove(event) {
    if (event.buttons == 1) {
        view.phiPrecise += BigInt(Math.round(event.movementX * torys.smallRadius * view.panSensitivity));
        view.thetaPrecise += BigInt(Math.round(event.movementY * torys.largeRadius * view.panSensitivity));

        view.phiPrecise %= properties.PAN_LIMIT;
        view.thetaPrecise %= properties.PAN_LIMIT;

        view.phi = Number(view.phiPrecise) * properties.BASE_PAN_SENSITIVITY;
        view.theta = Number(view.thetaPrecise) * properties.BASE_PAN_SENSITIVITY;
    }
}

// zoom when the scroll wheel is used
function onWheel(event) {
    view.zoomPrecise -= event.wheelDelta * properties.SCROLL_SENSITIVITY;
    view.zoomPrecise = Math.min(Math.max(view.zoomPrecise, properties.MIN_ZOOM), properties.MAX_ZOOM);

    view.zoom = 2 ** view.zoomPrecise;
    view.panSensitivity = Math.min(2 ** (view.zoomPrecise - properties.MIN_ZOOM), properties.MAX_PAN_SENSITIVITY);
}

// initialize the shader program with a vertex shader and a fragment shader
// vsSource defines the source code for the vertex shader
// fsSource defines the source code for the fragment shader
// returns a shader program object
function initShaderProgram(gl, vsSource, fsSource) {
    // compile the shaders
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

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
function loadShader(gl, type, source) {
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
