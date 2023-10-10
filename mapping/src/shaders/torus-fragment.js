import { torus } from "../properties.js";

export const source = `#version 300 es
precision mediump float;

bool isShadowed(vec4);
float getAltitude(vec4);
float getTemperature(vec4);
float getCloud(vec4);
vec4 getColor(float, float, bool, float);
float noise4(vec4, vec4, uvec4, uint);
float noise3(vec4, vec4, uvec4, uint);
float noise2(vec4, vec4, uvec4, uint);
float noise(float, float, uint, uint);
float hash(uint);
float lerp(float, float, float);

uniform vec4 uLightDirection;
uniform float uLightAmbience;
uniform float uZoomLevel;

uniform float uTerrainResolution;
uniform float uTerrainHeightScale;
uniform float uTerrainNormalResolution;

uniform float uTime;
uniform int uShowClouds;

in vec4 pointPosition;

out vec4 fragColor;

float largeRadius = float(${torus.largeRadius});
float smallRadius = float(${torus.smallRadius});

float terrainNormalIntensity = float(${torus.terrainNormalIntensity});

float seaLevel = float(${torus.seaLevel});
float desertTemperature = float(${torus.desertTemperature});
float iceTemperature = float(${torus.iceTemperature});

float cloudSpeed = float(${torus.cloudSpeed});
float cloudThreshold = float(${torus.cloudThreshold});

void main() {
    // the point on the unit circle nearest the surface point
    vec4 pointXZ = normalize(vec4(pointPosition.x, 0.0, pointPosition.z, 0.0));

    // the basic (unaltered) surface normal
    vec4 normal = normalize(pointPosition - pointXZ * largeRadius);

    // adjust the point to be precisely on the torus
    vec4 point = pointXZ * largeRadius + normal * smallRadius;

    float altitude = getAltitude(point);
    float temperature = getTemperature(point);

    bool isCloud = false;

    if (uShowClouds == 1) {
        vec4 cloudPoint = vec4(point.xyz, uTime * cloudSpeed);

        isCloud = getCloud(cloudPoint) > cloudThreshold;
    }

    // test nearby points to determine the surface normal by finding two
    // vectors perpendicular to the normal and perpendicular to each other,
    // then shifting them by the surface heights and retrieving the normal
    if (altitude >= seaLevel && !isCloud) {
        // find a vector tangent to the circular core of the torus
        vec4 pointA = vec4(pointXZ.z, 0.0, -pointXZ.x, 0.0);

        // find a vector perpendicular to both the normal and the tangent
        vec4 pointB = vec4(cross(normal.xyz, pointA.xyz), 0.0);

        // scale by the distance at which to test for terrain normal
        pointA *= uTerrainNormalResolution;
        pointB *= uTerrainNormalResolution;

        // shift the vectors by the terrain height
        pointA += normal * (getAltitude(point + pointA) - altitude) * smallRadius * terrainNormalIntensity;
        pointB += normal * (getAltitude(point + pointB) - altitude) * smallRadius * terrainNormalIntensity;

        // retrieve the modified normal vector
        normal = normalize(vec4(cross(pointA.xyz, pointB.xyz), 0.0));
    }

    float shade = dot(normal, uLightDirection);
    shade = max(shade, 0.0) * (1.0 - uLightAmbience) + uLightAmbience;

    // test for shadows
    if (length(point.xz) < largeRadius && isShadowed(point)) {
        shade = uLightAmbience;
    }

    fragColor = getColor(altitude, temperature, isCloud, shade);
}

// Evaluate point on the line L(o) at
//     o = (w - (v[3]^2)(u[3]^2) / w) - 2(u[1]v[1] + u[2]v[2]).
// Find the distance from this point to the torus. Testing only at this point
// should be good enough (make sure to cap it at o > 0).
// See the formula at https://www.desmos.com/calculator/anlsdhyaat.
bool isShadowed(vec4 point) {
    // these values are used a few times
    float pointLightY = point.y * uLightDirection.y;
    float pointLightDot = dot(point, uLightDirection);

    // t is the distance along the ray of light to check for intersections
    float t =
        smallRadius - pointLightY * pointLightY / smallRadius
        - 2.0 * (pointLightDot - pointLightY);

    if (t <= 0.0) {
        return false;
    }

    // then evaluate the squared distance function at t
    float distance =
        (largeRadius + smallRadius) * (largeRadius - smallRadius)
        + dot(point, point) + 2.0 * t * pointLightDot
        + t * t - 2.0 * largeRadius * sqrt(
            point.x * point.x + point.z * point.z
            + 2.0 * t * (pointLightDot - pointLightY)
            + t * t * (uLightDirection.x * uLightDirection.x + uLightDirection.z * uLightDirection.z)
        );

    return distance <= 0.0;
}

float getAltitude(vec4 point) {
    float height = 0.0;

    vec4 noisePoint = point;
    vec4 pointFloor;

    float scaleFactor = 0.5;
    uint channel = 0u;

    do {
        pointFloor = floor(noisePoint);

        height += scaleFactor * noise3(
            noisePoint,
            noisePoint - pointFloor,
            uvec4(ivec4(pointFloor)),
            channel
        );

        noisePoint *= 2.0;
        noisePoint += 0.5;
        scaleFactor *= 0.5;
        channel += 1u;
    }
    while (scaleFactor >= uTerrainResolution);

    return height * uTerrainHeightScale;
}

float getTemperature(vec4 point) {
    float temp = 0.0;

    vec4 noisePoint = point * 0.5;
    vec4 pointFloor;

    float scaleFactor = 0.5;
    uint channel = 0xffffu;

    do {
        pointFloor = floor(noisePoint);

        temp += scaleFactor * noise3(
            noisePoint,
            noisePoint - pointFloor,
            uvec4(ivec4(pointFloor)),
            channel
        );

        noisePoint *= 2.0;
        noisePoint += 0.5;
        scaleFactor *= 0.5;
        channel += 1u;
    }
    while (scaleFactor >= uTerrainResolution);

    return temp * uTerrainHeightScale;
}

float getCloud(vec4 point) {
    float value = 0.0;

    vec4 noisePoint = point;
    vec4 pointFloor;

    float scaleFactor = 0.5;
    uint channel = 0x5555u;

    do {
        pointFloor = floor(noisePoint);

        value += scaleFactor * noise4(
            noisePoint,
            noisePoint - pointFloor,
            uvec4(ivec4(pointFloor)),
            channel
        );

        noisePoint *= 2.0;
        noisePoint += 0.5;
        scaleFactor *= 0.5;
        channel += 1u;
    }
    while (scaleFactor >= uTerrainResolution);

    return value * uTerrainHeightScale;
}

vec4 getColor(float altitude, float temperature, bool isCloud, float shade) {
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    if (isCloud) {
        color.r = 0.8;
        color.g = 0.8;
        color.b = 0.8;
    }
    else if (altitude < seaLevel) {
        if (temperature > iceTemperature) {
            color.b = temperature;
        }
        else {
            color.r = 0.8;
            color.g = 0.8;
            color.b = 1.0;
        }
    }
    else {
        temperature = temperature * 1.0 - 0.75 * (altitude - seaLevel) / (1.0 - seaLevel);

        if (temperature > desertTemperature) {
            color.r = temperature;
            color.g = temperature;
            color.b = temperature / 1.5;
        }
        else if (temperature > iceTemperature) {
            color.g = 1.0 - temperature;
            color.b = 1.0 - temperature;
        }
        else {
            color.r = 0.8;
            color.g = 0.8;
            color.b = 0.8;
        }
    }

    color *= shade;
    color.w = 1.0;
    return color;
}

float noise4(vec4 point, vec4 pointFrac, uvec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + pointFloor.w;

    return lerp(
        noise3(point, pointFrac, pointFloor, evalAt),
        noise3(point, pointFrac, pointFloor, evalAt + 1u),
        pointFrac.w
    );
}

float noise3(vec4 point, vec4 pointFrac, uvec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + pointFloor.z;

    return lerp(
        noise2(point, pointFrac, pointFloor, evalAt),
        noise2(point, pointFrac, pointFloor, evalAt + 1u),
        pointFrac.z
    );
}

float noise2(vec4 point, vec4 pointFrac, uvec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + pointFloor.y;

    return lerp(
        noise(point.x, pointFrac.x, pointFloor.x, evalAt),
        noise(point.x, pointFrac.x, pointFloor.x, evalAt + 1u),
        pointFrac.y
    );
}

float noise(float point, float pointFrac, uint pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + pointFloor;

    return lerp(
        hash(evalAt),
        hash(evalAt + 1u),
        pointFrac
    );
}

// returns a value between 0 and 1
float hash(uint x) {
    x ^= 2747636419u;
    x *= 2654435769u;
    x ^= x >> 16u;
    x *= 2654435769u;
    x ^= x >> 16u;
    x *= 2654435769u;

    // equal to float(x) / (2**32 - 1);
    return float(x) * 2.3283064370807974e-10;
}

float lerp(float a, float b, float t) {
    return a + t * (b - a);
}
`;
