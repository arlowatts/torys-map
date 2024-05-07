import { gl, buffer, programInfo } from "./properties.js";
import { vertexSrc, fragmentSrc } from "./shader.js";

// initialize the shader program with a vertex shader and a fragment shader
export function initShaders() {
    // compile the shaders
    const vertexShader = loadShader(gl.VERTEX_SHADER, vertexSrc);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fragmentSrc);

    // create the shader program and link the shaders
    programInfo.program = gl.createProgram();
    gl.attachShader(programInfo.program, vertexShader);
    gl.attachShader(programInfo.program, fragmentShader);
    gl.linkProgram(programInfo.program);

    // check that the shader program compiled correctly
    if (!gl.getProgramParameter(programInfo.program, gl.LINK_STATUS)) {
        alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(programInfo.program)}`);
        return;
    }

    // collect attribute locations
    programInfo.attribLocations = {
        vertexPosition: gl.getAttribLocation(programInfo.program, "aVertexPosition")
    };

    // collect uniform locations
    programInfo.uniformLocations = {
        cameraPosition: gl.getUniformLocation(programInfo.program, "uCameraPosition"),
        viewDirectionMatrix: gl.getUniformLocation(programInfo.program, "uViewDirectionMatrix"),
        lightDirection: gl.getUniformLocation(programInfo.program, "uLightDirection"),
        lightDirectionMatrix: gl.getUniformLocation(programInfo.program, "uLightDirectionMatrix"),
        largeRadius: gl.getUniformLocation(programInfo.program, "uLargeRadius"),
        smallRadius: gl.getUniformLocation(programInfo.program, "uSmallRadius"),
        terrainDetail: gl.getUniformLocation(programInfo.program, "uTerrainDetail"),
        terrainSize: gl.getUniformLocation(programInfo.program, "uTerrainSize"),
        terrainHeight: gl.getUniformLocation(programInfo.program, "uTerrainHeight")
    };

    // initialize the data buffer for the scene
    buffer.data = gl.createBuffer();

    // select the position buffer for subsequent operations
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.data);

    // convert the array to a Float32Array, then populate the buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]), gl.STATIC_DRAW);
}

// compiles and loads a shader
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
