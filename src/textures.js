import { gl, texture, torus } from "./properties.js";

// load the image and store it in a single-channel floating-point texture
export function loadTerrainTexture() {
    texture.reference = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture.reference);

    gl.texImage2D(
        gl.TEXTURE_2D,
        texture.level,
        texture.internalFormat,
        1, // width
        1, // height
        0, // border
        gl.RED,
        gl.FLOAT,
        new Float32Array([0])
    );

    // set the texture to load once the image is loaded
    texture.data = new Image();
    texture.data.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture.reference);

        gl.texImage2D(
            gl.TEXTURE_2D,
            texture.level,
            texture.internalFormat,
            texture.width,
            texture.height,
            0, // border
            texture.format,
            texture.type,
            texture.data
        );
    };

    texture.data.src = texture.imageUrl;

    // set the min filter to linear to avoid using a mipmap
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}
