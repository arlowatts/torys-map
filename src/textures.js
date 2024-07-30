import { gl, texture, torus } from "./properties.js";

// generate the terrain and store it in a single-channel floating-point texture
export function loadTerrainTexture() {
    texture.data = new Array(texture.width * texture.height);

    // generate the terrain height
    for (let i = 0; i < texture.width; i++) {
        for (let j = 0; j < texture.height; j++) {
            let y = Math.cos(j * Math.TAU / texture.height) * torus.radius.small;
            let xz = Math.sin(j * Math.TAU / texture.height) * torus.radius.small;

            let x = Math.cos(i * Math.TAU / texture.width) * (torus.radius.large + xz);
            let z = Math.sin(i * Math.TAU / texture.width) * (torus.radius.large + xz);

            texture.data[i + j * texture.width] = Math.cos((x + y) / 200) / 5 + Math.sin(x / 300 + z / 500) / 3;
        }
    }

    // load the texture
    texture.reference = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture.reference);

    gl.texImage2D(
        gl.TEXTURE_2D,
        texture.level,
        texture.internalFormat,
        texture.width,
        texture.height,
        0, // border must be 0
        texture.format,
        texture.type,
        new Float32Array(texture.data)
    );

    // set the min filter to linear to avoid using a mipmap
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}
