export const util = `
float TAU_INVERSE = 0.15915494309189535;

// computes the torus coordinates of a point given in cartesian coordinates
vec3 getTpos(vec4 cpos) {
    float radius = length(cpos.xz);
    float ringRadius = radius - uLargeRadius;

    vec3 tpos = vec3(0.0);

    // compute the distance to the ring
    tpos.z = sqrt(cpos.y * cpos.y + ringRadius * ringRadius);

    // compute the surface coordinates
    tpos.x = acos(cpos.x / radius) * sign(cpos.z) * TAU_INVERSE;
    tpos.y = acos(cpos.y / tpos.z) * sign(ringRadius) * TAU_INVERSE;

    return tpos;
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
