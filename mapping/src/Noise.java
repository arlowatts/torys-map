public class Noise {
	public static double getNoise(int resolution, int x) {
		int t = x % resolution;
		
		return lerp(random(x - t), random(x - t + resolution), (double)t / resolution);
	}
	
	public static double getNoise(int resolution, int width, int x, int y) {
		double t = (double)y / resolution;
		
		return lerp(getNoise(resolution, x + (int)t * width), getNoise(resolution, x + ((int)t + 1) * width), t % 1);
	}
	
	public static double getNoise(int resolution, int width, int height, int x, int y, int z) {
		double t = (double)z / resolution;
		
		return lerp(getNoise(resolution, width, x + (int)t * height * width, y), getNoise(resolution, width, x + ((int)t + 1) * height * width, y), t % 1);
	}
	
	public static double lerp(double a, double b, double t) {
		return a + t * (b - a);
	}
	
	public static double random(long x) {
		x ^= 2747636419L;
		x *= 2654435769L;
		x ^= x >> 16;
		x *= 2654435769L;
		x ^= x >> 16;
		x *= 2654435769L;
		x = x >> 1;
		
		return (double)x / Long.MAX_VALUE + 0.5;
	}
}