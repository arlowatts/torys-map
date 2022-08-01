public class Noise {
	private int channel, numDimensions;
	private double resolution, scale;
	private double[] dimensions;
	
	public Noise(int channel, double resolution, double scale, double[] dimensions) {
		this.channel = channel;
		this.resolution = resolution;
		this.scale = scale;
		this.numDimensions = dimensions.length;
		this.dimensions = new double[numDimensions];
		
		for (int i = 0; i < numDimensions; i++) {
			this.dimensions[i] = dimensions[i] / resolution;
		}
	}
	
	public double getNoise(double... coords) {
		return getNoise(0, numDimensions, coords) * scale;
	}
	
	private double getNoise(double a, int numDimensions, double[] coords) {
		if (--numDimensions == 0) {
			a = (a + coords[0]) / resolution;
			
			long c = (long)a + randomLong(channel);
			
			return lerp(random(c), random(c + 1), a % 1);
		}
		
		double b = coords[numDimensions] / resolution;
		
		double prod = 1;
		for (int i = 0; i < numDimensions; i++)
			prod *= dimensions[i];
		
		return lerp(getNoise(a + (int)b * prod, numDimensions, coords),
					getNoise(a + ((int)b + 1) * prod, numDimensions, coords),
					b % 1);
	}
	
	public static double lerp(double a, double b, double t) {
		return a + t * (b - a);
	}
	
	public static long randomLong(long x) {
		x ^= 2747636419L;
		x *= 2654435769L;
		x ^= x >> 16;
		x *= 2654435769L;
		x ^= x >> 16;
		x *= 2654435769L;
		
		return x;
	}
	
	public static double random(long x) {
		return (double)(randomLong(x) >> 1) / Long.MAX_VALUE + 0.5;
	}
}
