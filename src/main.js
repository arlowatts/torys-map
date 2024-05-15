import { torus, view } from "./properties.js";
import { initShaders } from "./init.js";
import { initEventListeners, moveFirstPersonCamera } from "./input.js";
import { drawScene } from "./draw-scene.js";

// initialize the shader program
initShaders();

// initialize event listeners to process user input
initEventListeners();

// draw the scene
requestAnimationFrame(render);

function render(now) {
    // update the position of the camera if first-person mode is toggled
    if (view.isFirstPerson) moveFirstPersonCamera(now - view.pageTime);

    // update fps indicator
    document.getElementById("fps").innerText = (1000 / (now - view.pageTime)).toFixed(1) + " FPS";

    // update the current time
    view.pageTime = now;
    torus.time = Date.now() / 1000;

    // render the scene and request the next frame
    drawScene();
    requestAnimationFrame(render);
}
