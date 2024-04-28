import { drawScene } from "./draw-scene.js";
import { initShaders } from "./init.js";
import { torus, view } from "./properties.js";
import * as properties from "./properties.js";

// dictionary of key press data for first-person controls
const wasd = {
    "w": false,
    "a": false,
    "s": false,
    "d": false
};

// array of touch event data for touchscreen support
const touches = [];

main();

function main() {
    // initialize the shader program
    initShaders();

    // update the zoom value
    onWheel({ wheelDelta: 0 });

    // create event listeners for pan and zoom
    addEventListener("mousemove", onMouseMove);
    addEventListener("wheel", onWheel);

    // create event listeners for first-person controls
    addEventListener("keydown", onKeyDown);
    addEventListener("keyup", onKeyUp);

    // create event listeners for touchscreen controls
    addEventListener("touchstart", onTouchStart);
    addEventListener("touchend", onTouchEnd);
    addEventListener("touchcancel", onTouchEnd);
    addEventListener("touchmove", onTouchMove);

    // create the event listener to reload on resize
    addEventListener("resize", onResize);

    // create an interval timer to update the url query parameters
    setInterval(updateQueryParameters, properties.QUERY_PARAM_REFRESH_RATE);

    // draw the scene and update it each frame
    requestAnimationFrame(render);
}

function render() {
    // update the position of the camera if first-person mode is toggled
    if (view.firstPerson)
        moveFirstPersonCamera();

    // render the scene
    drawScene();

    // schedule the next frame
    requestAnimationFrame(render);
}

function moveFirstPersonCamera() {
    // compute the speed for first-person movement in each direction
    const camSlopePhi = getCameraSlopePhi();
    const camSlopeTheta = torus.smallRadius / view.zoom;

    // move forward when W is pressed
    if (wasd["w"]) {
        view.theta += view.firstPersonSpeed * Math.cos(view.fphi) / camSlopeTheta;
        view.phi += view.firstPersonSpeed * Math.sin(view.fphi) / camSlopePhi;
    }

    // move backward when S is pressed
    if (wasd["s"]) {
        view.theta -= view.firstPersonSpeed * Math.cos(view.fphi) / camSlopeTheta;
        view.phi -= view.firstPersonSpeed * Math.sin(view.fphi) / camSlopePhi;
    }

    // move left when A is pressed
    if (wasd["a"]) {
        view.theta -= view.firstPersonSpeed * Math.sin(view.fphi) / camSlopeTheta;
        view.phi += view.firstPersonSpeed * Math.cos(view.fphi) / camSlopePhi;
    }

    // move right when D is pressed
    if (wasd["d"]) {
        view.theta += view.firstPersonSpeed * Math.sin(view.fphi) / camSlopeTheta;
        view.phi -= view.firstPersonSpeed * Math.cos(view.fphi) / camSlopePhi;
    }

    // wrap the values past a full rotation to avoid overflow
    view.phi %= Math.TAU;
    view.theta %= Math.TAU;
}

// compute the derivative of the camera's position with respect to phi
function getCameraSlopePhi() {
    const r1 = -(torus.largeRadius / view.zoom);
    const r2 = -(torus.smallRadius / view.zoom);

    return Math.sqrt(
        ((Math.cos(view.theta) * r2 + r1) * Math.cos(view.phi)) ** 2 +
        ((Math.cos(view.theta) * r2 + r1) * Math.sin(view.phi)) ** 2
    );
}

// adjust the view location when the mouse is dragged
function onMouseMove(event) {
    if (event.buttons == 1) {
        if (view.firstPerson) {
            view.fphi += event.movementX * view.lookSensitivity;
            view.ftheta -= event.movementY * view.lookSensitivity;

            view.fphi %= Math.TAU;
            view.ftheta = Math.min(Math.max(view.ftheta, -Math.PI), 0);
        }
        else {
            // track the precise angle values as integers to avoid loss of precision
            view.phi += event.movementX * view.panSensitivity * torus.smallRadius / torus.largeRadius;
            view.theta += event.movementY * view.panSensitivity;

            // wrap the values past a full rotation to avoid overflow
            view.phi %= Math.TAU;
            view.theta %= Math.TAU;
        }
    }
}

// zoom when the scroll wheel is used
function onWheel(event) {
    // track the precise zoom value to avoid loss of precision
    view.zoomPrecise -= event.wheelDelta * properties.SCROLL_SENSITIVITY;
    view.zoomPrecise = Math.min(Math.max(view.zoomPrecise, 0), properties.MAX_ZOOM);

    // compute the exponential zoom value
    view.zoom = 2 ** view.zoomPrecise;

    // compute the updated pan sensitivity
    view.panSensitivity = Math.min(properties.BASE_PAN_SENSITIVITY * view.zoom, properties.MAX_PAN_SENSITIVITY);
}

// update first-person movement controls when the WASD keys are pressed
function onKeyDown(event) {
    wasd[event.key] = true;
}

// toggle first-person view when the spacebar is pressed
function onKeyUp(event) {
    wasd[event.key] = false;

    if (event.key == " ") {
        view.firstPerson = !view.firstPerson;
    }
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
            (touches[0].pageX - touches[1].pageX) ** 2 +
            (touches[0].pageY - touches[1].pageY) ** 2
        );

        // get the distance between the current two touches
        let newTouchDistance = Math.sqrt(
            (touch1.pageX - touch2.pageX) ** 2 +
            (touch1.pageY - touch2.pageY) ** 2
        );

        // invoke the zoom function
        onWheel({ wheelDelta: properties.PINCH_SENSITIVITY_MODIFIER * (newTouchDistance - touchDistance) });

        // update to the latest touch points
        touches[0] = touch1;
        touches[1] = touch2;
    }
    // otherwise something has gone wrong with the tracking, clear all touches
    else {
        onTouchEnd();
    }
}

// reload the page on window resize
function onResize() {
    updateQueryParameters();
    location.reload();
}

// update the url search params
function updateQueryParameters() {
    let urlSearchParams = new URLSearchParams(window.location.search);

    urlSearchParams.set("time", view.time);
    urlSearchParams.set("zoom", view.zoomPrecise.toFixed(4));
    urlSearchParams.set("firstperson", view.firstPerson);
    urlSearchParams.set("phi", view.phi.toFixed(4));
    urlSearchParams.set("theta", view.theta.toFixed(4));
    urlSearchParams.set("fphi", view.fphi.toFixed(4));
    urlSearchParams.set("ftheta", view.ftheta.toFixed(4));

    history.replaceState(null, "", window.location.pathname + "?" + urlSearchParams);
}
