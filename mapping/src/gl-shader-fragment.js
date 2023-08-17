import { torys } from "./properties.js";

/*
Let the torus have a large radius of s and a small radius of w

Let the line be defined in cylindrical coordinates (omitting the theta
coordinate) by
L(t) = (r(t), z(t)) = (((u_x + tv_x)^2 + (u_y + tv_y)^2)^0.5, u_z + tv_z),
for 3-vectors u and v with |v| = 1

The distance between a point on the line and the circle rim of the torus is
d(t) = ((s - r(t))^2 + z(t)^2)^0.5

Then a function that is 0 at each intersection of the line with the torus is
p(t) = d(t)^2 - w^2
     = s^2 + r(t)^2 - 2sr(t) + z(t)^2 - w^2
     = s^2 - w^2 - 2s((u_x + tv_x)^2 + (u_y + tv_y)^2)^0.5 + (u_x + tv_x)^2 + (u_y + tv_y)^2 + (u_z + tv_z)^2
     = s^2 - w^2 + (u_x + tv_x)^2 + (u_y + tv_y)^2 + (u_z + tv_z)^2 - 2s((u_x + tv_x)^2 + (u_y + tv_y)^2)^0.5
     = s^2 - w^2 + |u|^2 + 2tu.v + t^2 - 2s((u_x + tv_x)^2 + (u_y + tv_y)^2)^0.5
     = s^2 - w^2 + |u|^2 + 2tu.v + t^2 - 2s(u_x^2 + u_y^2 + 2t(u_xv_x + u_yv_y) + (t^2)(v_x^2 + v_y^2))^0.5

And the derivative of that function is
p'(t)= 2u.v + 2t - s((u_x^2 + u_y^2 + 2t(u_xv_x + u_yv_y) + (t^2)(v_x^2 + v_y^2))^-0.5)(2(u_xv_x + u_yv_y) + 2t(v_x^2 + v_y^2))
     = 2(u.v + t - s((u_x^2 + u_y^2 + 2t(u_xv_x + u_yv_y) + (t^2)(v_x^2 + v_y^2))^-0.5)(u_xv_x + u_yv_y + t(v_x^2 + v_y^2)))

The idea
Use Newton's Method to try to find the points of intersection. By iterating
with p(t) and p'(t), it should converge on a solution quickly. To escape the
first intersection point at u, run the first iteration on p(t) - s^2. This
should hopefully step along the line far enough to enter the second dip.
I think this only works when the dot product between the surface normal and the
light ray is positive, but the shading already takes care of that.
*/

/*
Disregard above comment
New idea
Evaluate point on the line L at the o-values shown in screenshot 3. Find the
distance from those points to the torus. Testing only at those points should be
good enough (make sure to cap them at > 0), and even just the first two should
be enough for most cases.
See if this link works: https://www.desmos.com/calculator/8cexv4uvjr
*/

/*
Turns out this single o-value is pretty good:
o = wv[3]u[3] + (w - (v[3]^2)(u[3]^2) / w) - 2(u[1]v[1] + u[2]v[2] + u[3]v[3])
*/

export const fsSource = `#version 300 es
mediump float noise4(mediump vec4, mediump vec4, uint);
mediump float noise3(mediump vec4, mediump vec4, uint);
mediump float noise2(mediump vec4, mediump vec4, uint);
mediump float noise(mediump float, mediump float, uint);
mediump float hash(uint);
mediump float lerp(mediump float, mediump float, mediump float);

uniform mediump vec4 uLightDirection;

in mediump vec4 pointPosition;

out mediump vec4 fragColor;

void main() {
    mediump float largeRadius = float(${torys.largeRadius});

    mediump vec4 normal = normalize(pointPosition - largeRadius * normalize(vec4(pointPosition.x, 0.0, pointPosition.z, 0.0)));
    mediump float color = dot(normal, uLightDirection);

    if (color <= 0.0) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    mediump float smallRadius = float(${torys.smallRadius});

    // these values are used a few times
    mediump float pointLightY = pointPosition.y * uLightDirection.y;
    mediump float pointLightDot = dot(pointPosition, uLightDirection);

    // t is the distance along the ray of light to check for intersections
    mediump float t =
        smallRadius * pointLightY +
        smallRadius - pointLightY * pointLightY / smallRadius -
        2.0 * pointLightDot;
    
    // then evaluate the squared distance function at t and compare to the small radius squared
    if (t > 0.0) {
        mediump float distance =
            (largeRadius + smallRadius) * (largeRadius - smallRadius) +
            dot(pointPosition, pointPosition) + 2.0 * t * pointLightDot +
            t * t - 2.0 * largeRadius * sqrt(
                pointPosition.x * pointPosition.x + pointPosition.z * pointPosition.z +
                2.0 * t * (pointLightDot - pointLightY) +
                t * t * (uLightDirection.x * uLightDirection.x + uLightDirection.z * uLightDirection.z)
            );

        if (distance <= 0.0) {
            fragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
        }
    }

    mediump float surfaceValue = 0.0;
    mediump vec4 point = pointPosition;
    mediump float scaleFactor = 2.0;

    for (uint i = 0u; i < 10u; i += 1u) {
        surfaceValue += noise3(point, floor(point), i) / scaleFactor;
        point *= 2.0;
        scaleFactor *= 2.0;
    }

    fragColor = vec4(
        surfaceValue < 0.7 ? 0.0 : color * surfaceValue,
        surfaceValue < 0.6 ? 0.0 : color * surfaceValue,
        color * surfaceValue,
        1.0
    );
}

mediump float noise4(mediump vec4 point, mediump vec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0xffffu + uint(int(pointFloor.w));

    return lerp(
        noise3(point, pointFloor, evalAt),
        noise3(point, pointFloor, evalAt + 1u),
        point.w - pointFloor.w
    );
}

mediump float noise3(mediump vec4 point, mediump vec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0xffffu + uint(int(pointFloor.z));

    return lerp(
        noise2(point, pointFloor, evalAt),
        noise2(point, pointFloor, evalAt + 1u),
        point.z - pointFloor.z
    );
}

mediump float noise2(mediump vec4 point, mediump vec4 pointFloor, uint evalAt) {
    evalAt = evalAt * 0xffffu + uint(int(pointFloor.y));

    return lerp(
        noise(point.x, pointFloor.x, evalAt),
        noise(point.x, pointFloor.x, evalAt + 1u),
        point.y - pointFloor.y
    );
}

mediump float noise(mediump float point, mediump float pointFloor, uint evalAt) {
    evalAt = evalAt * 0xffffu + uint(int(pointFloor));

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
