import java.util.ArrayList;

import java.awt.image.BufferedImage;

public abstract class MapAbstract {
	public static final int SEA_LEVEL = 140;
	public static final int GREEN_RANGE = 150;
	public static final int SNOW_LINE = 190;
	
	protected double width, height, zoom, currX, currY;
	protected boolean showContours;
	
	protected ArrayList<Noise> terrainNoise, temperatureNoise;
	protected ArrayList<Region> regions;
	
	public abstract double getAltitude(double x, double y);
	
	public abstract double getWaterLevel(double x, double y);
	
	public abstract double getLight(double x, double y, double time);
	
	public abstract double getAverageLight(double x, double y);
	
	public abstract double getAverageLight(double x, double y, double startTime, double endTime);
	
	public abstract double getTemperature(double x, double y, double time);
	
	public abstract double getAverageTemperature(double x, double y);
	
	public abstract double getAverageTemperature(double x, double y, double startTime, double endTime);
	
	public abstract ArrayList<Region> getRegions(double x, double y);
	
	public abstract double[] getFullCoords(double x, double y);
	
	public abstract double getX(double... coords);
	
	public abstract double getY(double... coords);
	
	public BufferedImage toImage(BufferedImage image) {
		int imgWidth = image.getWidth();
		int imgHeight = image.getHeight();
		
		int[] pixels = new int[imgWidth * imgHeight];
		
		for (int x = 0; x < imgWidth; x++) {
			for (int y = 0; y < imgHeight; y++) {
				int val = (int)(getAltitude(x, y) * 256);
				
				boolean edge = false;
				
				if (showContours) {
					val /= 10;
					
					for (int i = 0; i <= 1 && x + i < imgWidth; i++) {
						for (int j = 0; j <= 1 && y + j < imgHeight; j++) {
							if ((i != 0 || j != 0) && val != (int)(getAltitude(x + i, y + j) * 25.6)) {
								edge = true;
								break;
							}
						}
					}
					
					val *= 10;
				}
				
				if (val >= SEA_LEVEL) {
					if (edge) val = 0;
					
					else if (val < SNOW_LINE)
						val = (((val - SEA_LEVEL) * GREEN_RANGE) / (SNOW_LINE - SEA_LEVEL) + GREEN_RANGE / 2) << 8;
					
					else
						val = val | (val << 8) | (val << 16);
				}
				
				pixels[x + y * imgWidth] = val;
			}
		}
		
		image.setRGB(0, 0, imgWidth, imgHeight, pixels, 0, imgWidth);
		
		return image;
	}
}
