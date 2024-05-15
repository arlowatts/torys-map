import { torus, input, view, query, look, pan, zoom } from "./properties.js";

// initialize event listeners to process user input
export function initEventListeners() {
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
}

// move the camera in a direction determined by the first-person view angle
export function moveFirstPersonCamera(deltaTime) {
    let deltaPhi = 0;
    let deltaTheta = 0;

    computeCameraSlope();

    // move forward when W is pressed
    if (input.keys["w"]) {
        deltaPhi += Math.sin(look.phi);
        deltaTheta += Math.cos(look.phi);
    }

    // move backward when S is pressed
    if (input.keys["s"]) {
        deltaPhi -= Math.sin(look.phi);
        deltaTheta -= Math.cos(look.phi);
    }

    // move left when A is pressed
    if (input.keys["a"]) {
        deltaPhi += Math.cos(look.phi);
        deltaTheta -= Math.sin(look.phi);
    }

    // move right when D is pressed
    if (input.keys["d"]) {
        deltaPhi -= Math.cos(look.phi);
        deltaTheta += Math.sin(look.phi);
    }

    // adjust the camera's position
    pan.phi += deltaPhi * deltaTime * look.speed / view.camera.slope.phi;
    pan.theta += deltaTheta * deltaTime * look.speed / view.camera.slope.theta;

    // wrap the values past a full rotation to avoid overflow
    pan.phi %= Math.TAU;
    pan.theta %= Math.TAU;
}

// adjust the view location when the mouse is dragged
function onMouseMove(event) {
    if (event.buttons === 1) {
        // when in a first-person view, change only the view direction
        if (view.isFirstPerson) {
            look.phi += event.movementX * input.sensitivity.mouse;
            look.theta -= event.movementY * input.sensitivity.mouse;

            look.phi %= Math.TAU;
            look.theta = Math.min(Math.max(look.theta, -Math.PI), 0);
        }
        // when in a top-down view, update the camera's position
        else {
            computeCameraSlope();

            pan.phi += event.movementX * input.sensitivity.mouse / view.camera.slope.phi;
            pan.theta += event.movementY * input.sensitivity.mouse / view.camera.slope.theta;

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
    zoom.val = Math.pow(2, zoom.precise);
}

// update first-person movement controls when the WASD keys are pressed
function onKeyDown(event) {
    input.keys[event.key] = true;
}

// toggle first-person view when the spacebar is pressed
function onKeyUp(event) {
    input.keys[event.key] = false;

    if (event.key === " ") view.isFirstPerson = !view.isFirstPerson;
}

// when a touch gesture begins, record all finger contacts
function onTouchStart(event) {
    for (let i = 0; i < event.changedTouches.length; i++) {
        input.touches.push(event.changedTouches.item(i));
    }
}

// when touch gestures end, clear the list
function onTouchEnd() {
    input.touches.splice(0, input.touches.length);
}

// when a touch gesture moves, trigger a pan or zoom accordingly
function onTouchMove(event) {
    // if only a single finger is on the screen, perform a pan
    if (input.touches.length === 1 && event.touches.length === 1) {
        let touch0 = event.touches.item(0);

        // invoke the pan function
        onMouseMove({
            buttons: 1,
            movementX: (touch0.pageX - input.touches[0].pageX),
            movementY: (touch0.pageY - input.touches[0].pageY)
        });

        // update to the latest touch point
        input.touches[0] = touch0;
    }

    // if exactly two fingers are on the screen, perform a zoom
    else if (input.touches.length === 2 && event.touches.length === 2) {
        let touch0 = event.touches.item(0);
        let touch1 = event.touches.item(1);

        // get the distance between the last two touches
        let oldTouchDistance = Math.hypot(
            input.touches[0].pageX - input.touches[1].pageX,
            input.touches[0].pageY - input.touches[1].pageY
        );

        // get the distance between the current two touches
        let newTouchDistance = Math.hypot(
            touch0.pageX - touch1.pageX,
            touch0.pageY - touch1.pageY
        );

        // invoke the zoom function
        onWheel({ wheelDelta: (newTouchDistance - oldTouchDistance) * input.sensitivity.pinch / input.sensitivity.scroll });

        // update to the latest touch points
        input.touches[0] = touch0;
        input.touches[1] = touch1;
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
    query.params.set("zoom", zoom.precise.toFixed(4));
    query.params.set("isfp", view.isFirstPerson);
    query.params.set("phi", pan.phi.toFixed(4));
    query.params.set("theta", pan.theta.toFixed(4));
    query.params.set("fphi", look.phi.toFixed(4));
    query.params.set("ftheta", look.theta.toFixed(4));

    history.replaceState(null, "", window.location.pathname + "?" + query.params);
}

// compute the derivative of the camera's position with respect to phi and theta
function computeCameraSlope() {
    const R = torus.radius.large / zoom.val;
    const r = torus.radius.small / zoom.val;

    view.camera.slope.phi = Math.hypot(
        (Math.cos(pan.theta) * r + R) * Math.cos(pan.phi),
        (Math.cos(pan.theta) * r + R) * Math.sin(pan.phi)
    );

    view.camera.slope.theta = r;
}
