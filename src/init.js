import { gl, buffer, programInfo } from "./properties.js";
import { vertexSrc, fragmentSrc } from "./shader/main.js";
import { loadTerrainTexture, loadNormalTexture } from "./textures.js";

// initialize the shader program
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
        vertexPosition: gl.getAttribLocation(programInfo.program, "aVertexPosition"),
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
        terrainHeight: gl.getUniformLocation(programInfo.program, "uTerrainHeight"),
        uSamplerTerrain: gl.getUniformLocation(programInfo.program, "uSamplerTerrain"),
        uSamplerNormal: gl.getUniformLocation(programInfo.program, "uSamplerNormal"),
    };

    // load the vertex buffer
    buffer.reference = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.reference);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer.data), gl.STATIC_DRAW);

    // load the textures
    loadTerrainTexture();
    loadNormalTexture();
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
