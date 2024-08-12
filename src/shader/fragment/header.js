export const header = `#version 300 es
precision mediump float;

vec3 getTpos(vec4 cpos);
uint iqint1(uint n);
float sdf(vec3 tpos);
vec4 getColor(vec3 tpos, vec4 normal, vec4 ray);

uniform vec4 uCameraPosition;
uniform mat4 uViewDirectionMatrix;

uniform vec4 uLightDirection;
uniform mat4 uLightDirectionMatrix;

uniform float uLargeRadius;
uniform float uSmallRadius;

uniform uint uTerrainDetail;
uniform float uTerrainSize;
uniform float uTerrainHeight;

uniform sampler2D uSamplerTerrain;
uniform sampler2D uSamplerNormal;
`;
