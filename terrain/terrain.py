import math, random, array

LARGE_RADIUS = 1
SMALL_RADIUS = 0.25

TEXTURE_WIDTH = 1024
TEXTURE_HEIGHT = 256

KEPLER_NEWTON_STEPS = 8

def main():
    createTexture(generateTerrain())

# generate the terrain as a list of height values
def generateTerrain():
    data = [0 for i in range(TEXTURE_HEIGHT * TEXTURE_WIDTH)]

    for i in range(10000):
        point = randomPoint()
        data[math.floor(point[0] * TEXTURE_WIDTH) + math.floor(point[1] * TEXTURE_HEIGHT) * TEXTURE_WIDTH] = 0.1

    return data

# write the terrain texture data to a file
def createTexture(data):
    # form the data into an array
    dataArray = array.array("f")
    dataArray.fromlist(data)

    # write the data to the output file
    with open("assets/textures/terrain", "wb") as file:
        dataArray.tofile(file)

# return a random uniformly distributed surface point in torus coordinates
def randomPoint():
    phi = random.random()

    theta = keplerInverse(random.random() * 2 * math.pi, SMALL_RADIUS / LARGE_RADIUS) / (2 * math.pi)
    theta = (theta + 0.25) % 1

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
