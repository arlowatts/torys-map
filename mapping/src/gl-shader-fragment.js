import { torys } from "./properties.js";

/*
Evaluate point on the line L(o) at
    o = (w - (v[3]^2)(u[3]^2) / w) - 2(u[1]v[1] + u[2]v[2]).
Find the distance from this point to the torus. Testing only at this point
should be good enough (make sure to cap it at o > 0).
See the formula at https://www.desmos.com/calculator/anlsdhyaat.
*/

export const fsSource = `#version 300 es
bool isShadowed();
mediump float getHeight(mediump vec4);
mediump float noise3(mediump vec4, mediump vec4, uint);
mediump float noise2(mediump vec4, mediump vec4, uint);
mediump float noise(mediump float, mediump float, uint);
mediump float hash(uint);
mediump float lerp(mediump float, mediump float, mediump float);

uniform mediump vec4 uLightDirection;
uniform mediump float uLightAmbience;
uniform mediump float uZoomLevel;

in mediump vec4 pointPosition;

out mediump vec4 fragColor;

mediump float largeRadius = float(${torys.largeRadius});
mediump float smallRadius = float(${torys.smallRadius});

mediump float terrainNormalScale = 1.0 / 32.0;
mediump float terrainNormalHeight = 0.2;
mediump float terrainResolutionScale = 1.0 / 1024.0;

mediump float seaLevel = 0.6;
mediump float snowLine = 0.7;

void main() {
    mediump float surfaceValue = getHeight(pointPosition);

    // the point on the unit circle nearest the surface point
    mediump vec4 pointXZ = normalize(vec4(pointPosition.x, 0.0, pointPosition.z, 0.0));

    // the basic (unaltered) surface normal
    mediump vec4 normal = (pointPosition - largeRadius * pointXZ) / smallRadius;

    // test nearby points to determine the surface normal by finding two
    // vectors perpendicular to the normal and perpendicular to each other,
    // then shifting them by the surface heights and retrieving the normal
    if (surfaceValue > seaLevel) {
        // find a vector tangent to the circular core of the torus
        mediump vec4 pointA = vec4(pointXZ.z, 0.0, -pointXZ.x, 0.0);

        // find a vector perpendicular to both the normal and the tangent
        mediump vec4 pointB = vec4(cross(normal.xyz, pointA.xyz), 0.0);

        // scale by the distance at which to test for terrain normal
        pointA *= uZoomLevel * terrainNormalScale;
        pointB *= uZoomLevel * terrainNormalScale;

        // shift the vectors by the terrain height
        pointA += normal * (getHeight(pointPosition + pointA) - surfaceValue) * smallRadius * terrainNormalHeight;
        pointB += normal * (getHeight(pointPosition + pointB) - surfaceValue) * smallRadius * terrainNormalHeight;

        // retrieve the modified normal vector
        normal = normalize(vec4(cross(pointA.xyz, pointB.xyz), 0.0));
    }

    mediump float color = dot(normal, uLightDirection);
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
}

bool isShadowed() {
    // these values are used a few times
    mediump float pointLightY = pointPosition.y * uLightDirection.y;
    mediump float pointLightDot = dot(pointPosition, uLightDirection);

    // t is the distance along the ray of light to check for intersections
    mediump float t =
        smallRadius - pointLightY * pointLightY / smallRadius
        - 2.0 * (pointLightDot - pointLightY);

    if (t <= 0.0) {
        return false;
    }

    // then evaluate the squared distance function at t
    mediump float distance =
        (largeRadius + smallRadius) * (largeRadius - smallRadius)
        + dot(pointPosition, pointPosition) + 2.0 * t * pointLightDot
        + t * t - 2.0 * largeRadius * sqrt(
            pointPosition.x * pointPosition.x + pointPosition.z * pointPosition.z
            + 2.0 * t * (pointLightDot - pointLightY)
            + t * t * (uLightDirection.x * uLightDirection.x + uLightDirection.z * uLightDirection.z)
        );

    return distance <= 0.0;
}

mediump float getHeight(mediump vec4 pointPosition) {
    mediump float terrainResolution = min(uZoomLevel * terrainResolutionScale, 0.25);

    mediump float surfaceValue = 0.0;
    mediump float max = 0.0;
    mediump vec4 point = pointPosition;
    mediump float scaleFactor = 0.5;
    uint channel = 0u;

    while (scaleFactor > terrainResolution) {
        surfaceValue += noise3(point, floor(point), channel) * scaleFactor;
        max += scaleFactor;
        point *= 2.0;
        scaleFactor *= 0.5;
        channel += 1u;
    }

    return surfaceValue / max;
}

mediump float noise3(mediump vec4 point, mediump vec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0xffffu + uint(int(pointFloor.z));

    return lerp(
        noise2(point, pointFloor, evalAt),
        noise2(point, pointFloor, evalAt + 1u),
        point.z - pointFloor.z
    );
}

mediump float noise2(mediump vec4 point, mediump vec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0xffffu + uint(int(pointFloor.y));

    return lerp(
        noise(point.x, pointFloor.x, evalAt),
        noise(point.x, pointFloor.x, evalAt + 1u),
        point.y - pointFloor.y
    );
}

mediump float noise(mediump float point, mediump float pointFloor, uint evalAt) {
    evalAt = evalAt * 0xffffu + uint(int(pointFloor));

    return lerp(
        hash(evalAt),
        hash(evalAt + 1u),
        point - pointFloor
    );
}

// returns a value between 0 and 1
mediump float hash(uint x) {
    x ^= 2747636419u;
    x *= 2654435769u;
    x ^= x >> 16u;
    x *= 2654435769u;
    x ^= x >> 16u;
    x *= 2654435769u;

    return float(x) / 4294967295.0;
}

mediump float lerp(mediump float a, mediump float b, mediump float t) {
    return a + t * (b - a);
}
`;
