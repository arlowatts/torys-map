export const noise = `
uvec4 PRIMES = uvec4(19, 47, 101, 131);

// return a smooth noise value between -1.0 and 1.0
float noise3(vec3 pos) {
    uvec3 posFloor = uvec3(ivec3(floor(pos)));
    vec3 posFract = smoothstep(0.0, 1.0, fract(pos));

    // use a linear combination as the input to the hash function
    uint val = PRIMES.x * posFloor.x + PRIMES.y * posFloor.y + PRIMES.z * posFloor.z + PRIMES.w;

    // compute the eight random values to mix
    float val000 = float(iqint1(val));
    float val100 = float(iqint1(val + PRIMES.x));

    float val010 = float(iqint1(val + PRIMES.y));
    float val110 = float(iqint1(val + PRIMES.x + PRIMES.y));

    float val001 = float(iqint1(val + PRIMES.z));
    float val101 = float(iqint1(val + PRIMES.x + PRIMES.z));

    float val011 = float(iqint1(val + PRIMES.y + PRIMES.z));
    float val111 = float(iqint1(val + PRIMES.x + PRIMES.y + PRIMES.z));

    // linearly interpolate between the eight adjacent values
    float noise = mix(
        mix(
            mix(val000, val100, posFract.x),
            mix(val010, val110, posFract.x),
            posFract.y
        ),
        mix(
            mix(val001, val101, posFract.x),
            mix(val011, val111, posFract.x),
            posFract.y
        ),
        posFract.z
    );

    // scale back down to range between -1.0 and 1.0
    return noise / 2147483647.0 - 1.0;
}

// Mark Jarzynski and Marc Olano, Hash Functions for GPU Rendering, Journal of
// Computer Graphics Techniques (JCGT), vol. 9, no. 3, 21-38, 2020
// Available online http://jcgt.org/published/0009/03/02/
uint iqint1(uint n) {
    n = (n << 13) ^ n;
    n = n * (n * n * 15731u + 789221u) + 1376312589u;

    return n;
}
`;
