import { stars, light, view } from "../properties.js";

export const source = `#version 300 es
precision mediump float;

float sdf(vec4);
float hash(uint);

uniform vec4 uCameraPosition;
uniform vec4 uLightDirection;
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

        float val = dot(normal, uLightDirection);

        fragColor = vec4(val, val, val, 1.0);
    }
}

// returns the shortest distance from the point x to the scene
float sdf(vec4 r) {
    float d = sqrt(r.x * r.x + r.z * r.z) - 1.0;

    return sqrt(d * d + r.y * r.y) - 0.25;
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
`;
