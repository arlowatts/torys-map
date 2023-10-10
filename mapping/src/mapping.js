import { drawStars, drawTorus } from "./draw-scene.js";
import { initTorusBuffer, initBackgroundBuffer } from "./init-buffers.js";
import { gl, programInfo, torus, view, light } from "./properties.js";
import * as properties from "./properties.js";
import * as torusFragment from "./shaders/torus-fragment.js";
import * as torusVertex from "./shaders/torus-vertex.js";
import * as starsFragment from "./shaders/stars-fragment.js";
import * as starsVertex from "./shaders/stars-vertex.js";

// arrays of touch event data for touchscreen support
const touches = [];

main();

function main() {
    // initialize the shader programs
    const torusProgram = initShaderProgram(torusVertex.source, torusFragment.source);
    const starsProgram = initShaderProgram(starsVertex.source, starsFragment.source);

    // collect information about the shader programs
    // the torus (planet) program
    programInfo.torus.program = torusProgram;

    programInfo.torus.attribLocations = {
        vertexPosition: gl.getAttribLocation(torusProgram, "aVertexPosition")
    };

    programInfo.torus.uniformLocations = {
        // matrices
        projectionMatrix: gl.getUniformLocation(torusProgram, "uProjectionMatrix"),
        viewMatrix: gl.getUniformLocation(torusProgram, "uViewMatrix"),
        // vectors
        lightDirection: gl.getUniformLocation(torusProgram, "uLightDirection"),
        lightAmbience: gl.getUniformLocation(torusProgram, "uLightAmbience"),
        // scalars
        zoomLevel: gl.getUniformLocation(torusProgram, "uZoomLevel"),
        terrainResolution: gl.getUniformLocation(torusProgram, "uTerrainResolution"),
        terrainHeightScale: gl.getUniformLocation(torusProgram, "uTerrainHeightScale"),
        terrainNormalResolution: gl.getUniformLocation(torusProgram, "uTerrainNormalResolution")
    };

    // the stars (background) program
    programInfo.stars.program = starsProgram;

    programInfo.stars.attribLocations= {
        vertexPosition: gl.getAttribLocation(starsProgram, "aVertexPosition")
    };

    programInfo.stars.uniformLocations = {
        viewDirectionMatrix: gl.getUniformLocation(starsProgram, "uViewDirectionMatrix"),
        lightDirectionMatrix: gl.getUniformLocation(starsProgram, "uLightDirectionMatrix"),
    };

    // initialize the data buffers for the scene
    initTorusBuffer();
    initBackgroundBuffer();

    // ensure that the zoom and pan values are correct
    onMouseMove({buttons: 1, movementX: 0.0, movementY: 0.0});
    onWheel({wheelDelta: 0.0});

    // create the event listeners for pan and zoom
    addEventListener("mousemove", onMouseMove);
    addEventListener("wheel", onWheel);

    // create event listeners for touchscreen support
    addEventListener("touchstart", onTouchStart);
    addEventListener("touchend", onTouchEnd);
    addEventListener("touchcancel", onTouchEnd);
    addEventListener("touchmove", onTouchMove);

    // create the event listener to reload on resize
    addEventListener("resize", onResize);

    // create listeners to track whether the user is interacting with input
    view.daySlider.addEventListener("mousedown", blockPanning);
    view.daySlider.addEventListener("touchstart", blockPanning);
    view.daySlider.addEventListener("mouseup", unblockPanning);
    view.daySlider.addEventListener("touchend", unblockPanning);
    view.daySlider.addEventListener("touchcancel", unblockPanning);

    view.yearSlider.addEventListener("mousedown", blockPanning);
    view.yearSlider.addEventListener("touchstart", blockPanning);
    view.yearSlider.addEventListener("mouseup", unblockPanning);
    view.yearSlider.addEventListener("touchend", unblockPanning);
    view.yearSlider.addEventListener("touchcancel", unblockPanning);

    // create an interval timer to update the url query parameters
    setInterval(updateQueryParameters, properties.QUERY_PARAM_REFRESH_RATE);

    // draw the scene and update it each frame
    requestAnimationFrame(render);
}

function render(now) {
    updateTime(now);

    // create the light direction matrix and vector
    mat4.identity(light.directionMatrix);
    vec4.copy(light.direction, light.baseDirection);

    // apply the rotations to the matrix
    mat4.rotate(light.directionMatrix, light.directionMatrix, view.time / light.dayLength * Math.PI * 2, light.dayAxis);
    mat4.rotate(light.directionMatrix, light.directionMatrix, view.time / (light.dayLength * light.yearLength) * Math.PI * 2, light.yearAxis);

    // apply the matrix to get the current light direction vector
    vec4.transformMat4(light.direction, light.direction, light.directionMatrix);

    // render the scene
    drawStars();
    drawTorus();

    requestAnimationFrame(render);
}

function updateTime(now) {
    view.pageTime = now;

    view.time = Number(view.daySlider.value) + light.dayLength * Number(view.yearSlider.value);
}

