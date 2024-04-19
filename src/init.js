import { gl } from "./properties.js";

// initialize the shader program with a vertex shader and a fragment shader
// vsSource: the source code for the vertex shader
// fsSource: the source code for the fragment shader
// return: shader program object
export function initShaderProgram(vsSource, fsSource) {
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

// initialize attribute locations for the shader program
export function initAttribLocations(programInfo) {
    programInfo.attribLocations = {
        vertexPosition: gl.getAttribLocation(programInfo.program, "aVertexPosition")
    };
}

// initialize uniform locations for the shader program
export function initUniformLocations(programInfo) {
    programInfo.uniformLocations = {
        cameraPosition: gl.getUniformLocation(programInfo.program, "uCameraPosition"),
        viewDirectionMatrix: gl.getUniformLocation(programInfo.program, "uViewDirectionMatrix"),
        lightDirectionMatrix: gl.getUniformLocation(programInfo.program, "uLightDirectionMatrix"),
        terrainResolution: gl.getUniformLocation(programInfo.program, "uTerrainResolution"),
        terrainNormalResolution: gl.getUniformLocation(programInfo.program, "uTerrainNormalResolution"),
        time: gl.getUniformLocation(programInfo.program, "uTime")
    };
}

// create a vertex buffer for the mesh covering the screen
export function initBuffer(buffer) {
    // create the buffer
    const positionBuffer = gl.createBuffer();

    // select the position buffer for subsequent operations
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // define the data as an array
    const positions = [
        -1.0, 1.0,
        -1.0, -1.0,
        1.0, 1.0,
        1.0, -1.0
    ];

    // convert the array to a Float32Array, then populate the buffer with the
    // position data
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    buffer.data = positionBuffer;
    buffer.vertexCount = positions.length / 2;
    buffer.numComponents = 2;
    buffer.type = gl.FLOAT;
}

// type: the type of shader
// source: the source code of the shader
// return: compiled shader object
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
