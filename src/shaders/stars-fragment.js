import { stars, torus, light, view } from "../properties.js";

export const source = `#version 300 es
precision mediump float;

float sdf(vec4);
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

uniform vec4 uCameraPosition;
uniform vec4 uLightDirection;
uniform mat4 uViewDirectionMatrix;
uniform mat4 uLightDirectionMatrix;

uniform float uTerrainResolution;
uniform float uTerrainHeightScale;
uniform float uTerrainNormalResolution;

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
float desertTemperature = float(${torus.desertTemperature});
float iceTemperature = float(${torus.iceTemperature});

float cloudSpeed = float(${torus.cloudSpeed});
float cloudThreshold = float(${torus.cloudThreshold});

float minDistance = 0.001;
float maxDistance = 100.0;

void main() {
    vec4 point = pointPosition;

    point.x *= aspect;
    point.z -= cameraDistance;
    point = inverse(uLightDirectionMatrix) * inverse(uViewDirectionMatrix) * point;

    point.w = 0.0;
    point = normalize(point);

    ivec4 pointHash = ivec4(floor(point * starResolution));
    float color = hash(uint(
        starfieldSize * (
            pointHash.x + starfieldSize * (
                pointHash.y + starfieldSize * pointHash.z
            )
        )
    ));

    if (length(point - sunPosition) < sunSize) {
        fragColor = vec4(sunColor, 1.0);
    }
    else if (color < starFrequency) {
        fragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    else {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }

    // create the raymarching ray
    vec4 ray = pointPosition;
    ray.x *= aspect;
    ray.z = cameraDistance;
    ray = inverse(uViewDirectionMatrix) * ray;
    ray.w = 0.0;
    ray = normalize(ray);

    vec4 pos = uCameraPosition;
    float distance = sdf(pos);

    // march the ray
    while (distance > minDistance && distance < maxDistance) {
        pos += distance * ray;
        distance = sdf(pos);
    }

    // if it hit the surface, compute color and shadow
    if (distance <= minDistance) {
        // the point on the unit circle nearest the surface point
        vec4 pointXZ = normalize(vec4(pos.x, 0.0, pos.z, 0.0));

        // the basic (unaltered) surface normal
        vec4 normal = normalize(pos - pointXZ);

        float shade = -dot(normal, uLightDirection);

        vec4 cloudPoint = vec4(pos.xyz * 10.0, uTime * cloudSpeed);

        fragColor = getColor(getAltitude(pos * 10.0), getTemperature(pos * 10.0), getCloud(cloudPoint) > cloudThreshold, shade);
    }
}

// returns the shortest distance from the point x to the scene
float sdf(vec4 r) {
    float d = sqrt(r.x * r.x + r.z * r.z) - 1.0;

    return sqrt(d * d + r.y * r.y) - 0.25;
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
