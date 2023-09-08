// load the webgl context
export const gl = document.getElementById("mapcanvas").getContext("webgl2");

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

// constants for panning and zooming
export const SCROLL_SENSITIVITY = 0.001;
export const MIN_ZOOM = -10;
export const MAX_ZOOM = 10;
export const BASE_PAN_SENSITIVITY = 0.1 * 2 ** (MIN_ZOOM - MAX_ZOOM);
export const MAX_PAN_SENSITIVITY = 2 ** (4.0 - MIN_ZOOM);
export const PAN_LIMIT = BigInt(Math.round(2.0 * Math.PI / BASE_PAN_SENSITIVITY));

// the planet dimensions and vertex properties
export const torus = {
    largeRadius: 8.0,
    smallRadius: 2.0,
    phiDegreeStep: 5,
    thetaDegreeStep: 10,
    terrainResolution: 1.0 / 1024.0,
    terrainNormalResolution: 1.0 / 128.0,
    terrainNormalIntensity: 0.2,
    seaLevel: 0.575,
    snowLevel: 0.7
};

export const stars = {
    resolution: 500.0,
    frequency: 0.001
}

// the light direction and ambience
// baseDirection is the base light direction at time t = 0
// rotations is a list of quaternions to apply to the base direction in order
// the first element of the quaternion is multiplied with the current time
// to get the rotation in radians
export const light = {
    baseDirection: vec4.fromValues(1.0, 0.0, 0.0, 0.0),
    directionMatrix: mat4.create(),
    direction: vec4.create(),
    rotations: [
        [0.0001, 0.0, 0.0, 1.0], // this rotation represents the planet's orbit
        [0.00007, 3/5, 0.0, 4/5] // this one represents the planet's local axis
    ],
    ambience: 0.1,
    sunSize: 0.05,
    sunColor: [1.0, 0.9, 0.7]
};

// the initial camera view
export const view = {
    aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,
    fov: 0.25 * Math.PI,
    cameraDistance: 1 / Math.tan(0.125 * Math.PI),
    phiPrecise: 0n,
    thetaPrecise: 0n,
    zoomPrecise: 2.0,
    phi: 0.0,
    theta: 0.0,
    zoom: 0.0,
    panSensitivity: 0.0
};
