// constants for panning and zooming
export const SCROLL_SENSITIVITY = 0.001;
export const MIN_ZOOM = -10;
export const MAX_ZOOM = 10;
export const BASE_PAN_SENSITIVITY = 0.1 * 2 ** (MIN_ZOOM - MAX_ZOOM);
export const MAX_PAN_SENSITIVITY = 2 ** (3.0 - MIN_ZOOM);
export const PAN_LIMIT = BigInt(Math.round(2.0 * Math.PI / BASE_PAN_SENSITIVITY));

// the planet dimensions and vertex properties
export const torys = {
    largeRadius: 8.0,
    smallRadius: 2.0,
    phiDegreeStep: 5,
    thetaDegreeStep: 10
};

// the light direction and ambience
export const light = {
    direction: [0.0, 3/5, 4/5, 0.0],
    ambience: 0.2
};

// the initial camera view
export const view = {
    phiPrecise: 24670867n,
    thetaPrecise: 33588861n,
    zoomPrecise: 2.0,
    phi: 0.0,
    theta: 0.0,
    zoom: 0.0,
    panSensitivity: 0.0
};
