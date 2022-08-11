import java.util.ArrayList;

import java.awt.image.BufferedImage;

public abstract class Map {
	public static final double POWER_OF_TWO = 1;
	public static final double FACTORIAL = 1 / 1.75;
	public static final double SQUARES = 1 / 1.5;
	
	public static final int SEA_LEVEL = 140;
	public static final int GREEN_RANGE = 120;
	public static final int SNOW_LINE = 190;
	
	protected double baseAltitudeResolution, baseTemperatureResolution;
	protected double altitudeNoiseType, temperatureNoiseType;
	protected double zoom, currX, currY;
	protected boolean showContours;
	
	protected ArrayList<Region> regions;
	
	public Map(double baseAltitudeResolution, double altitudeNoiseType, double baseTemperatureResolution, double temperatureNoiseType) {
		this.baseAltitudeResolution = baseAltitudeResolution;
		this.altitudeNoiseType = altitudeNoiseType;
		
		this.baseTemperatureResolution = baseTemperatureResolution;
		this.temperatureNoiseType = temperatureNoiseType;
		
		zoom = 1;
		currX = 0;
		currY = 0;
		
		showContours = false;
		
		regions = new ArrayList<Region>();
	}
	
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
				int val = (int)(getAltitude(scaledX(x, imgWidth), scaledY(y, imgHeight)) * 256);
				
				boolean edge = false;
				
				if (showContours) {
					val = (int)(val * 0.1 * zoom);
					
					for (int i = 0; i <= 1 && x + i < imgWidth; i++) {
						for (int j = 0; j <= 1 && y + j < imgHeight; j++) {
							if ((i != 0 || j != 0) && val != (int)(getAltitude(scaledX(x + i, imgWidth), scaledY(y + j, imgHeight)) * 25.6 * zoom)) {
								edge = true;
								break;
							}
						}
					}
					
					val /= 0.1 * zoom;
				}
				
				if (val >= SEA_LEVEL) {
					if (edge) val = 0;
					
					else if (val < SNOW_LINE)
						val = (((val - SEA_LEVEL) * GREEN_RANGE) / (SNOW_LINE - SEA_LEVEL) + (int)(GREEN_RANGE * 0.75)) << 8;
					
					else
						val = val | (val << 8) | (val << 16);
				}
				
				pixels[x + y * imgWidth] = val;
			}
		}
		
		image.setRGB(0, 0, imgWidth, imgHeight, pixels, 0, imgWidth);
		
		return image;
	}
	
	public double scaledX(int x, int width) {return (x % width) * zoom / width + currX;}
	public double scaledY(int y, int height) {return (y % height) * zoom / height + currY;}
	
	// Getters
	public double getBaseAltitudeResolution() {return baseAltitudeResolution;}
	public double getBaseTermperatureResolution() {return baseTemperatureResolution;}
	
	public double getAltitudeNoiseType() {return altitudeNoiseType;}
	public double getTemperatureNoiseType() {return temperatureNoiseType;}
	
	public double getZoom() {return zoom;}
	
	public double getCurrX() {return currX;}
	public double getCurrY() {return currY;}
	
	public boolean getShowContours() {return showContours;}
	
	// Setters
	public void setBaseAltitudeResolution(double baseAltitudeResolution) {this.baseAltitudeResolution = baseAltitudeResolution;}
	public void setBaseTemperatureResolution(double baseTemperatureResolution) {this.baseTemperatureResolution = baseTemperatureResolution;}
	
	public void setAltitudeNoiseType(double altitudeNoiseType) {this.altitudeNoiseType = altitudeNoiseType;}
	public void setTemperatureNoiseType(double temperatureNoiseType) {this.temperatureNoiseType = temperatureNoiseType;}
	
	public void setZoom(double zoom) {this.zoom = zoom;}
	
	public void setCurrX(double currX) {this.currX = currX;}
	public void setCurrY(double currY) {this.currY = currY;}
	public void setCurrPos(double x, double y) {
		currX = x;
		currY = y;
	}
	
	public void setShowContours(boolean showContours) {this.showContours = showContours;}
}
