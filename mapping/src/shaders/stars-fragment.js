import { stars, light, view } from "../properties.js";

export const source = `#version 300 es
precision mediump float;

float hash(uint);

uniform mat4 uViewDirectionMatrix;
uniform mat4 uLightDirectionMatrix;

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

void main() {
    vec4 point = pointPosition;

    point.x *= aspect;
    point.z -= cameraDistance;
    point = inverse(uLightDirectionMatrix) * inverse(uViewDirectionMatrix) * point;

    point.w = 0.0;
    point = normalize(point);
    
    ivec4 pointHash = ivec4(floor(point * starResolution));
    float color = hash(uint(starfieldSize * (pointHash.x + starfieldSize * (pointHash.y + starfieldSize * pointHash.z))));

    if (color < starFrequency) {
        fragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    else if (length(point - sunPosition) < sunSize) {
        fragColor = vec4(sunColor, 1.0);
    }
    else {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }
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
`;
