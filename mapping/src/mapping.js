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

    // fill the canvas with random noise
    for (let i = 0; i < canvas.width * canvas.height; i++) {
        let x = (i % canvas.width) / canvas.width;
        let y = Math.floor(i / canvas.width) / canvas.height;

        pixelArray[i*4+3] = 255 * getNoise(
            [
                x * 7.5,
                y * 5.0,
                ((x - 0.5) ** 2 + (y - 0.5) ** 2) * 30
            ],
            [7.5, 5.0, 1]
        );

        if (pixelArray[i*4+3] > max) max = pixelArray[i*4+3];
        if (pixelArray[i*4+3] < min) min = pixelArray[i*4+3];
    }

    console.log("Min: " + min);
    console.log("Max: " + max);

    ctx.putImageData(imageData, 0, 0);
}
