import { drawStars, drawTorus } from "./draw-scene.js";
import { initTorusBuffer, initBackgroundBuffer } from "./init-buffers.js";
import { gl, programInfo, torus, view, light } from "./properties.js";
import * as properties from "./properties.js";
import * as torusFragment from "./gl-shader-torus-fragment.js";
import * as torusVertex from "./gl-shader-torus-vertex.js";
import * as starsFragment from "./gl-shader-stars-fragment.js";
import * as starsVertex from "./gl-shader-stars-vertex.js";

// arrays of touch event data for touchscreen support
const touches = [];

main();

function main() {
    // check that the webgl context opened correctly
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

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
        projectionMatrix: gl.getUniformLocation(torusProgram, "uProjectionMatrix"),
        viewMatrix: gl.getUniformLocation(torusProgram, "uViewMatrix"),
        lightDirection: gl.getUniformLocation(torusProgram, "uLightDirection"),
        lightAmbience: gl.getUniformLocation(torusProgram, "uLightAmbience"),
        zoomLevel: gl.getUniformLocation(torusProgram, "uZoomLevel")
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
    addEventListener("touchcancel", onTouchCancel);
    addEventListener("touchmove", onTouchMove);

    // draw the scene and update it each frame
    requestAnimationFrame(render);
}

function render(now) {
    mat4.identity(light.directionMatrix);
    vec4.copy(light.direction, light.baseDirection);

    light.rotations.forEach((rotation) => {
        mat4.rotate(light.directionMatrix, light.directionMatrix, now * rotation[0], rotation.slice(1));
    });

    vec4.transformMat4(light.direction, light.direction, light.directionMatrix);
    
    drawStars();
    drawTorus();

    requestAnimationFrame(render);
}

// adjust the view location when the mouse is dragged
function onMouseMove(event) {
    if (event.buttons == 1) {
        // track the precise angle values as BigInts to avoid loss of precision
        view.phiPrecise += BigInt(Math.round(event.movementX * torus.smallRadius * view.panSensitivity));
        view.thetaPrecise += BigInt(Math.round(event.movementY * torus.largeRadius * view.panSensitivity));

        // wrap the values when they have completed a full rotation
        view.phiPrecise %= properties.PAN_LIMIT;
        view.thetaPrecise %= properties.PAN_LIMIT;

        // compute the actual angles as Numbers
        view.phi = Number(view.phiPrecise) * properties.BASE_PAN_SENSITIVITY;
        view.theta = Number(view.thetaPrecise) * properties.BASE_PAN_SENSITIVITY;
    }
}

// zoom when the scroll wheel is used
function onWheel(event) {
    // track the precise zoom value to avoid loss of precision
    view.zoomPrecise -= event.wheelDelta * properties.SCROLL_SENSITIVITY;
    view.zoomPrecise = Math.min(Math.max(view.zoomPrecise, properties.MIN_ZOOM), properties.MAX_ZOOM);

    // recompute the exponential zoom value and the updated pan sensitivity
    view.zoom = 2 ** view.zoomPrecise;
    view.panSensitivity = Math.min(2 ** (view.zoomPrecise - properties.MIN_ZOOM), properties.MAX_PAN_SENSITIVITY);

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

// when a touch gesture ends, remove all touches that ended
function onTouchEnd(event) {
    for (let i = 0; i < event.changedTouches.length; i++) {
        for (let j = 0; j < touches.length; j++) {
            if (event.changedTouches.item(i).identifier == touches[j].identifier) {
                touches.splice(j, 1);
            }
        }
    }
}

// when touch gestures are canceled, clear the list
function onTouchCancel() {
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
            movementX: (touch.pageX - touches[0].pageX) * properties.TOUCH_PAN_SENSITIVITY,
            movementY: (touch.pageY - touches[0].pageY) * properties.TOUCH_PAN_SENSITIVITY
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
            wheelDelta: (newTouchDistance - touchDistance) * properties.TOUCH_SCROLL_SENSITIVITY
        });

        touches[0] = touch1;
        touches[1] = touch2;
    }
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
