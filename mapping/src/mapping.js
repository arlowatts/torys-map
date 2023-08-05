import { getNoise } from "./noise.js";

main();

function main() {
    // load the canvas
    const canvas = document.getElementById("mapcanvas")
    const ctx = canvas.getContext("2d");

    // get the reference to the canvas display buffer
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // store the pixel buffer and a new depth buffer for rendering
    const pixelArray = imageData.data;
    const depthArray = new Array(canvas.width * canvas.height);

    let scale = [25, 10];

    // fill the canvas with random noise
    for (let i = 0; i < canvas.width * canvas.height; i++) {
        let x = (i % canvas.width) / canvas.width;
        let y = Math.floor(i / canvas.width) / canvas.height;

        x *= scale[0];
        y *= scale[1];

        let noise;
        // let shiftMagnitude;

        // noise = getNoise([x, y], scale, 0);

        // noise = noise * noise * (-2 * noise + 3);
        // noise = noise * noise * (-2 * noise + 3);

        // noise = 2 * Math.PI * noise;
        // shiftMagnitude = 0.05 * getNoise([x, y], scale, 1);
        let noiseA = getNoise([x/2, y/2], [scale[0]/2, scale[1]/2], 0);
        let noiseB = getNoise([x/2, y/2], [scale[0]/2, scale[1]/2], 1);
        x += noiseA * 2;
        y += noiseB * 2;

        noise = 0;

        for (let j = 0; j < 5; j++) {
            noise += getNoise([x, y], [scale[0]*2**j, scale[1]*2**j], j + 2) * 0.5**(j+1);
            x *= 2;
            y *= 2;
        }
        // noise*=2;

        // noise = noise*noise;
        noise = noise*noise*(-2*noise + 3);
        noise = noise*noise*(-2*noise + 3);
        noise = noise > 0.6 ? noise : 0;

        pixelArray[i*4+3] = 255;
        pixelArray[i*4+2] = 128 * (1 - noise);
        pixelArray[i*4+1] = 255 * noise;
    }

    ctx.putImageData(imageData, 0, 0);
}
