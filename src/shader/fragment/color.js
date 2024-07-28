import { light } from "../../properties.js";

export const color = `
vec4 SEA_COLOR = vec4(${light.sea.color}, 1.0);

float LIGHT_AMBIENCE = float(${light.ambience});
float SPECULAR_HIGHLIGHT_SIZE = float(${light.highlightSize});

// compute the color of the terrain at a point on the surface
vec4 getColor(vec4 pos, vec4 normal, vec4 ray) {
    vec4 color = vec4(0.0);

    // compute the height of the point above the surface
    float height = sdf(pos);

    // compute shading based on the surface normal and the light direction
    float shade = dot(normal, uLightDirection);

    if (height < 0.0) {
        // compute the reflected view ray for specular highlights
        float highlight = pow(max(dot(reflect(ray, normal), uLightDirection), 0.0), SPECULAR_HIGHLIGHT_SIZE);

        color = mix(SEA_COLOR, SUN_COLOR, highlight);
    }
    else {
        height /= uTerrainHeight;

        if (height < 0.025) {
            color.r = 0.8;
            color.g = 0.8;
            color.b = 0.6;
        }
        else if (height < 0.4) {
            color.g = height + 0.4;
            color.b = height + 0.4;
        }
        else {
            color.r = 0.8;
            color.g = 0.8;
            color.b = 0.8;
        }
    }

    color *= shade + LIGHT_AMBIENCE;

    return color;
}
`;
