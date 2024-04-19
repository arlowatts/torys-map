import { stars, torus, light, view } from "./properties.js";

export const vertexSrc = `#version 300 es
in vec4 aVertexPosition;

out vec4 pointPosition;

void main() {
    gl_Position = aVertexPosition;
    pointPosition = aVertexPosition;
}
`;

export const fragmentSrc = `#version 300 es
precision mediump float;

float sdf(vec4);
float getAltitude(vec4);
vec4 getColor(float, float, float);
float noise4(vec4, vec4, uvec4, uint);
float noise3(vec4, vec4, uvec4, uint);
float noise2(vec4, vec4, uvec4, uint);
float noise(float, float, uint, uint);
float hash(uint);
float lerp(float, float, float);

uniform vec4 uCameraPosition;
uniform mat4 uViewDirectionMatrix;
uniform mat4 uLightDirectionMatrix;

uniform float uTerrainResolution;

uniform float uTime;

in vec4 pointPosition;

out vec4 fragColor;

float starResolution = float(${stars.resolution});
int starfieldSize = 2 * ${Math.round(stars.resolution)};
float starFrequency = float(${stars.frequency});

vec4 sunPosition = vec4(${light.baseDirection});
float sunSize = float(${light.sunSize});
vec3 sunColor = vec3(${light.sunColor});

float aspect = float(${view.aspect});
float cameraDistance = float(${view.cameraDistance});

float seaLevel = float(${torus.seaLevel});

float minDistance = 0.001;
float maxDistance = 100.0;

void main() {
    // create the ray for raymarching
    vec4 ray = pointPosition;

    // adjust and normalize the ray according to scene properties
    ray.x *= aspect;
    ray.z = cameraDistance;
    ray = uViewDirectionMatrix * ray;
    ray.w = 0.0;
    ray = normalize(ray);

    // initialize the starting point for the ray
    vec4 pos = uCameraPosition;

    // march the ray
    float distance = sdf(pos);
    int steps = 0;

    while (abs(distance) > minDistance && abs(distance) < maxDistance && steps < 100) {
        steps++;
        pos += distance / float(max(1, steps - 90)) * ray;
        distance = sdf(pos);
    }

    // if the ray hit the surface, compute color and shadow
    if (abs(distance) <= minDistance) {
        // compute the surface normal
        vec4 normal = vec4(sdf(vec4(pos.x + minDistance, pos.y, pos.z, 0.0)), sdf(vec4(pos.x, pos.y + minDistance, pos.z, 0.0)), sdf(vec4(pos.x, pos.y, pos.z + minDistance, 0.0)), 0.0);
        normal -= sdf(pos);
        normal.w = 0.0;
        normal = normalize(normal);

        // compute the shading based on the surface normal and the light
        // direction
        float shade = dot(uLightDirectionMatrix * normal, sunPosition);

        // compute the final pixel color
        fragColor = getColor(getAltitude(pos * 10.0), 0.62, shade);
    }
    // if the ray missed the surface, check for stars using the ray direction
    else {
        ray = uLightDirectionMatrix * ray;

        ivec4 pointHash = ivec4(floor(ray * starResolution));
        float color = hash(uint(
            starfieldSize * (
                pointHash.x + starfieldSize * (
                    pointHash.y + starfieldSize * pointHash.z
                )
            )
        ));

        if (length(ray - sunPosition) < sunSize) {
            fragColor = vec4(sunColor, 1.0);
        }
        else if (color < starFrequency) {
            fragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
        else {
            fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }
}

// returns the shortest distance from the point x to the scene
float sdf(vec4 r) {
    float d = sqrt(r.x * r.x + r.z * r.z) - 1.0;

    return sqrt(d * d + r.y * r.y) - 0.25 - max(getAltitude(r * 10.0), seaLevel) / 10.0;
}

float getAltitude(vec4 point) {
    float height = 0.0;

    vec4 noisePoint = point;
    vec4 pointFloor;

    float scaleFactor = 0.333;
    uint channel = 0u;

    do {
        pointFloor = floor(noisePoint);

        height *= scaleFactor;

        height += (1.0 - scaleFactor) * noise3(
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

    return height * 2.0 - 1.0;
}

vec4 getColor(float altitude, float temperature, float shade) {
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    if (altitude < seaLevel) {
        if (temperature > 0.2) {
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

        if (temperature > 0.6) {
            color.r = temperature;
            color.g = temperature;
            color.b = temperature / 1.5;
        }
        else if (temperature > 0.2) {
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
