export const sdf = `
// returns the shortest distance from the given point to the scene
float sdf(vec4 pos, uint maxOctaves) {
    float xzLong = length(pos.xz);
    float xzShort = xzLong - uLargeRadius;

    float height = sqrt(pos.y * pos.y + xzShort * xzShort);

    // compute the coordinates above the surface
    vec2 surfacePos = acos(vec2(pos.x / xzLong, pos.y / height)) * tauInverse;

    surfacePos.x *= sign(pos.z);
    surfacePos.y *= sign(xzShort);

    // sample the terrain height texture
    return height - uSmallRadius - texture(uSampler, surfacePos).x / 25.0;
}
`;
