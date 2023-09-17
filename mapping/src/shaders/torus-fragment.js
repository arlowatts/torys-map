import { torus } from "../properties.js";

export const source = `#version 300 es
precision mediump float;

bool isShadowed(vec4);
float getHeight(vec4);
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

in vec4 pointPosition;

out vec4 fragColor;

float largeRadius = float(${torus.largeRadius});
float smallRadius = float(${torus.smallRadius});

float terrainNormalIntensity = float(${torus.terrainNormalIntensity});

float seaLevel = float(${torus.seaLevel});
float snowLevel = float(${torus.snowLevel});

void main() {
    // the point on the unit circle nearest the surface point
    vec4 pointXZ = normalize(vec4(pointPosition.x, 0.0, pointPosition.z, 0.0));

    // the basic (unaltered) surface normal
    vec4 normal = normalize(pointPosition - pointXZ * largeRadius);

    // adjust the point to be precisely on the torus
    vec4 point = pointXZ * largeRadius + normal * smallRadius;

    float surfaceValue = getHeight(point);

    // test nearby points to determine the surface normal by finding two
    // vectors perpendicular to the normal and perpendicular to each other,
    // then shifting them by the surface heights and retrieving the normal
    if (surfaceValue > seaLevel) {
        // find a vector tangent to the circular core of the torus
        vec4 pointA = vec4(pointXZ.z, 0.0, -pointXZ.x, 0.0);

        // find a vector perpendicular to both the normal and the tangent
        vec4 pointB = vec4(cross(normal.xyz, pointA.xyz), 0.0);

        // scale by the distance at which to test for terrain normal
        pointA *= uTerrainNormalResolution;
        pointB *= uTerrainNormalResolution;

        // shift the vectors by the terrain height
        pointA += normal * (getHeight(point + pointA) - surfaceValue) * smallRadius * terrainNormalIntensity;
        pointB += normal * (getHeight(point + pointB) - surfaceValue) * smallRadius * terrainNormalIntensity;

        // retrieve the modified normal vector
        normal = normalize(vec4(cross(pointA.xyz, pointB.xyz), 0.0));
    }

    float color = dot(normal, uLightDirection);
    color = max(color, 0.0) * (1.0 - uLightAmbience) + uLightAmbience;

    // test for shadows
    if (length(point.xz) < largeRadius && isShadowed(point)) {
        color = uLightAmbience;
    }

    fragColor = vec4(
        surfaceValue < snowLevel ? 0.0 : color * surfaceValue,
        surfaceValue < seaLevel ? 0.0 : color * surfaceValue,
        color * surfaceValue,
        1.0
    );
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

float getHeight(vec4 point) {
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
    while (scaleFactor > uTerrainResolution);

    return height * uTerrainHeightScale;
}

float noise3(vec4 point, vec4 pointFract, uvec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + pointFloor.z;

    return lerp(
        noise2(point, pointFract, pointFloor, evalAt),
        noise2(point, pointFract, pointFloor, evalAt + 1u),
        pointFract.z
    );
}

float noise2(vec4 point, vec4 pointFract, uvec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + pointFloor.y;

    return lerp(
        noise(point.x, pointFract.x, pointFloor.x, evalAt),
        noise(point.x, pointFract.x, pointFloor.x, evalAt + 1u),
        pointFract.y
    );
}

float noise(float point, float pointFract, uint pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + pointFloor;

    return lerp(
        hash(evalAt),
        hash(evalAt + 1u),
        pointFract
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
