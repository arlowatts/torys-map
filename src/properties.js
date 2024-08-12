// tau at home
Math.TAU = Math.PI * 2;

// load the webgl context
const canvas = document.getElementById("mapcanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
export const gl = canvas.getContext("webgl2");

if (gl === null) alert("Unable to initialize WebGL. Your browser or machine may not support it.");

// properties used for updating the url query string
export const query = {
    params: new URLSearchParams(window.location.search),
    refreshRate: 1000,
};

// properties used for computing the camera's position in space
export const pan = {
    phi: query.params.has("phi") && !isNaN(query.params.get("phi")) ? Number(query.params.get("phi")) : 0,
    theta: query.params.has("theta") && !isNaN(query.params.get("theta")) ? Number(query.params.get("theta")) : 0,
};

// properties used for controlling the size and level of detail
export const zoom = {
    precise: query.params.has("zoom") && !isNaN(query.params.get("zoom")) ? Number(query.params.get("zoom")) : 13,

    val: 0,
    max: 14,
};

// properties controlling how the shader performs raymarching
export const ray = {
    distance: {
        min: 0.0001, // the distance threshold for detecting a collision
        max: 6000,   // the distance beyond which a ray is considered missed
    },

    steps: {
        scale: 0.5, // the multiplier used when computing step size
        max: 1000, // the maximum number of steps a ray can take
    },
}

// properties to track and control user inputs
export const input = {
    // dictionary of key press data for first-person controls
    keys: { "w": false, "a": false, "s": false, "d": false },

    // array of touch event data for touchscreen support
    touches: [],

    // parameters controlling the sensitivity of different input devices
    sensitivity: {
        mouse: 1 / window.innerHeight,
        scroll: 0.002,
        pinch: 0.003,
    },
};

// properties defining the planet's dimensions and other characteristics
export const torus = {
    // current time (seconds)
    time: 0,

    // dimensions (kilometers)
    radius: {
        large: 5096.8,
        small: 1274.2,
    },

    terrain: {
        size: 1 / 1000, // inverse factor controlling the size of the terrain
        height: 500, // scale factor controlling the height of the terrain

        detail: {
            base: 17, // base level of detail of the terrain
            min: 1, // minimum number of terrain detail levels to render
            max: 8, // maximum number of terrain detail levels to render
        },
    },

    axis: {
        day: [3 / 5, 0, 4 / 5], // local axis of rotation
        year: [0, 0, 1], // orbit axis of rotation
    },

    length: {
        day: 86400, // number of seconds in one day (local axis)
        year: 365, // number of days in one year (orbit axis)
    },
};

// properties defining the direction, color, and other characteristics of light
export const light = {
    ambience: 0.5, // ambient light brightness
    highlightSize: 16, // parameter controlling the size of specular highlights

    direction: {
        base: vec4.fromValues(1, 0, 0, 0), // the direction of light at time 0
    },

    sun: {
        size: 0.001, // parameter controlling the size of the sun
        color: [1.0, 0.9, 0.7], // color of the sun (rgb)
    },

    sky: {
        color: [0.4, 0.65, 1.0], // color of the sky (rgb)
    },

    sea: {
        color: [0.1, 0.3, 0.6], // color of the sea (rgb)
    },

    star: {
        resolution: 500, // parameter controlling the size of the stars
        frequency: 0.001, // approximate fraction of the screen that is stars
    },
};

// properties used to position and move the camera
export const view = {
    // aspect ratio of the canvas
    aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,

    // time since the page was loaded
    pageTime: 0,

    // property indicating whether the user is in a first-person view or not
    isFirstPerson: query.params.get("isfp") === "true",

    camera: {
        // parameter controlling the field of view
        distance: 1 / Math.tan(Math.PI / 8),

        // height of the camera above the surface of the planet (kilometers)
        height: 1,

        // current rate of change of the camera's position with respect to phi
        // and theta
        slope: {
            phi: 0,
            theta: 0,
        },
    },
};

// properties used to move and rotate the camera in a first-person view
export const look = {
    // movement speed of first-person controls
    speed: 0.001,

    // angles defining the first-person camera's direction
    phi: query.params.has("fphi") && !isNaN(query.params.get("fphi")) ? Number(query.params.get("fphi")) : 0,
    theta: query.params.has("ftheta") && !isNaN(query.params.get("ftheta")) ? Number(query.params.get("ftheta")) : -(Math.PI / 4),
};

// information about the shader program
export const programInfo = {
    program: null,
    attribLocations: {},
    uniformLocations: {},
};

// information about the mesh buffer
export const buffer = {
    reference: null,
    vertexCount: 4,
    numComponents: 2,
    type: gl.FLOAT,
    normalize: false,
    stride: 0,
    offset: 0,
    data: [-1, 1, -1, -1, 1, 1, 1, -1],
};

export const textures = {
    terrain: {
        imageUrl: "assets/images/terrain.png",
        reference: null,
        level: 0,
        internalFormat: gl.R16F,
        width: 3600,
        height: 1800,
        format: gl.RED,
        type: gl.FLOAT,
        data: null,
    },
    normal: {
        imageUrl: "",
        reference: null,
        level: 0,
        internalFormat: gl.RGB16F,
        width: 256,
        height: 64,
        format: gl.RGB,
        type: gl.FLOAT,
        data: null,
    },
};
