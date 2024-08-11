export const sdf = `
// returns the shortest distance from the given point to the scene
float sdf(vec3 tpos) {
    // sample the terrain height texture
    return tpos.z - uSmallRadius - texture(uSampler, tpos.xy).x * uTerrainHeight;
}
`;
