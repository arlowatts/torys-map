import { head } from "./fragment/head.js";
import { main } from "./fragment/main.js";
import { sdf } from "./fragment/sdf.js";
import { color } from "./fragment/color.js";
import { noise } from "./fragment/noise.js";

export const fragmentSrc = head + main + sdf + color + noise;

export const vertexSrc = `#version 300 es
in vec4 aVertexPosition;
out vec4 pointPosition;

void main() {
    gl_Position = aVertexPosition;
    pointPosition = aVertexPosition;
}
`;
