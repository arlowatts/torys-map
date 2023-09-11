// load the webgl context
const canvas = document.getElementById("mapcanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 4;
export const gl = canvas.getContext("webgl2");

// constants for panning and zooming
export const SCROLL_SENSITIVITY = 0.001;
export const MIN_ZOOM = -10;
export const MAX_ZOOM = 10;
export const BASE_PAN_SENSITIVITY = 0.1 * 2 ** (MIN_ZOOM - MAX_ZOOM);
export const MAX_PAN_SENSITIVITY = 2 ** (4.0 - MIN_ZOOM);
export const PAN_LIMIT = BigInt(Math.round(2.0 * Math.PI / BASE_PAN_SENSITIVITY));

// the length of the vertical scale/measuring bar in screen units
export const SCALE_LENGTH = 2.0 * document.getElementById("scalebar").clientHeight / window.innerHeight;

// the planet dimensions and vertex properties
export const torus = {
    largeRadius: 8.0,       // commonly denoted as R
    smallRadius: 2.0,       // commonly denoted as r
    unitToKm: 637.1,        // the ratio of the above units to kilometers
    phiDegreeStep: 5,       // the degree precision of the surface mesh around the large radius
    thetaDegreeStep: 10,    // the degree precision of the surface mesh around the small radius
    terrainResolution: 1.0 / 1024.0,        // the base resolution of the terrain
    terrainNormalResolution: 1.0 / 128.0,   // the level of precision in the terrain shading
    terrainNormalIntensity: 0.2,            // the intensity of the terrain shading
    seaLevel: 0.575,        // terrain below the sea level is water (blue)
    snowLevel: 0.7          // terrain above the snow level is snow (white)
};

export const stars = {
    resolution: 500.0,      // higher resolution gives smallers stars
    frequency: 0.001        // approximate percentage of the screen that is white
}

// the light direction and ambience
export const light = {
    baseDirection: vec4.fromValues(1.0, 0.0, 0.0, 0.0),     // the light direction at time 0
    directionMatrix: mat4.create(),     // the rotation matrix to get the light direction
    direction: vec4.create(),           // the light direction as a vector
    // rotations is a list to apply to the base direction in order
    // the first element of each rotation is multiplied with the current time
    // to get the rotation in radians, then the direction vector is rotated
    // by that amount around the axis defined by the remaining three components
    rotations: [
        [0.0000365, 3/5, 0.0, 4/5],   // this rotation represents the planet's local axis
        [0.0000001, 0.0, 0.0, 1.0]     // this rotation represents the planet's orbit
    ],
    ambience: 0.2,          // the base uniform light level
    sunSize: 0.05,          // the approximate radius of the sun in the sky
    sunColor: [1.0, 0.9, 0.7]       // the color of the sun in rgb format
};

// the initial camera view
const fov = 0.25 * Math.PI;
export const view = {
    aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,
    fov: fov,
    cameraDistance: 1 / Math.tan(0.5 * fov),
    // precise angles are stored as BigInts to avoid loss of precision at very
    // low or very high zoom levels
    phiPrecise: 0n,
    thetaPrecise: 0n,
    zoomPrecise: 2.0,
    // the actual values in radians are computed from the precise values
    phi: 0.0,
    theta: 0.0,
    zoom: 0.0,
    panSensitivity: 0.0
};

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
