export const source = `#version 300 es
precision mediump float;

float hash(uint);

in vec4 pointPosition;

out vec4 fragColor;

void main() {
    float color;

    // vec4 point = normalize(pointPosition);
    vec4 point = pointPosition;

    // color = length(point) / 2.0;
    color = point.x;

    // color =
    // hash(uint(int(floor(point.x * 100.0))))
    // * hash(uint(int(floor(point.y * 100.0))))
    // * hash(uint(int(floor(point.z * 100.0))));

    // color = color > 0.9 ? 1.0 : 0.0;

    // fragColor = vec4(color, color, color, 1.0);

    fragColor = floor(point * 10.0) / 10.0;
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
