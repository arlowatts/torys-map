import { drawScene } from "./draw-scene.js";
import { initBuffers } from "./init-buffers.js";
import { fsSource } from "./gl-shader-fragment.js";
import { vsSource } from "./gl-shader-vertex.js";

main();

function main() {
    // load the canvas
    const canvas = document.getElementById("mapcanvas")
    const gl = canvas.getContext("webgl2");

    // check that the webgl context opened correctly
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // enable depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // set the background color and clear depth
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clearDepth(1.0);

    // initialize the shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // collect information about the shaderProgram, such as attribute and uniform locations
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition")
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            viewMatrix: gl.getUniformLocation(shaderProgram, "uViewMatrix")
        }
    };

    // initialize the data buffers for the scene
    const buffers = initBuffers(gl);

    let then = 0.0;
    let deltaTime = 0.0;
    let viewRotation = {
        phi: 0.0,
        theta: 0.0,
        zoom: 30.0
    };

    // draw the scene and update it each frame
    requestAnimationFrame(render);

    function render(now) {
        deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, viewRotation);
        viewRotation.phi += deltaTime * 0.0005;
        viewRotation.theta += deltaTime * 0.0005;

        requestAnimationFrame(render);
    }
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
