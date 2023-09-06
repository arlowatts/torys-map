import { torys } from "./properties.js";

export const source = `#version 300 es
precision mediump float;

bool isShadowed();
float getHeight(vec4);
float noise3(vec4, vec4, uint);
float noise2(vec4, vec4, uint);
float noise(float, float, uint);
float hash(uint);
float lerp(float, float, float);

uniform vec4 uLightDirection;
uniform float uLightAmbience;
uniform float uZoomLevel;

in vec4 pointPosition;

out vec4 fragColor;

float largeRadius = float(${torys.largeRadius});
float smallRadius = float(${torys.smallRadius});

float terrainNormalScale = 1.0 / 256.0;
float terrainNormalHeight = 0.2;
float terrainResolutionScale = 1.0 / 1024.0;

float seaLevel = 0.575;
float snowLine = 0.7;

void main() {
    float surfaceValue = getHeight(pointPosition);

    // the point on the unit circle nearest the surface point
    vec4 pointXZ = normalize(vec4(pointPosition.x, 0.0, pointPosition.z, 0.0));

    // the basic (unaltered) surface normal
    vec4 normal = (pointPosition - largeRadius * pointXZ) / smallRadius;

    // test nearby points to determine the surface normal by finding two
    // vectors perpendicular to the normal and perpendicular to each other,
    // then shifting them by the surface heights and retrieving the normal
    if (surfaceValue > seaLevel) {
        // find a vector tangent to the circular core of the torus
        vec4 pointA = vec4(pointXZ.z, 0.0, -pointXZ.x, 0.0);

        // find a vector perpendicular to both the normal and the tangent
        vec4 pointB = vec4(cross(normal.xyz, pointA.xyz), 0.0);

        // scale by the distance at which to test for terrain normal
        pointA *= uZoomLevel * terrainNormalScale;
        pointB *= uZoomLevel * terrainNormalScale;

        // shift the vectors by the terrain height
        pointA += normal * (getHeight(pointPosition + pointA) - surfaceValue) * smallRadius * terrainNormalHeight;
        pointB += normal * (getHeight(pointPosition + pointB) - surfaceValue) * smallRadius * terrainNormalHeight;

        // retrieve the modified normal vector
        normal = normalize(vec4(cross(pointA.xyz, pointB.xyz), 0.0));
    }

    float color = dot(normal, uLightDirection);
    color = max(color, 0.0) * (1.0 - uLightAmbience) + uLightAmbience;

    // test for shadows
    if (length(pointPosition.xz) < largeRadius && isShadowed()) {
        color = uLightAmbience;
    }

    fragColor = vec4(
        surfaceValue < snowLine ? 0.0 : color * surfaceValue,
        surfaceValue < seaLevel ? 0.0 : color * surfaceValue,
        color * surfaceValue,
        1.0
    );
    // fragColor = vec4(color, color, color, 1.0);
}

// Evaluate point on the line L(o) at
//     o = (w - (v[3]^2)(u[3]^2) / w) - 2(u[1]v[1] + u[2]v[2]).
// Find the distance from this point to the torus. Testing only at this point
// should be good enough (make sure to cap it at o > 0).
// See the formula at https://www.desmos.com/calculator/anlsdhyaat.
bool isShadowed() {
    // these values are used a few times
    float pointLightY = pointPosition.y * uLightDirection.y;
    float pointLightDot = dot(pointPosition, uLightDirection);

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
        + dot(pointPosition, pointPosition) + 2.0 * t * pointLightDot
        + t * t - 2.0 * largeRadius * sqrt(
            pointPosition.x * pointPosition.x + pointPosition.z * pointPosition.z
            + 2.0 * t * (pointLightDot - pointLightY)
            + t * t * (uLightDirection.x * uLightDirection.x + uLightDirection.z * uLightDirection.z)
        );

    return distance <= 0.0;
}

float getHeight(vec4 pointPosition) {
    float terrainResolution = min(uZoomLevel * terrainResolutionScale, 0.25);

    float surfaceValue = 0.0;
    float max = 0.0;
    vec4 point = pointPosition;
    float scaleFactor = 0.5;
    uint channel = 0u;

    while (scaleFactor > terrainResolution) {
        surfaceValue += noise3(point, floor(point), channel) * scaleFactor;
        max += scaleFactor;
        point *= 2.0;
        point += 0.5;
        scaleFactor *= 0.5;
        channel += 1u;
    }

    return surfaceValue / max;
}

float noise3(vec4 point, vec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + uint(int(pointFloor.z));

    return lerp(
        noise2(point, pointFloor, evalAt),
        noise2(point, pointFloor, evalAt + 1u),
        point.z - pointFloor.z
    );
}

float noise2(vec4 point, vec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + uint(int(pointFloor.y));

    return lerp(
        noise(point.x, pointFloor.x, evalAt),
        noise(point.x, pointFloor.x, evalAt + 1u),
        point.y - pointFloor.y
    );
}

float noise(float point, float pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + uint(int(pointFloor));

    return lerp(
        hash(evalAt),
        hash(evalAt + 1u),
        point - pointFloor
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

    return float(x) / 4294967295.0;
}

float lerp(float a, float b, float t) {
    return a + t * (b - a);
}
`;
