export const main = `
void main() {
    // create the ray for raymarching
    vec4 ray = pointPosition;

    // adjust and normalize the ray according to scene properties
    ray.x *= aspect;
    ray.z = cameraDistance;
    ray = uViewDirectionMatrix * ray;
    ray.w = 0.0;
    ray = normalize(ray);

    // initialize the starting point for the ray
    vec4 pos = uCameraPosition;
    float distance = sdf(pos, uTerrainDetail);
    float leastHeight = sdf(pos, 0u);
    float maxDistance = max(uLargeRadius, cameraDistance);

    // march the ray
    for (int i = 0; i < maxSteps && abs(distance) > minDistance && distance < maxDistance; i++) {
        pos += stepScale * distance * ray;
        distance = sdf(pos, uTerrainDetail);

        leastHeight = min(leastHeight, sdf(pos, 0u));
    }

    // if the ray hit the surface, compute color and shadow
    if (abs(distance) <= minDistance) {
        // compute the surface normal
        vec4 normal = vec4(
            sdf(vec4(pos.x + minDistance, pos.y, pos.z, 0.0), uTerrainDetail),
            sdf(vec4(pos.x, pos.y + minDistance, pos.z, 0.0), uTerrainDetail),
            sdf(vec4(pos.x, pos.y, pos.z + minDistance, 0.0), uTerrainDetail),
            0.0
        );

        normal -= distance;
        normal.w = 0.0;
        normal = normalize(normal);

        // compute final pixel color
        fragColor = getColor(pos, normal, ray);
    }

    // if the ray missed the surface, check for stars using the ray direction
    else {
        // check if the ray hits the sun
        if (dot(ray, uLightDirection) > 1.0 - sunSize) {
            fragColor = sunColor;
        }

        // otherwise hash the ray's direction and see if it hits a star
        else {
            vec4 rotatedRay = uLightDirectionMatrix * ray;

            // use a nested hash function on the ray direction
            uvec3 n = uvec3(ivec3(floor(rotatedRay.xyz * starResolution)));
            uint hash = iqint1(iqint1(iqint1(n.x) + n.y) + n.z);

            // convert the hashed value to a float between 0.0 and 1.0
            float val = float(hash) / 4294967295.0;

            // check if it passes the threshold
            if (val < starFrequency) {
                fragColor = vec4(0.5);
            }
            else {
                fragColor = vec4(0.0);
            }

            // apply atmoshpere effect
            float light = dot(ray, uLightDirection) * exp(-0.5 * leastHeight / uTerrainHeight);
            fragColor = mix(fragColor, skyColor, light);
        }
    }

    fragColor.w = 1.0;
}
`;
