// tau at home
Math.TAU = Math.PI * 2;

// load the webgl context
const canvas = document.getElementById("mapcanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
export const gl = canvas.getContext("webgl2");

if (gl === null) alert("Unable to initialize WebGL. Your browser or machine may not support it.");

export const query = {
    params: new URLSearchParams(window.location.search),
    refreshRate: 1000,
};

export const pan = {
    // angles defining the camera's position on the surface
    phi: query.params.has("phi") && !isNaN(query.params.get("phi")) ? Number(query.params.get("phi")) : 0,
    theta: query.params.has("theta") && !isNaN(query.params.get("theta")) ? Number(query.params.get("theta")) : 0,

    sensitivity: {
        base: 0.001 / window.innerHeight,
        val: 0,
        max: Math.exp(9),
    },
};

export const zoom = {
    // zoom values
    precise: query.params.has("zoom") && !isNaN(query.params.get("zoom")) ? Number(query.params.get("zoom")) : 10,

    val: 0,
    max: 12,
};

export const input = {
    // dictionary of key press data for first-person controls
    key: {
        "w": false,
        "a": false,
        "s": false,
        "d": false,
    },

    // array of touch event data for touchscreen support
    touch: [],

    sensitivity: {
        scroll: 0.001,
        pinch: 0.002,
    },
};

// planet dimensions and properties
export const torus = {
    // world time (seconds)
    time: query.params.has("time") && !isNaN(query.params.get("time")) ? Number(query.params.get("time")) : 0,

    // dimensions of the planet (km)
    radius: {
        large: 5096.8,
        small: 1274.2,
    },

    terrain: {
        size: 1 / 1000, // inverse factor controlling the size of the terrain
        height: 500, // scale factor controlling the height of the terrain
    },

    terrainDetail: {
        base: 15, // base level of detail of the terrain
        min: 1, // minimum number of terrain detail levels to render
        max: 8, // maximum number of terrain detail levels to render
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

// light direction and ambience
export const light = {
    ambience: 0.5, // ambient light brightness

    direction: {
        base: [1, 0, 0],
    },

    sun: {
        size: 0.05, // approximate radius of the sun in the sky
        color: [1.0, 0.9, 0.7], // color of the sun in rgb format
    },

    sky: {
        color: [0.4, 0.65, 1.0], // color of the sky in rgb format
    },

    star: {
        resolution: 500, // higher resolution gives smaller stars
        frequency: 0.001, // approximate fraction of the screen that is white
    },
};

// the initial camera view
export const view = {
    // aspect ratio of the canvas
    aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,

    camera: {
        distance: 1 / Math.tan(Math.PI / 8), // gives 45 degree fov
        height: 1, // height of the camera above the surface (km)
    },

    // perspective type
    isFirstPerson: query.params.get("isfp") == "true",
};

export const look = {
    // movement speed of first-person controls
    speed: 0.05,

    // angles defining the first-person camera's direction
    phi: query.params.has("fphi") && !isNaN(query.params.get("fphi")) ? Number(query.params.get("fphi")) : 0,
    theta: query.params.has("ftheta") && !isNaN(query.params.get("ftheta")) ? Number(query.params.get("ftheta")) : -(Math.PI / 4),

    sensitivity: 0.0025,
};

// information about the shader program
export const programInfo = {
    program: null,
    attribLocations: {},
    uniformLocations: {},
};

// information about the mesh buffer
export const buffer = {
    data: null,
    vertexCount: 4,
    numComponents: 2,
    type: gl.FLOAT,
    normalize: false,
    stride: 0,
    offset: 0,
};
