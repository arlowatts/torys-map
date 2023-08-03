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

    let min = 256;
    let max = 0;

    let scale = [100, 50];

    // fill the canvas with random noise
    for (let i = 0; i < canvas.width * canvas.height; i++) {
        let x = (i % canvas.width) / canvas.width;
        let y = Math.floor(i / canvas.width) / canvas.height;

        x *= scale[0];
        y *= scale[1];

        let noise;
        let shiftMagnitude;

        noise = getNoise([x, y], scale, 0);

        noise = noise * noise * (-2 * noise + 3);

        noise = 2 * Math.PI * noise;
        shiftMagnitude = 0.05 * getNoise([x, y], scale, 1);
        x += shiftMagnitude * (1 + Math.sin(noise)) * scale[0];
        y += shiftMagnitude * (1 + Math.cos(noise)) * scale[1];

        noise = getNoise([x, y], scale, 2);

        noise = noise * 0.6 + getNoise([x*2, y*2], [scale[0]*2, scale[1]*2], 0) * 0.25
        + getNoise([x*4, y*4], [scale[0]*4, scale[1]*4], 1) * 0.15;

        // noise = noise > 0.5 ? 1 : 0;
        noise = noise*noise;

        pixelArray[i*4+3] = 255 * noise;

        if (pixelArray[i*4+3] > max) max = pixelArray[i*4+3];
        if (pixelArray[i*4+3] < min) min = pixelArray[i*4+3];
    }

    console.log("Min: " + min);
    console.log("Max: " + max);

    ctx.putImageData(imageData, 0, 0);
}
