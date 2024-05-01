import { light, view } from "./properties.js";

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

float sdf(vec4, uint);
vec4 getColor(vec4, vec4, vec4);
vec3 noise3(vec3);
uvec3 pcg3d(uvec3);
vec3 uvec3ToVec3(uvec3);

uniform vec4 uCameraPosition;
uniform mat4 uViewDirectionMatrix;
uniform mat4 uLightDirectionMatrix;

uniform float uLargeRadius;
uniform float uSmallRadius;
uniform uint uTerrainDetail;
uniform float uTerrainSize;
uniform float uTerrainHeight;

in vec4 pointPosition;

out vec4 fragColor;

float starResolution = float(${light.star.resolution});
float starFrequency = float(${light.star.frequency});

vec4 sunPosition = vec4(${light.direction.base}, 0.0);
float sunSize = float(${light.sun.size});
vec4 sunColor = vec4(${light.sun.color}, 1.0);
vec4 skyColor = vec4(${light.sky.color}, 1.0);

float aspect = float(${view.aspect});
float cameraDistance = float(${view.camera.distance});

float seaLevel = 0.0;
vec4 seaColor = vec4(${light.sea.color}, 1.0);

float minDistance = 0.0001;
float maxDistance = 100.0;
int maxSteps = 100;
float stepScale = 0.5;

float temperature = 0.62;
float ambience = float(${light.ambience});
float highlightSize = 16.0;

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
    float distance = sdf(pos, uTerrainDetail);
    float closestDistance = distance;

    for (int i = 0; i < maxSteps && abs(distance) > minDistance && distance < maxDistance; i++) {
        pos += stepScale * distance * ray;
        distance = sdf(pos, uTerrainDetail);

        if (abs(distance) < closestDistance) {
            closestDistance = abs(distance);
        }
    }

    // if the ray hit the surface, compute color and shadow
    if (abs(distance) <= minDistance) {
        // compute the surface normal
        vec4 normal = vec4(
            sdf(vec4(pos.x + minDistance, pos.y, pos.z, 0.0), uTerrainDetail),
            sdf(vec4(pos.x, pos.y + minDistance, pos.z, 0.0), uTerrainDetail),
            sdf(vec4(pos.x, pos.y, pos.z + minDistance, 0.0), uTerrainDetail),
            0.0
        );

        normal -= distance;
        normal.w = 0.0;
        normal = normalize(normal);

        // compute final pixel color
        fragColor = getColor(pos, normal, ray);
    }

    // if the ray missed the surface, check for stars using the ray direction
    else {
        ray = uLightDirectionMatrix * ray;

        // check if the ray hits the sun
        if (dot(ray, sunPosition) > 1.0 - sunSize) {
            fragColor = sunColor;
        }

        // otherwise hash the ray's direction and see if it hits a star
        else {
            // use a three dimensional hash function on the ray direction
            uvec3 hash = pcg3d(floatBitsToUint(floor(ray.xyz * starResolution)));

            // convert the hashed value to a float between 0.5 and 1.0
            float val = uintBitsToFloat((hash.x >> 9) | (126u << 23));

            // check if it passes the threshold
            if (val < 0.5 + starFrequency) {
                fragColor = vec4(val);
            }
            else {
                fragColor = vec4(0.0);
            }

            // blend with the atmosphere color
            fragColor = mix(fragColor, skyColor, min(max(uTerrainHeight - closestDistance, 0.0), 1.0));
            fragColor.w = 1.0;
        }
    }
}

// returns the shortest distance from the pos to the scene
float sdf(vec4 pos, uint maxOctaves) {
    // compute the distance from the point to th surface of a smooth torus
    float distance = length(pos.xz) - uLargeRadius;
    distance = sqrt(distance * distance + pos.y * pos.y) - uSmallRadius;

    pos *= uTerrainSize;
    float height = 0.0;
    float amplitude = uTerrainHeight;
    vec4 posFloor;
    uint channel = 0u;

    // add octaves of terrain noise until the limit is reached or the remaining
    // octaves could not reach the point
    for (uint i = 0u; i < maxOctaves && distance - height < amplitude; i++) {
        posFloor = floor(pos);

        amplitude *= 0.5;

        height += amplitude * noise3(pos.xyz).x;

        pos *= 2.0;
        pos += 0.5;

        channel += 1u;
    }

    return distance - max(height, -2.0 * minDistance);
}

vec4 getColor(vec4 pos, vec4 normal, vec4 ray) {
    vec4 color = vec4(0.0, 0.0, 0.0, 0.0);

    float height = sdf(pos, 0u);

    // compute shading based on the surface normal and the light direction
    float shade = dot(uLightDirectionMatrix * normal, sunPosition);

    if (height < seaLevel) {
        // compute the reflected view ray for specular highlights
        vec4 reflectedRay = ray - 2.0 * normal * dot(ray, normal);
        float highlight = pow(max(dot(uLightDirectionMatrix * reflectedRay, sunPosition), 0.0), highlightSize);

        color = mix(seaColor, sunColor, highlight);
    }
    else {
        temperature -= (height - seaLevel) / ((1.0 - seaLevel) * uTerrainHeight);

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

// return three smooth noise values between -1.0 and 1.0
vec3 noise3(vec3 pos) {
    uvec3 posFloor = uvec3(ivec3(floor(pos)));
    vec3 posFract = smoothstep(0.0, 1.0, fract(pos));

    return mix(
        mix(
            mix(
                uvec3ToVec3(pcg3d(posFloor)),
                uvec3ToVec3(pcg3d(uvec3(posFloor.x + 1u, posFloor.yz))),
                posFract.x
            ),
            mix(
                uvec3ToVec3(pcg3d(uvec3(posFloor.x, posFloor.y + 1u, posFloor.z))),
                uvec3ToVec3(pcg3d(uvec3(posFloor.x + 1u, posFloor.y + 1u, posFloor.z))),
                posFract.x
            ),
            posFract.y
        ),
        mix(
            mix(
                uvec3ToVec3(pcg3d(uvec3(posFloor.x, posFloor.y, posFloor.z + 1u))),
                uvec3ToVec3(pcg3d(uvec3(posFloor.x + 1u, posFloor.y, posFloor.z + 1u))),
                posFract.x
            ),
            mix(
                uvec3ToVec3(pcg3d(uvec3(posFloor.x, posFloor.y + 1u, posFloor.z + 1u))),
                uvec3ToVec3(pcg3d(uvec3(posFloor.x + 1u, posFloor.y + 1u, posFloor.z + 1u))),
                posFract.x
            ),
            posFract.y
        ),
        posFract.z
    );
}

// Mark Jarzynski and Marc Olano, Hash Functions for GPU Rendering, Journal of
// Computer Graphics Techniques (JCGT), vol. 9, no. 3, 21-38, 2020
// Available online http://jcgt.org/published/0009/03/02/
uvec3 pcg3d(uvec3 v) {
    v = v * 1664525u + 1013904223u;

    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;

    v = v ^ (v >> 16);

    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;

    return v;
}

// convert a uvec3 to a vec3 with components between -1.0 and 1.0
vec3 uvec3ToVec3(uvec3 v) {
    return vec3(v) / 2147483647.0 - 1.0;
}
`;
