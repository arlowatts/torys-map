// point is an iterable of floats describing the point in space at which to evaluate the noise function
// scale is an iterable describing the size of the total area in units
// dimensions is the number of dimensions (should always be the same as the length of point)
// evalAt is an internal value used for recursion (should always be 0)
// returns a value between 0 and 1
export function getNoise(point, scale, dimensions = point.length, evalAt = 0) {
    // note that the number of dimensions is decremented before it is used as an array index
    dimensions--;

    // the evalAt point represents one of the nearby corners to the point
    // it is compressed like a hash code into a single value
    evalAt = evalAt * scale[dimensions] + Math.floor(point[dimensions]);

    // if this is the last dimension, evaluate between two adjacent corners
    if (dimensions == 0) {
        return lerp(random(evalAt), random(evalAt + 1), point[0] % 1);
    }

    // otherwise recursively evaluate between two faces
    return lerp(
        getNoise(point, scale, dimensions, evalAt),
        getNoise(point, scale, dimensions, evalAt + 1),
        point[dimensions] % 1
    );
}

// output is consistent for values of x but varies greatly between nearby values
// returns a value between 0 and 1
function random(x) {
    // some bit twisting
    x = (x ^ 2747636419);
    x = (x * 2654435769);
    x = (x ^ (x >> 16));
    x = (x * 2654435769);
    x = (x ^ (x >> 16));
    x = (x * 2654435769);

    // get back to a 32-bit range
    x = (x % 0x100000000);

    // scale between 0 and 1
    return x / 0xffffffff;
}

// simple linear interpolation
function lerp(a, b, t) {
    return a + t * (b - a);
}
