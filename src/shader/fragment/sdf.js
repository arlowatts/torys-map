export const sdf = `
float TAU_INVERSE = 0.15915494309189535;

// returns the shortest distance from the given point to the scene
float sdf(vec4 pos) {
    float xzLong = length(pos.xz);
    float xzShort = xzLong - uLargeRadius;

    // compute the height of the point above the ring's center
    float height = sqrt(pos.y * pos.y + xzShort * xzShort);

    // compute the coordinates above the surface
    vec2 surfacePos = acos(vec2(pos.x / xzLong, pos.y / height)) * TAU_INVERSE;

    surfacePos.x *= sign(pos.z);
    surfacePos.y *= sign(xzShort);

    // sample the terrain height texture
    return height - uSmallRadius - texture(uSampler, surfacePos).x * uTerrainHeight;
}
`;
