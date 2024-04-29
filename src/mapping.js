import { drawScene } from "./draw-scene.js";
import { initShaders } from "./init.js";
import { torus, view, pan, zoom, query, look, input } from "./properties.js";

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
    setInterval(updateQueryParameters, query.refreshRate);

    // draw the scene and update it each frame
    requestAnimationFrame(render);
}

function render() {
    // update the position of the camera if first-person mode is toggled
    if (view.isFirstPerson) moveFirstPersonCamera();

    // render the scene
    drawScene();

    // schedule the next frame
    requestAnimationFrame(render);
}

function moveFirstPersonCamera() {
    // compute the speed for first-person movement in each direction
    const R = -(torus.radius.large / zoom.val);
    const r = -(torus.radius.small / zoom.val);

    const camSlopePhi = Math.hypot(
        ((Math.cos(pan.theta) * r + R) * Math.cos(pan.phi)),
        ((Math.cos(pan.theta) * r + R) * Math.sin(pan.phi))
    );

    const camSlopeTheta = torus.radius.small / zoom.val;

    // move forward when W is pressed
    if (input.key["w"]) {
        pan.theta += look.speed * Math.cos(look.phi) / camSlopeTheta;
        pan.phi += look.speed * Math.sin(look.phi) / camSlopePhi;
    }

    // move backward when S is pressed
    if (input.key["s"]) {
        pan.theta -= look.speed * Math.cos(look.phi) / camSlopeTheta;
        pan.phi -= look.speed * Math.sin(look.phi) / camSlopePhi;
    }

    // move left when A is pressed
    if (input.key["a"]) {
        pan.theta -= look.speed * Math.sin(look.phi) / camSlopeTheta;
        pan.phi += look.speed * Math.cos(look.phi) / camSlopePhi;
    }

    // move right when D is pressed
    if (input.key["d"]) {
        pan.theta += look.speed * Math.sin(look.phi) / camSlopeTheta;
        pan.phi -= look.speed * Math.cos(look.phi) / camSlopePhi;
    }

    // wrap the values past a full rotation to avoid overflow
    pan.phi %= Math.TAU;
    pan.theta %= Math.TAU;
}

// adjust the view location when the mouse is dragged
function onMouseMove(event) {
    if (event.buttons == 1) {
        if (view.isFirstPerson) {
            look.phi += event.movementX * look.sensitivity;
            look.theta -= event.movementY * look.sensitivity;

            look.phi %= Math.TAU;
            look.theta = Math.min(Math.max(look.theta, -Math.PI), 0);
        }
        else {
            pan.phi += event.movementX * pan.sensitivity.val * torus.radius.small / torus.radius.large;
            pan.theta += event.movementY * pan.sensitivity.val;

            pan.phi %= Math.TAU;
            pan.theta %= Math.TAU;
        }
    }
}

// zoom when the scroll wheel is used
function onWheel(event) {
    // track the precise zoom value to avoid loss of precision
    zoom.precise -= event.wheelDelta * input.sensitivity.scroll;
    zoom.precise = Math.min(Math.max(zoom.precise, 0), zoom.max);

    // compute the exponential zoom value
    zoom.val = Math.exp(zoom.precise);

    // compute the updated pan sensitivity
    pan.sensitivity.val = pan.sensitivity.base * Math.min(zoom.val, pan.sensitivity.max);
}

// update first-person movement controls when the WASD keys are pressed
function onKeyDown(event) {
    input.key[event.key] = true;
}

// toggle first-person view when the spacebar is pressed
function onKeyUp(event) {
    input.key[event.key] = false;

    if (event.key == " ") {
        view.isFirstPerson = !view.isFirstPerson;
    }
}

// when a touch gesture begins, record all finger contacts
function onTouchStart(event) {
    for (let i = 0; i < event.changedTouches.length; i++) {
        input.touch.push(event.changedTouches.item(i));
    }
}

// when touch gestures end, clear the list
function onTouchEnd() {
    input.touch.splice(0, input.touch.length);
}

// when a touch gesture moves, trigger a pan or zoom accordingly
function onTouchMove(event) {
    // if only a single finger is on the screen, perform a pan
    if (input.touch.length == 1 && event.touches.length == 1) {
        let touch0 = event.touches.item(0);

        // invoke the pan function
        onMouseMove({
            buttons: 1,
            movementX: (touch0.pageX - input.touch[0].pageX),
            movementY: (touch0.pageY - input.touch[0].pageY)
        });

        // update to the latest touch point
        input.touch[0] = touch0;
    }
    // if exactly two fingers are on the screen, perform a zoom
    else if (input.touch.length == 2 && event.touches.length == 2) {
        let touch0 = event.touches.item(0);
        let touch1 = event.touches.item(1);

        // get the distance between the last two touches
        let touchDistance = Math.hypot(
            input.touch[0].pageX - input.touch[1].pageX,
            input.touch[0].pageY - input.touch[1].pageY
        );

        // get the distance between the current two touches
        let newTouchDistance = Math.hypot(
            touch0.pageX - touch1.pageX,
            touch0.pageY - touch1.pageY
        );

        // invoke the zoom function
        onWheel({ wheelDelta: input.sensitivity.pinch * (newTouchDistance - touchDistance) });

        // update to the latest touch points
        input.touch[0] = touch0;
        input.touch[1] = touch1;
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
    query.params.set("time", torus.time);
    query.params.set("zoom", zoom.precise.toFixed(4));
    query.params.set("isfp", view.isFirstPerson);
    query.params.set("phi", pan.phi.toFixed(4));
    query.params.set("theta", pan.theta.toFixed(4));
    query.params.set("fphi", look.phi.toFixed(4));
    query.params.set("ftheta", look.theta.toFixed(4));

    history.replaceState(null, "", window.location.pathname + "?" + query.params);
}
