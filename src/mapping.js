import { drawScene } from "./draw-scene.js";
import { initShaders } from "./init.js";
import { torus, view } from "./properties.js";
import * as properties from "./properties.js";

// arrays of touch event data for touchscreen support
const touches = [];

main();

function main() {
    // initialize the shader program
    initShaders();

    // update the pan and zoom values
    onMouseMove({ buttons: 1, movementX: 0.0, movementY: 0.0 });
    onWheel({ wheelDelta: 0.0 });

    // create the event listeners for pan and zoom
    addEventListener("mousemove", onMouseMove);
    addEventListener("wheel", onWheel);

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
    // render the scene
    drawScene();

    // schedule the next frame
    requestAnimationFrame(render);
}

// adjust the view location when the mouse is dragged
function onMouseMove(event) {
    if (event.buttons == 1) {
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

    // compute the exponential zoom value
    view.zoom = 2 ** view.zoomPrecise;

    // compute the updated pan sensitivity
    view.panSensitivity =
        2 ** (Math.min(view.zoomPrecise, properties.MAX_PAN_SENSITIVITY) - properties.MIN_ZOOM)
        * properties.BASE_PAN_SENSITIVITY / view.cameraDistance;
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

// reload the page on window resize
function onResize() {
    updateQueryParameters();
    location.reload();
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
