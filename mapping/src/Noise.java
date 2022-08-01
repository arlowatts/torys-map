public class Noise {
	public static double getNoise(int channel, double resolution, double x) {
		return lerp(random((long)(x / resolution) + randomLong(channel)),
					random((long)(x / resolution) + randomLong(channel) + 1),
					x / resolution % 1);
	}
	
	public static double getNoise(int channel, double resolution, double width, double x, double y) {
		return lerp(getNoise(channel, resolution, x + (int)(y / resolution) * width),
					getNoise(channel, resolution, x + ((int)(y / resolution) + 1) * width),
					y / resolution % 1);
	}
	
	public static double getNoise(int channel, double resolution, double width, double height, double x, double y, double z) {
		return lerp(getNoise(channel, resolution, width, x + (int)(z / resolution) * height * width, y),
					getNoise(channel, resolution, width, x + ((int)(z / resolution) + 1) * height * width, y),
					z / resolution % 1);
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