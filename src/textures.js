import { gl, texture } from "./properties.js";

// generate the terrain and store it in a single-channel floating-point texture
export function loadTerrainTexture() {
    // initialize the texture
    texture.data = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture.data);

    const data = [];

    // generate the terrain height
    for (let i = 0; i < 64; i++) {
        for (let j = 0; j < 16; j++) {
            data.push(Math.random());
        }
    }

    // load the texture data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, 64, 16, 0, gl.RED, gl.FLOAT, new Float32Array(data));

    // set the min filter to linear to avoid using a mipmap
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}
