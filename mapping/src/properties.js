// load the webgl context
const canvas = document.getElementById("mapcanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
export const gl = canvas.getContext("webgl2");

// check that the webgl context opened correctly
if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
}

// constants for panning and zooming
export const SCROLL_SENSITIVITY = 0.0015;
export const PINCH_SENSITIVITY_MODIFIER = 2.0;
export const MIN_ZOOM = -10;
export const MAX_ZOOM = 10;
export const BASE_PAN_SENSITIVITY = 1.0 / window.innerHeight;
export const MAX_PAN_SENSITIVITY = 4.0;
export const PRECISE_PAN_TO_RADIANS = 2 ** MIN_ZOOM;
export const PAN_LIMIT = Math.round(2.0 * Math.PI / PRECISE_PAN_TO_RADIANS);

// the minimum distance from the camera to the surface before narrowing the fov
export const MIN_CAMERA_DISTANCE = 1.0;

// the length of the vertical scale/measuring bar in screen units
export const SCALE_LENGTH = 2.0 * document.getElementById("scalebar").clientHeight / window.innerHeight;

// the delay between each refresh of the query params in milliseconds
export const QUERY_PARAM_REFRESH_RATE = 1000;

// the planet dimensions and vertex properties
// phi is associated with the large radius
// theta is associated with the small radius
export const torus = {
    largeRadius: 8.0,       // commonly denoted as R
    smallRadius: 2.0,       // commonly denoted as r
    unitToKm: 637.1,        // the ratio of internal units to kilometers

    phiDegreeStep: 5,       // the degree precision of the surface mesh around the large radius
    thetaDegreeStep: 10,    // the degree precision of the surface mesh around the small radius

    terrainResolution: 1.0 / 1024.0,        // the base resolution of the terrain
    terrainNormalResolution: 1.0 / 128.0,   // the level of precision in the terrain shading
    terrainNormalIntensity: 0.2,            // the intensity of the terrain shading

    seaLevel: 0.575,        // terrain below the sea level is water (blue)
    snowLevel: 0.7          // terrain above the snow level is snow (white)
};

export const stars = {
    resolution: 500.0,      // higher resolution gives smaller stars
    frequency: 0.001        // approximate percentage of the screen that is white
}

// the light direction and ambience
export const light = {
    baseDirection: vec4.fromValues(1.0, 0.0, 0.0, 0.0), // the light direction at time 0
    directionMatrix: mat4.create(), // the rotation matrix to get the light direction
    direction: vec4.create(),       // the light direction as a vector

    // the axes of rotation for days and years
    dayAxis: [3/5, 0.0, 4/5], // this rotation represents the planet's local axis
    yearAxis: [0.0, 0.0, 1.0],  // this rotation represents the planet's orbit

    dayLength: 86400,   // number of seconds in one day
    yearLength: 365,    // number of days in one year

    ambience: 0.2,              // the base uniform light level
    sunSize: 0.05,              // the approximate radius of the sun in the sky
    sunColor: [1.0, 0.9, 0.7]   // the color of the sun in rgb format
};

// compute viewport properties
const fov = 0.25 * Math.PI;

// load query parameters
const params = new URLSearchParams(window.location.search);

// the initial camera view
export const view = {
    aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,
    fov: fov,
    cameraDistance: 1 / Math.tan(0.5 * fov),

    // the world time in seconds
    time: params.has("time") && !isNaN(params.get("time")) ? Number(params.get("time")) : 0,
    // time since the page was loaded in milliseconds
    pageTime: 0,

    // the sliders controlling the world time
    daySlider: document.getElementById("dayslider"),
    yearSlider: document.getElementById("yearslider"),

    // precise angles are tracked as integers to avoid loss of precision
    phiPrecise: params.has("phi") && !isNaN(params.get("phi")) ? Number(params.get("phi")) : 0,
    thetaPrecise: params.has("theta") && !isNaN(params.get("theta")) ? Number(params.get("theta")) : 500,
    // the actual values in radians are computed from the precise values
    phi: 0.0,
    theta: 0.0,

    zoomPrecise: params.has("zoom") && !isNaN(params.get("zoom")) ? Number(params.get("zoom")) : 4.0,
    zoom: 0.0,

    panSensitivity: 0.0,
    allowPanning: true
};

// update the slider parameters
view.daySlider.max = light.dayLength - 1;
view.yearSlider.max = light.yearLength - 1;
view.daySlider.value = view.time % light.dayLength;
view.yearSlider.value = (view.time - view.time % light.dayLength) / light.dayLength;

// store information about the shader programs, such as uniform locations
// initialized before the first frame is rendered
export const programInfo = {
    torus: {
        program: null,
        attribLocations: {},
        uniformLocations: {}
    },
    stars: {
        program: null,
        attribLocations: {},
        uniformLocations: {}
    }
};

// the framework for the data buffers
// initialized before the first frame is rendered
export const buffers = {
    torus: {
        data: [],
        vertexCount: 0,
        numComponents: 0,
        type: null,
        normalize: false,
        stride: 0,
        offset: 0
    },
    stars: {
        data: [],
        vertexCount: 0,
        numComponents: 0,
        type: null,
        normalize: false,
        stride: 0,
        offset: 0
    }
};
