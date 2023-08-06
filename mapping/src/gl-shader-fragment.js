export const fsSource = `#version 300 es
mediump float noise4(mediump vec4, uvec4, uint);
mediump float noise3(mediump vec3, uvec3, uint);
mediump float noise2(mediump vec2, uvec2, uint);
mediump float noise1(mediump float, uint, uint);
mediump float hash(uint);
mediump float lerp(mediump float, mediump float, mediump float);

uniform uvec4 uNoiseScale;

in mediump vec4 aPointPosition;

out mediump vec4 fragColor;

void main() {
    fragColor = vec4(0.0, 0.0, 0.0, noise3(aPointPosition.xyz, uNoiseScale.xyz, 0u));
}

mediump float noise4(mediump vec4 point, uvec4 scale, uint evalAt) {
    mediump float pointFloor = floor(point.w);

    evalAt = evalAt * scale.w + uint(int(pointFloor));

    return lerp(
        noise3(point.xyz, scale.xyz, evalAt),
        noise3(point.xyz, scale.xyz, evalAt + 1u),
        point.w - pointFloor
    );
}

mediump float noise3(mediump vec3 point, uvec3 scale, uint evalAt) {
    mediump float pointFloor = floor(point.z);

    evalAt = evalAt * scale.z + uint(int(pointFloor));

    return lerp(
        noise2(point.xy, scale.xy, evalAt),
        noise2(point.xy, scale.xy, evalAt + 1u),
        point.z - pointFloor
    );
}

mediump float noise2(mediump vec2 point, uvec2 scale, uint evalAt) {
    mediump float pointFloor = floor(point.y);

    evalAt = evalAt * scale.y + uint(int(pointFloor));

    return lerp(
        noise1(point.x, scale.x, evalAt),
        noise1(point.x, scale.x, evalAt + 1u),
        point.y - pointFloor
    );
}

mediump float noise1(mediump float point, uint scale, uint evalAt) {
    mediump float pointFloor = floor(point);

    evalAt = evalAt * scale + uint(int(pointFloor));

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
