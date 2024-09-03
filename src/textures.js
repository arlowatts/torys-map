import { gl, textures, torus } from "./properties.js";

// load the terrain image into a single-channel floating-point texture
export function loadTerrainTexture() {
    textures.terrain.reference = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textures.terrain.reference);

    // create an empty placeholder texture until the image loads
    gl.texImage2D(
        gl.TEXTURE_2D,
        0, // level
        textures.terrain.internalFormat,
        1, // width
        1, // height
        0, // border
        gl.RED,
        gl.FLOAT,
        new Float32Array([0])
    );

    // load the image into the texture once it's been downloaded from the server
    const request = new XMLHttpRequest();

    request.onload = () => {
        textures.terrain.data = new Float32Array(request.response);

        gl.bindTexture(gl.TEXTURE_2D, textures.terrain.reference);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0, // level
            textures.terrain.internalFormat,
            textures.terrain.width,
            textures.terrain.height,
            0, // border
            textures.terrain.format,
            textures.terrain.type,
            textures.terrain.data
        );
    };

    request.open("GET", textures.terrain.imageUrl);
    request.responseType = "arraybuffer";
    request.send();

    // set the min filter to linear to avoid using a mipmap
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}

// load the normal map into a three-channel floating-point texture
export function loadNormalTexture() {
    textures.normal.reference = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textures.normal.reference);

    textures.normal.data = new Array(3 * textures.normal.width * textures.normal.height);

    for (let y = 0; y < textures.normal.height; y++) {
        for (let x = 0; x < textures.normal.width; x++) {
            let i = 3 * (x + y * textures.normal.width);

            let x1 = x * Math.TAU / textures.normal.width;
            let y1 = y * Math.TAU / textures.normal.height;

            textures.normal.data[i] = Math.cos(x1) * Math.sin(y1);
            textures.normal.data[i + 1] = Math.cos(y1);
            textures.normal.data[i + 2] = Math.sin(x1) * Math.sin(y1);
        }
    }

    gl.texImage2D(
        gl.TEXTURE_2D,
        0, // level
        textures.normal.internalFormat,
        textures.normal.width,
        textures.normal.height,
        0, // border
        textures.normal.format,
        textures.normal.type,
        new Float32Array(textures.normal.data)
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}
