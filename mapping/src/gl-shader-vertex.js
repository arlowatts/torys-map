export const vsSource = `#version 300 es
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

in vec4 aVertexPosition;

out vec4 aPointPosition;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
}
`;
