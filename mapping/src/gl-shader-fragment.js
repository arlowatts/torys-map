export const fsSource = `#version 300 es
mediump float getNoise(mediump vec4, uvec4, uint);
mediump float hash(uint);
mediump float lerp(mediump float, mediump float, mediump float);

out mediump vec4 fragColor;

void main() {
    fragColor = vec4(0.0, 0.0, 0.0, getNoise(gl_FragCoord, uvec4(1250, 500, 0, 0), 0u) / 2.0);
}

mediump float getNoise(mediump vec4 point, uvec4 scale, uint evalAt) {
    point = point / 50.0;
    uvec4 pointFloor = uvec4(point);

    evalAt = evalAt * scale.y + pointFloor.y;
    evalAt = evalAt * scale.x + pointFloor.x;

    return lerp(
        lerp(hash(evalAt), hash(evalAt + 1u), point.x - float(pointFloor.x)),
        lerp(hash(evalAt + scale.x), hash(evalAt + scale.x + 1u), point.x - float(pointFloor.x)),
        point.y - float(pointFloor.y)
    );

    // return lerp(
    //     getNoise(point, scale, evalAt, dimensions),
    //     getNoise(point, scale, evalAt + 1, dimensions),
    //     point[dimensions] - pointFloor
    // );
}

// returns a value between -1 and 1
mediump float hash(uint x) {
    x ^= 2747636419u;
    x *= 2654435769u;
    x ^= x >> 16u;
    x *= 2654435769u;
    x ^= x >> 16u;
    x *= 2654435769u;

    return float(x) / 2147483647.0;
}

mediump float lerp(mediump float a, mediump float b, mediump float t) {
    return a + t * (b - a);
}
`;
