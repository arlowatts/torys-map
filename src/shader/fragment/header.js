export const header = `#version 300 es
precision mediump float;

float sdf(vec4);
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

uniform sampler2D uSampler;
`;
