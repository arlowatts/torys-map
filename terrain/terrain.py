import math, random, array

LARGE_RADIUS = 1
SMALL_RADIUS = 0.25

TEXTURE_WIDTH = 1024
TEXTURE_HEIGHT = 256

KEPLER_NEWTON_STEPS = 8

def main():
    createTexture()

# write the terrain texture data to a file
def createTexture():
    # generate the terrain data
    data = [math.sin(8 * math.pi * (i % TEXTURE_WIDTH) / TEXTURE_WIDTH) for i in range(TEXTURE_HEIGHT * TEXTURE_WIDTH)]

    # form the data into an array
    dataArray = array.array("f")
    dataArray.fromlist(data)

    # write the data to the output file
    with open("assets/textures/terrain", "wb") as file:
        dataArray.tofile(file)

# return a random uniformly distributed surface point in torus coordinates
def randomPoint():
    phi = random.random() * 2 * math.pi

    theta = keplerInverse(random.random() * 2 * math.pi, SMALL_RADIUS / LARGE_RADIUS)

    return (phi, theta)

# evaluate f(x) = x + a * sin(x)
def kepler(x, a):
    return x + a * math.sin(x)

# evaluate f'(x) = 1 + a * cos(x)
def keplerDerivative(x, a):
    return 1 + a * math.cos(x)

# approximate the inverse of f(x) = x + a * sin(x)
def keplerInverse(x, a):
    # compute a simple initial approximation
    value = x - a * math.sin(x)

    # improve the approximation with newton's method
    for i in range(KEPLER_NEWTON_STEPS):
        value = value - (kepler(value, a) - x) / keplerDerivative(value, a)

    return value

if __name__ == "__main__": main()
