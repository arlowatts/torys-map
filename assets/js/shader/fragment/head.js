import { light, ray, view } from "../../properties.js";

export const head = `#version 300 es
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
int maxSteps = ${Math.round(ray.steps.max)};
float stepScale = float(${ray.steps.scale});

uvec4 primes = uvec4(19, 47, 101, 131);
`;
