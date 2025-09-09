export const sdf = `
// returns the shortest distance from the pos to the scene
float sdf(vec4 pos, uint maxOctaves) {
    // compute the distance from the point to th surface of a smooth torus
    float distance = length(pos.xz) - uLargeRadius;
    distance = sqrt(distance * distance + pos.y * pos.y) - uSmallRadius;

    pos *= uTerrainSize;
    float height = 0.0;
    float amplitude = uTerrainHeight;
    vec4 posFloor;
    uint channel = 0u;

    // add octaves of terrain noise until the limit is reached or the remaining
    // octaves could not reach the point
    for (uint i = 0u; i < maxOctaves && distance - height < amplitude; i++) {
        posFloor = floor(pos);

        amplitude *= 0.5;

        height += amplitude * noise3(pos.xyz);

        pos *= 2.0;
        pos += 0.5;

        channel += 1u;
    }

    return distance - max(height, -2.0 * minDistance);
}
`;
