import { header } from "./fragment/header.js";
import { main } from "./fragment/main.js";
import { util } from "./fragment/util.js";
import { sdf } from "./fragment/sdf.js";
import { color } from "./fragment/color.js";

export const fragmentSrc = header + main + util + sdf + color;

export const vertexSrc = `#version 300 es
in vec4 aVertexPosition;
out vec4 pointPosition;

void main() {
    gl_Position = aVertexPosition;
    pointPosition = aVertexPosition;
}
`;