// adjust the view location when the mouse is dragged
function onMouseMove(event) {
    if (event.buttons == 1 && view.allowPanning) {
        // track the precise angle values as integers to avoid loss of precision
        view.phiPrecise += event.movementX * view.panSensitivity * torus.smallRadius / torus.largeRadius;
        view.thetaPrecise += event.movementY * view.panSensitivity;

        // wrap the values past a full rotation to avoid overflow
        view.phiPrecise %= properties.PAN_LIMIT;
        view.thetaPrecise %= properties.PAN_LIMIT;

        // compute the actual angles as Numbers
        view.phi = view.phiPrecise * properties.PRECISE_PAN_TO_RADIANS;
        view.theta = view.thetaPrecise * properties.PRECISE_PAN_TO_RADIANS;
    }
}

// zoom when the scroll wheel is used
function onWheel(event) {
    // track the precise zoom value to avoid loss of precision
    view.zoomPrecise -= event.wheelDelta * properties.SCROLL_SENSITIVITY;
    view.zoomPrecise = Math.min(Math.max(view.zoomPrecise, properties.MIN_ZOOM), properties.MAX_ZOOM);

    // compute the exponential zoom value and the updated pan sensitivity
    view.zoom = 2 ** view.zoomPrecise;
    view.panSensitivity =
        2 ** (Math.min(view.zoomPrecise, properties.MAX_PAN_SENSITIVITY) - properties.MIN_ZOOM)
        * properties.BASE_PAN_SENSITIVITY / view.cameraDistance;

    // update the scale value on the bar
    document.getElementById("scalevalue").innerText =
        (torus.unitToKm * view.zoom / view.cameraDistance * properties.SCALE_LENGTH).toFixed(2)
        + "km";
}

// when a touch gesture begins, record all finger contacts
function onTouchStart(event) {
    for (let i = 0; i < event.changedTouches.length; i++) {
        touches.push(event.changedTouches.item(i));
    }
}

// when touch gestures end, clear the list
function onTouchEnd() {
    touches.splice(0, touches.length);
}

// when a touch gesture moves, trigger a pan or zoom accordingly
function onTouchMove(event) {
    // if only a single finger is on the screen, perform a pan
    if (touches.length == 1 && event.touches.length == 1) {
        let touch = event.touches.item(0);

        // invoke the pan function
        onMouseMove({
            buttons: 1,
            movementX: (touch.pageX - touches[0].pageX),
            movementY: (touch.pageY - touches[0].pageY)
        });

        // update to the latest touch point
        touches[0] = touch;
    }
    // if exactly two fingers are on the screen, perform a zoom
    else if (touches.length == 2 && event.touches.length == 2) {
        let touch1 = event.touches.item(0);
        let touch2 = event.touches.item(1);

        // get the distance between the last two touches
        let touchDistance = Math.sqrt(
            (touches[0].pageX - touches[1].pageX) * (touches[0].pageX - touches[1].pageX) +
            (touches[0].pageY - touches[1].pageY) * (touches[0].pageY - touches[1].pageY)
        );

        // get the distance between the current two touches
        let newTouchDistance = Math.sqrt(
            (touch1.pageX - touch2.pageX) * (touch1.pageX - touch2.pageX) +
            (touch1.pageY - touch2.pageY) * (touch1.pageY - touch2.pageY)
        );

        // invoke the zoom function
        onWheel({
            wheelDelta: (newTouchDistance - touchDistance) * properties.PINCH_SENSITIVITY_MODIFIER
        });

        // update to the latest touch points
        touches[0] = touch1;
        touches[1] = touch2;
    }
    // otherwise something has gone wrong with the tracking, clear all touches
    else {
        onTouchEnd();
    }
}

// update the url search params
function updateQueryParameters() {
    let urlSearchParams = new URLSearchParams(window.location.search);

    urlSearchParams.set("phi", view.phiPrecise.toFixed(4));
    urlSearchParams.set("theta", view.thetaPrecise.toFixed(4));
    urlSearchParams.set("zoom", view.zoomPrecise.toFixed(4));
    urlSearchParams.set("time", view.time);

    history.replaceState(null, "", window.location.pathname + "?" + urlSearchParams);
}

// reload the page on window resize
function onResize() {
    updateQueryParameters();
    location.reload();
}

// track when the user is interacting with input elements to block panning
function blockPanning() {
    view.allowPanning = false;
}

// track when the user is interacting with input elements to block panning
function unblockPanning() {
    view.allowPanning = true;
}

// initialize the shader program with a vertex shader and a fragment shader
// vsSource defines the source code for the vertex shader
// fsSource defines the source code for the fragment shader
// returns a shader program object
function initShaderProgram(vsSource, fsSource) {
    // compile the shaders
    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    // create the shader program and link the shaders
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // check that the shader program compiled correctly
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram,)}`);
        return null;
    }

    return shaderProgram;
}

// type defines the type of shader
// source defines the source code of the shader
// returns a compiled shader object
function loadShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // check that the shader compiled properly
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}
