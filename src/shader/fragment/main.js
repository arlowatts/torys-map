import { view, ray, light } from "../../properties.js";

export const main = `
float CAMERA_ASPECT_RATIO = float(${view.aspect});
float CAMERA_SCREEN_DISTANCE = float(${view.camera.distance});

float MARCH_MIN_DISTANCE = float(${ray.distance.min});
float MARCH_MAX_DISTANCE = float(${ray.distance.max});
int MARCH_MAX_STEPS = ${Math.round(ray.steps.max)};
float MARCH_STEP_SCALE = float(${ray.steps.scale});

float STAR_RESOLUTION = float(${light.star.resolution});
float STAR_FREQUENCY = float(${light.star.frequency});

vec4 SKY_COLOR = vec4(${light.sky.color}, 1.0);
float SUN_SIZE = float(${light.sun.size});
vec4 SUN_COLOR = vec4(${light.sun.color}, 1.0);

in vec4 pointPosition;
out vec4 fragColor;

void main() {
    // create and normalize the ray
    vec4 ray = pointPosition;
    ray.x *= CAMERA_ASPECT_RATIO;
    ray.z = CAMERA_SCREEN_DISTANCE;
    ray = uViewDirectionMatrix * ray;
    ray.w = 0.0;
    ray = normalize(ray);

    // initialize the starting point for the ray
    vec4 cpos = uCameraPosition;
    vec3 tpos = getTpos(cpos);

    float distance = sdf(tpos);
    float leastDistance = distance;

    // march the ray
    for (int i = 0; i < MARCH_MAX_STEPS && abs(distance) > MARCH_MIN_DISTANCE && distance < MARCH_MAX_DISTANCE; i++) {
        cpos += MARCH_STEP_SCALE * distance * ray;
        tpos = getTpos(cpos);

        distance = sdf(tpos);

        leastDistance = min(leastDistance, distance);
    }

    // if the ray hit the surface, compute color and shadow
    if (abs(distance) <= MARCH_MIN_DISTANCE) {
        // get the surface normal
        vec4 normal = texture(uSamplerNormal, tpos.xy);
        normal.w = 0.0;

        // compute final pixel color
        fragColor = getColor(tpos, normal, ray);
    }

    // if the ray missed the surface, check for stars using the ray direction
    else {
        // check if the ray hits the sun
        if (dot(ray, uLightDirection) > 1.0 - SUN_SIZE) {
            fragColor = SUN_COLOR;
        }

        // otherwise hash the ray's direction and see if it hits a star
        else {
            vec4 rotatedRay = uLightDirectionMatrix * ray;

            // use a nested hash function on the ray direction
            uvec3 n = uvec3(ivec3(floor(rotatedRay.xyz * STAR_RESOLUTION)));
            uint hash = iqint1(iqint1(iqint1(n.x) + n.y) + n.z);

            // convert the hashed value to a float between 0.0 and 1.0
            float val = float(hash) / 4294967295.0;

            // check if it passes the threshold
            if (val < STAR_FREQUENCY) {
                fragColor = vec4(0.5);
            }
            else {
                fragColor = vec4(0.0);
            }

            // apply atmoshpere effect
            float light = dot(ray, uLightDirection) * exp(-0.5 * leastDistance / uTerrainHeight);
            fragColor = mix(fragColor, SKY_COLOR, light);
        }
    }

    fragColor.w = 1.0;
}
`;
