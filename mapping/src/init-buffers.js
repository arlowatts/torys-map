// initialize the data buffers for the scene
export function initBuffers(gl) {
    const positionBuffer = initPositionBuffer(gl);

    return {
        position: positionBuffer,
    };
}

// creates a vertex buffer for a square centered at (0, 0)
function initPositionBuffer(gl) {
    // create the buffer
    const positionBuffer = gl.createBuffer();

    // select the new buffer as the buffer to apply operations on
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // define the data as an array
    const positions = [-15.0, 0.0, -12.5, -5.0, -12.5, 5.0, 12.5, -5.0, 12.5, 5.0, 15.0, 0.0];

    // convert the array to a Float32Array, then populate the buffer with the position data
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return positionBuffer;
}
