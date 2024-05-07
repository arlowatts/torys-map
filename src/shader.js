import { light, ray, view } from "./properties.js";

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
float noise3(vec3);
uint iqint1(uint);

uniform vec4 uCameraPosition;
uniform mat4 uViewDirectionMatrix;

uniform vec4 uLightDirection;
uniform mat4 uLightDirectionMatrix;

uniform float uLargeRadius;
uniform float uSmallRadius;

uniform uint uTerrainDetail;
uniform float uTerrainSize;
uniform float uTerrainHeight;

in vec4 pointPosition;
out vec4 fragColor;

float aspect = float(${view.aspect});
float cameraDistance = float(${view.camera.distance});

float ambience = float(${light.ambience});
float highlightSize = float(${light.highlightSize});

float starResolution = float(${light.star.resolution});
float starFrequency = float(${light.star.frequency});

float sunSize = float(${light.sun.size});
vec4 sunColor = vec4(${light.sun.color}, 1.0);
vec4 skyColor = vec4(${light.sky.color}, 1.0);
vec4 seaColor = vec4(${light.sea.color}, 1.0);

float minDistance = float(${ray.distance.min});
float maxDistance = float(${ray.distance.max});
int maxSteps = ${Math.round(ray.steps.max)};
float stepScale = float(${ray.steps.scale});

uvec4 primes = uvec4(19, 47, 101, 131);

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
    float distance = sdf(pos, uTerrainDetail);
    float leastHeight = sdf(pos, 0u);

    // march the ray
    for (int i = 0; i < maxSteps && abs(distance) > minDistance && distance < maxDistance; i++) {
        pos += stepScale * distance * ray;
        distance = sdf(pos, uTerrainDetail);

        leastHeight = min(leastHeight, sdf(pos, 0u));
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
        // check if the ray hits the sun
        if (dot(ray, uLightDirection) > 1.0 - sunSize) {
            fragColor = sunColor;
        }

        // otherwise hash the ray's direction and see if it hits a star
        else {
            vec4 rotatedRay = uLightDirectionMatrix * ray;

            // use a nested hash function on the ray direction
            uvec3 n = uvec3(ivec3(floor(rotatedRay.xyz * starResolution)));
            uint hash = iqint1(iqint1(iqint1(n.x) + n.y) + n.z);

            // convert the hashed value to a float between 0.0 and 1.0
            float val = float(hash) / 4294967295.0;

            // check if it passes the threshold
            if (val < starFrequency) {
                fragColor = vec4(0.5);
            }
            else {
                fragColor = vec4(0.0);
            }

            // apply atmoshpere effect
            float light = dot(ray, uLightDirection) * exp(-0.5 * leastHeight / uTerrainHeight);
            fragColor = mix(fragColor, skyColor, light);
        }
    }

    fragColor.w = 1.0;
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

        height += amplitude * noise3(pos.xyz);

        pos *= 2.0;
        pos += 0.5;

        channel += 1u;
    }

    return distance - max(height, -2.0 * minDistance);
}

// compute the color of the terrain at a point on the surface
vec4 getColor(vec4 pos, vec4 normal, vec4 ray) {
    vec4 color = vec4(0.0);

    // compute the height of the point above the surface
    float height = sdf(pos, 0u);

    // compute shading based on the surface normal and the light direction
    float shade = dot(normal, uLightDirection);

    if (height < 0.0) {
        // compute the reflected view ray for specular highlights
        float highlight = pow(max(dot(reflect(ray, normal), uLightDirection), 0.0), highlightSize);

        color = mix(seaColor, sunColor, highlight);
    }
    else {
        height /= uTerrainHeight;

        if (height < 0.025) {
            color.r = 0.8;
            color.g = 0.8;
            color.b = 0.6;
        }
        else if (height < 0.4) {
            color.g = height + 0.4;
            color.b = height + 0.4;
        }
        else {
            color.r = 0.8;
            color.g = 0.8;
            color.b = 0.8;
        }
    }

    color *= shade + ambience;

    return color;
}

// return a smooth noise value between -1.0 and 1.0
float noise3(vec3 pos) {
    uvec3 posFloor = uvec3(ivec3(floor(pos)));
    vec3 posFract = smoothstep(0.0, 1.0, fract(pos));

    // use a linear combination as the input to the hash function
    uint val = primes.x * posFloor.x + primes.y * posFloor.y + primes.z * posFloor.z + primes.w;

    // compute the eight random values to mix
    float val000 = float(iqint1(val));
    float val100 = float(iqint1(val + primes.x));

    float val010 = float(iqint1(val + primes.y));
    float val110 = float(iqint1(val + primes.x + primes.y));

    float val001 = float(iqint1(val + primes.z));
    float val101 = float(iqint1(val + primes.x + primes.z));

    float val011 = float(iqint1(val + primes.y + primes.z));
    float val111 = float(iqint1(val + primes.x + primes.y + primes.z));

    // linearly interpolate between the eight adjacent values
    float noise = mix(
        mix(
            mix(val000, val100, posFract.x),
            mix(val010, val110, posFract.x),
            posFract.y
        ),
        mix(
            mix(val001, val101, posFract.x),
            mix(val011, val111, posFract.x),
            posFract.y
        ),
        posFract.z
    );

    // scale back down to range between -1.0 and 1.0
    return noise / 2147483647.0 - 1.0;
}

// Mark Jarzynski and Marc Olano, Hash Functions for GPU Rendering, Journal of
// Computer Graphics Techniques (JCGT), vol. 9, no. 3, 21-38, 2020
// Available online http://jcgt.org/published/0009/03/02/
uint iqint1(uint n) {
    n = (n << 13) ^ n;
    n = n * (n * n * 15731u + 789221u) + 1376312589u;

    return n;
}
`;
