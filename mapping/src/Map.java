import javafx.scene.image.WritableImage;
import javafx.scene.image.PixelFormat;

import javafx.concurrent.Service;
import javafx.concurrent.Task;

import java.util.ArrayList;

public abstract class Map extends Service<WritableImage> {
	public static final double POWER_OF_TWO = 1 / 1.0; // The sum of the series sum(k=1,inf)(1/2^k) is 1.0
	public static final double FACTORIAL    = 1 / 1.7182818284590455; // The sum of the series sum(k=1,inf)(1/k!) is approximately 1.7182818284590455
	public static final double SQUARES      = 1 / 1.644934054103904; // The sum of the series sum(k=1,inf)(1/k^2) is approximately 1.644934054103904
	
	public static final int SEA_LEVEL = 150;
	public static final int GREEN_RANGE = 120;
	public static final int SNOW_LINE = 230;
	
	protected WritableImage image;
	
	protected double baseAltitudeResolution, baseTemperatureResolution;
	protected double altitudeNoiseType, temperatureNoiseType;
	
	protected double zoom, currX, currY;
	protected double sizeRatio;
	protected boolean showContours;
	
	protected ArrayList<Region> regions;
	
	private boolean cancelled = false;
	
	public Map(double baseAltitudeResolution, double altitudeNoiseType, double baseTemperatureResolution, double temperatureNoiseType) {
		super();
		
		this.baseAltitudeResolution = baseAltitudeResolution;
		this.altitudeNoiseType = altitudeNoiseType;
		
		this.baseTemperatureResolution = baseTemperatureResolution;
		this.temperatureNoiseType = temperatureNoiseType;
		
		zoom = 1.0;
		currX = 0.5;
		currY = 0.5;
		
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
	
	public abstract double[] getFullCoords(double x, double y);
	
	public abstract double getX(double... coords);
	public abstract double getY(double... coords);
	
	public ArrayList<Region> getRegions(double x, double y) {
		ArrayList<Region> localRegions = new ArrayList<Region>();
		
		for (int i = 0; i < regions.size(); i++) {
			if (regions.get(i).pointInRegion(x, y))
				localRegions.add(regions.get(i));
		}
		
		return localRegions;
	}
	
	public void toImage() {
		int imgWidth = (int)image.getWidth();
		int imgHeight = (int)image.getHeight();
		
		int[] pixels = new int[imgWidth * imgHeight];
		
		for (int x = 0; x < imgWidth; x++) {
			for (int y = 0; y < imgHeight; y++) {
				if (cancelled) return;
				
				int val = (int)(getAltitude(scaledX(x, imgWidth), scaledY(y, imgWidth)) * 256);
				
				boolean edge = false;
				
				if (showContours) {
					for (int i = 0; i <= 1 && x + i < imgWidth; i++) {
						for (int j = 0; j <= 1 && y + j < imgHeight; j++) {
							if ((i != 0 || j != 0) && (int)(val * 0.1 * zoom) != (int)(getAltitude(scaledX(x + i, imgWidth), scaledY(y + j, imgWidth)) * 25.6 * zoom)) {
								edge = true;
								break;
							}
						}
					}
				}
				
				if (val >= SEA_LEVEL) {
					if (edge) val = 0;
					
					else if (val < SNOW_LINE)
						val = (((val - SEA_LEVEL) * GREEN_RANGE) / (SNOW_LINE - SEA_LEVEL) + (int)(GREEN_RANGE * 0.75)) << 8;
					
					else
						val = val | (val << 8) | (val << 16);
				}
				
				pixels[x + y * imgWidth] = val | 0xff000000;
			}
		}
		
		image.getPixelWriter().setPixels(0, 0, imgWidth, imgHeight, PixelFormat.getIntArgbInstance(), pixels, 0, imgWidth);
	}
	
	protected Task<WritableImage> createTask() {
		return new Task<WritableImage>() {
			protected WritableImage call() {
				toImage();
				return image;
			}
		};
	}
	
	@Override
	protected void cancelled() {cancelled = true;}
	
	@Override
	protected void ready() {cancelled = false;}
	
	public double scaledX(int x, int width) {return x * zoom / width + currX - 0.5 * zoom;}
	public double scaledY(int y, int width) {return y * zoom / width * sizeRatio + currY - 0.5 * zoom;}
	
	// Getters
	public double getBaseAltitudeResolution() {return baseAltitudeResolution;}
	public double getBaseTermperatureResolution() {return baseTemperatureResolution;}
	
	public double getAltitudeNoiseType() {return altitudeNoiseType;}
	public double getTemperatureNoiseType() {return temperatureNoiseType;}
	
	public double getZoom() {return zoom;}
	
	public double getCurrX() {return currX;}
	public double getCurrY() {return currY;}
	
	public double getSizeRatio() {return sizeRatio;}
	
	public boolean getShowContours() {return showContours;}
	
	public WritableImage getImage() {return image;}
	
	// Setters
	public void setBaseAltitudeResolution(double baseAltitudeResolution) {this.baseAltitudeResolution = baseAltitudeResolution;}
	public void setBaseTemperatureResolution(double baseTemperatureResolution) {this.baseTemperatureResolution = baseTemperatureResolution;}
	
	public void setAltitudeNoiseType(double altitudeNoiseType) {this.altitudeNoiseType = altitudeNoiseType;}
	public void setTemperatureNoiseType(double temperatureNoiseType) {this.temperatureNoiseType = temperatureNoiseType;}
	
	public void setZoom(double zoom) {this.zoom = zoom;}
	
	public void setCurrX(double x) {currX = x;}
	public void setCurrY(double y) {currY = y;}
	public void setCurrPos(double x, double y) {
		currX = x;
		currY = y;
	}
	
	public void setShowContours(boolean showContours) {this.showContours = showContours;}
	
	public void setImage(WritableImage image) {this.image = image;}
	
	// Helpers
	protected abstract void setSizeRatio();
}
