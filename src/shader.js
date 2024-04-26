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

uniform vec4 uCameraPosition;
uniform mat4 uViewDirectionMatrix;
uniform mat4 uLightDirectionMatrix;

uniform float uLargeRadius;
uniform float uSmallRadius;
uniform int uTerrainDetail;
uniform float uTerrainSize;
uniform float uTerrainHeight;

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

float minDistance = 0.0001;
float maxDistance = 100.0;
int maxSteps = 100;
int stepsUntilShuffle = 70;

float temperature = 0.62;
float ambience = float(${light.ambience});

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

    for (int i = 0; i < maxSteps && abs(distance) > minDistance && distance < maxDistance; i++) {
        pos += distance / float(max(1, i - stepsUntilShuffle)) * ray;
        distance = sdf(pos);
    }

    // if the ray hit the surface, compute color and shadow
    if (abs(distance) <= minDistance) {
        // compute the surface normal
        vec4 normal = vec4(
            sdf(vec4(pos.x + minDistance, pos.y, pos.z, 0.0)),
            sdf(vec4(pos.x, pos.y + minDistance, pos.z, 0.0)),
            sdf(vec4(pos.x, pos.y, pos.z + minDistance, 0.0)),
            0.0
        );

        normal -= sdf(pos);
        normal.w = 0.0;
        normal = normalize(normal);

        // compute shading based on the surface normal and the light direction
        float shade = dot(uLightDirectionMatrix * normal, sunPosition);

        // compute final pixel color
        fragColor = getColor(getAltitude(pos), temperature, shade);
    }

    // if the ray missed the surface, check for stars using the ray direction
    else {
        ray = uLightDirectionMatrix * ray;

        ivec4 pointHash = ivec4(floor(ray * starResolution));

        float val = hash(uint(
            starfieldSize * (
                pointHash.x + starfieldSize * (
                    pointHash.y + starfieldSize * pointHash.z
                )
            )
        ));

        if (length(ray - sunPosition) < sunSize) {
            fragColor = vec4(sunColor, 1.0);
        }
        else if (val < starFrequency) {
            fragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
        else {
            fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
    }
}

// returns the shortest distance from the pos to the scene
float sdf(vec4 pos) {
    float a = length(pos.xz) - uLargeRadius;

    return sqrt(a * a + pos.y * pos.y) - (uSmallRadius + max(getAltitude(pos), seaLevel));
}

float getAltitude(vec4 point) {
    point *= uTerrainSize;

    float height = 0.0;
    int scale = 0;

    vec4 pointFloor;

    uint channel = 0u;

    for (int i = 0; i < uTerrainDetail; i++) {
        pointFloor = floor(point);

        height *= 2.0;
        height += noise3(point, point - pointFloor, uvec4(ivec4(pointFloor)), channel) * 2.0 - 1.0;

        scale *= 2;
        scale += 1;

        point *= 2.0;
        point += 0.5;

        channel += 1u;
    }

    return uTerrainHeight * height / float(scale);
}

vec4 getColor(float altitude, float temperature, float shade) {
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    if (altitude < seaLevel) {
        color.b = temperature;
    }
    else {
        temperature -= (altitude - seaLevel) / ((1.0 - seaLevel) * uTerrainHeight);

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

    color *= shade + ambience;
    color.w = 1.0;

    return color;
}

float noise4(vec4 point, vec4 pointFrac, uvec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + pointFloor.w;

    return mix(
        noise3(point, pointFrac, pointFloor, evalAt),
        noise3(point, pointFrac, pointFloor, evalAt + 1u),
        smoothstep(0.0, 1.0, pointFrac.w)
    );
}

float noise3(vec4 point, vec4 pointFrac, uvec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + pointFloor.z;

    return mix(
        noise2(point, pointFrac, pointFloor, evalAt),
        noise2(point, pointFrac, pointFloor, evalAt + 1u),
        smoothstep(0.0, 1.0, pointFrac.z)
    );
}

float noise2(vec4 point, vec4 pointFrac, uvec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + pointFloor.y;

    return mix(
        noise(point.x, pointFrac.x, pointFloor.x, evalAt),
        noise(point.x, pointFrac.x, pointFloor.x, evalAt + 1u),
        smoothstep(0.0, 1.0, pointFrac.y)
    );
}

float noise(float point, float pointFrac, uint pointFloor, uint evalAt) {
    evalAt = evalAt * 0x05555555u + pointFloor;

    return mix(
        hash(evalAt),
        hash(evalAt + 1u),
        smoothstep(0.0, 1.0, pointFrac)
    );
}

// Mark Jarzynski and Marc Olano, Hash Functions for GPU Rendering, Journal of
// Computer Graphics Techniques (JCGT), vol. 9, no. 3, 21-38, 2020
// Available online http://jcgt.org/published/0009/03/02/
float hash(uint x) {
    uint state = x * 747796405u + 2891336453u;
    uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;

    // equal to float(x) / (2**32 - 1);
    return float((word >> 22u) ^ word) * 2.3283064370807974e-10;
}
`;
