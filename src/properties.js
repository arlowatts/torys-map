// tau at home
Math.TAU = Math.PI * 2;

// load the webgl context
const canvas = document.getElementById("mapcanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
export const gl = canvas.getContext("webgl2");

// check that the webgl context opened correctly
if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
}

// load query parameters
const params = new URLSearchParams(window.location.search);

// constants for panning and zooming
export const MAX_ZOOM = 20;

export const SCROLL_SENSITIVITY = 0.0015;
export const PINCH_SENSITIVITY_MODIFIER = 2;

export const BASE_PAN_SENSITIVITY = 0.0025 / window.innerHeight;
export const MAX_PAN_SENSITIVITY = BASE_PAN_SENSITIVITY * (2 ** 12);

// delay between each refresh of the query parameters in milliseconds
export const QUERY_PARAM_REFRESH_RATE = 1000;

// planet dimensions and properties
export const torus = {
    // dimensions of the planet (km)
    largeRadius: 5096.8,
    smallRadius: 1274.2,

    terrainDetail: 15, // base level of detail of the terrain
    minTerrainDetail: 1, // minimum number of terrain detail levels to render
    maxTerrainDetail: 8, // maximum number of terrain detail levels to render

    terrainSize: 0.001, // inverse factor controlling the size of the terrain
    terrainHeight: 500, // scale factor controlling the height of the terrain

    seaLevel: 0
};

// star size and density
export const stars = {
    resolution: 500, // higher resolution gives smaller stars
    frequency: 0.001 // approximate fraction of the screen that is white
}

// light direction and ambience
export const light = {
    baseDirection: [1, 0, 0, 0],

    // the axes of rotation for days and years
    dayAxis: [3 / 5, 0, 4 / 5], // local axis
    yearAxis: [0, 0, 1], // orbit axis

    dayLength: 86400, // number of seconds in one day (local axis)
    yearLength: 365, // number of days in one year (orbit axis)

    ambience: 0.5, // ambient light brightness
    sunSize: 0.05, // approximate radius of the sun in the sky
    sunColor: [1.0, 0.9, 0.7], // color of the sun in rgb format
    skyColor: [0.4, 0.65, 1.0] // color of the sky in rgb format
};

// the initial camera view
export const view = {
    // aspect ratio of the canvas
    aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,

    // distance from the viewer to the screen to achieve a FOV of 45 degrees
    cameraDistance: 1 / Math.tan(Math.PI / 8),

    // height of the camera above the surface (km)
    cameraHeight: 1,

    // perspective type
    firstPerson: params.get("firstperson") == "true",

    // movement speed of first-person controls
    firstPersonSpeed: 0.05,

    // angles defining the first-person camera's direction
    fphi: params.has("fphi") && !isNaN(params.get("fphi")) ? Number(params.get("fphi")) : 0,
    ftheta: params.has("ftheta") && !isNaN(params.get("ftheta")) ? Number(params.get("ftheta")) : -(Math.PI / 4),

    // angles defining the camera's position on the surface
    phi: params.has("phi") && !isNaN(params.get("phi")) ? Number(params.get("phi")) : 0,
    theta: params.has("theta") && !isNaN(params.get("theta")) ? Number(params.get("theta")) : 0,

    // zoom values
    zoomPrecise: params.has("zoom") && !isNaN(params.get("zoom")) ? Number(params.get("zoom")) : 12,
    zoom: 0,

    // world time (seconds)
    time: params.has("time") && !isNaN(params.get("time")) ? Number(params.get("time")) : 0,

    panSensitivity: 0,
    lookSensitivity: 0.001
};

// store information about the shader programs, such as uniform locations
// (initialized before the first frame is rendered)
export const programInfo = {
    program: null,
    attribLocations: {},
    uniformLocations: {}
};

// the framework for the data buffer (initialized before the first frame is
// rendered)
export const buffer = {
    data: [],
    vertexCount: 4,
    numComponents: 2,
    type: gl.FLOAT,
    normalize: false,
    stride: 0,
    offset: 0
};
