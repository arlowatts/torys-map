import { gl, texture } from "./properties.js";

export function loadTerrainTexture() {
    texture.data = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture.data);

    const data = [];

    for (let i = 0; i < 128; i++) {
        for (let j = 0; j < 128; j++) {
            data.push(i);
            data.push(j);
            data.push(0);
            data.push(255);
        }
    }

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 128, 128, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(data));
    gl.generateMipmap(gl.TEXTURE_2D);
}
