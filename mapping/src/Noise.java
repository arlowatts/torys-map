public class Noise {
	// Starter function for the recursive function
	public static double getNoise(int channel, double resolution, double[] dimensions, double... coords) {
		return getNoise(channel, 1 / resolution, 0, dimensions.length, dimensions, coords);
	}
	
	// Recursively creates simple smooth noise for any number of dimensions
	private static double getNoise(int channel, double inverseResolution, double a, int numDimensions, double[] dimensions, double[] coords) {
		// The end condition that lerps between two random values offset by the channel
		if (--numDimensions == 0) {
			a = (a + coords[0]) * inverseResolution;
			
			long c = (long)a + randomLong(channel);
			
			return lerp(random(c), random(c + 1), a % 1);
		}
		
		// Assembles a unique coordinate (a) from the multidimensional coordinates iteratively
		double b = coords[numDimensions] * inverseResolution;
		
		double prod = 1;
		for (int i = 0; i < numDimensions; i++)
			prod *= dimensions[i] * inverseResolution;
		
		// lerps between the lower dimension noise values
		return lerp(getNoise(channel, inverseResolution, a + (int)b * prod, numDimensions, dimensions, coords),
					getNoise(channel, inverseResolution, a + ((int)b + 1) * prod, numDimensions, dimensions, coords),
					b % 1);
	}
	
	// Linear interpolation
	private static double lerp(double a, double b, double t) {
		double x = a + t * (b - a);
		return x * x * (3 - 2 * x);
	}
	
	// Random hash function
	public static long randomLong(long x) {
		x ^= 2747636419L;
		x *= 2654435769L;
		x ^= x >> 16;
		x *= 2654435769L;
		x ^= x >> 16;
		x *= 2654435769L;
		
		return x;
	}
	
	// Scales the random hash to a number between 0 and 1
	public static double random(long x) {
		return (double)(randomLong(x) >> 1) / Long.MAX_VALUE + 0.5;
	}
}
