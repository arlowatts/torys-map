// initialize the data buffers for the scene
export function initBuffers(gl) {
    const positionBuffer = initPositionBuffer(gl);

    return {
        position: positionBuffer,
    };
}

// creates a vertex buffer for a torus
function initPositionBuffer(gl) {
    // create the buffer
    const positionBuffer = gl.createBuffer();

    // select the position buffer as the buffer to apply operations on
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // define the data as an array
    const positions = [];

    let degToRad = Math.PI / 180;
    let largeRadius = 8;
    let smallRadius = 2;

    let phiStep = 5;
    let thetaStep = 10;

    let x, y, z, xzOffset;

    for (let phi = 0; phi < 360; phi += phiStep) {
        for (let theta = 0; theta <= 360; theta += thetaStep) {
            y = smallRadius * Math.sin(theta * degToRad);
            xzOffset = largeRadius + smallRadius * Math.cos(theta * degToRad);

            z = Math.cos(phi * degToRad) * xzOffset;
            x = Math.sin(phi * degToRad) * xzOffset;

            positions.push(x, y, z);

            z = Math.cos((phi + phiStep) * degToRad) * xzOffset;
            x = Math.sin((phi + phiStep) * degToRad) * xzOffset;

            positions.push(x, y, z);
        }
    }

    // convert the array to a Float32Array, then populate the buffer with the position data
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    return {
        data: positionBuffer,
        vertexCount: positions.length / 3,
        numComponents: 3,
        type: gl.FLOAT,
        normalize: false,
        stride: 0,
        offset: 0
    };
}
