export const fsSource = `#version 300 es
mediump float noise4(mediump vec4, mediump vec4, uint);
mediump float noise3(mediump vec3, mediump vec3, uint);
mediump float noise2(mediump vec2, mediump vec2, uint);
mediump float noise1(mediump float, mediump float, uint);
mediump float hash(uint);
mediump float lerp(mediump float, mediump float, mediump float);

in mediump vec4 aPointPosition;

out mediump vec4 fragColor;

void main() {
    fragColor = vec4(0.0, 0.0, 0.0, noise3(aPointPosition.xyz, floor(aPointPosition.xyz), 0u));
}

mediump float noise4(mediump vec4 point, mediump vec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0xffffu + uint(int(pointFloor.w));

    return lerp(
        noise3(point.xyz, pointFloor.xyz, evalAt),
        noise3(point.xyz, pointFloor.xyz, evalAt + 1u),
        point.w - pointFloor.w
    );
}

mediump float noise3(mediump vec3 point, mediump vec3 pointFloor, uint evalAt) {
    evalAt = evalAt * 0xffffu + uint(int(pointFloor.z));

    return lerp(
        noise2(point.xy, pointFloor.xy, evalAt),
        noise2(point.xy, pointFloor.xy, evalAt + 1u),
        point.z - pointFloor.z
    );
}

mediump float noise2(mediump vec2 point, mediump vec2 pointFloor, uint evalAt) {
    evalAt = evalAt * 0xffffu + uint(int(pointFloor.y));

    return lerp(
        noise1(point.x, pointFloor.x, evalAt),
        noise1(point.x, pointFloor.x, evalAt + 1u),
        point.y - pointFloor.y
    );
}

mediump float noise1(mediump float point, mediump float pointFloor, uint evalAt) {
    evalAt = evalAt * 0xffffu + uint(int(pointFloor));

    return lerp(
        hash(evalAt),
        hash(evalAt + 1u),
        point - pointFloor
    );
}

// returns a value between 0 and 1
mediump float hash(uint x) {
    x ^= 2747636419u;
    x *= 2654435769u;
    x ^= x >> 16u;
    x *= 2654435769u;
    x ^= x >> 16u;
    x *= 2654435769u;

    return float(x) / 4294967295.0;
}

mediump float lerp(mediump float a, mediump float b, mediump float t) {
    return a + t * (b - a);
}
`;
