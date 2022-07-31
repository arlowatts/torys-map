public class Noise {
	public static double getNoise(int channel, double x) {
		return lerp(random((long)x + randomLong(channel)), random((long)x + randomLong(channel) + 1), x % 1);
	}
	
	public static double getNoise(int channel, double width, double x, double y) {
		return lerp(getNoise(channel, x + (int)y * width), getNoise(channel, x + ((int)y + 1) * width), y % 1);
	}
	
	public static double getNoise(int channel, double width, double height, double x, double y, double z) {
		return lerp(getNoise(channel, width, x + (int)z * height * width, y), getNoise(channel, width, x + ((int)z + 1) * height * width, y), z % 1);
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