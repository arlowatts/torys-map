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
	
	protected double zoom, currX, currY, currTime;
	protected double sizeRatio;
	protected boolean showContours;
	
	protected Vector currLightAngle;
	
	protected ArrayList<Region> regions;
	
	protected ArrayList<Vector> rotationAxes;
	protected ArrayList<Double> rotationRates;
	
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
		currTime = 0.0;
		
		showContours = false;
		
		currLightAngle = new Vector(1, 0, 0);
		
		regions = new ArrayList<Region>();
		
		rotationAxes = new ArrayList<Vector>();
		rotationRates = new ArrayList<Double>();
	}
	
	public abstract double getAltitude(double x, double y);
	public abstract double getWaterLevel(double x, double y);
	
	public abstract double getLight(double x, double y);
	public abstract double getAverageLight(double x, double y);
	public abstract double getAverageLight(double x, double y, double startTime, double endTime);
	
	public abstract double getTemperature(double x, double y);
	public abstract double getAverageTemperature(double x, double y);
	public abstract double getAverageTemperature(double x, double y, double startTime, double endTime);
	
	public abstract Vector getFullCoords(double x, double y);
	public abstract Vector getNormal(double x, double y);
	
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
				
				int alt = (int)(getAltitude(scaledX(x, imgWidth), scaledY(y, imgWidth)) * 256);
				double light = getLight(scaledX(x, imgWidth), scaledY(y, imgWidth)) * 0.85 + 0.15;
				
				boolean edge = false;
				
				if (showContours) {
					for (int i = 0; i <= 1 && x + i < imgWidth; i++) {
						for (int j = 0; j <= 1 && y + j < imgHeight; j++) {
							if ((i != 0 || j != 0) && (int)(alt * 0.1 * zoom) != (int)(getAltitude(scaledX(x + i, imgWidth), scaledY(y + j, imgWidth)) * 25.6 * zoom)) {
								edge = true;
								break;
							}
						}
					}
				}
				
				if (alt >= SEA_LEVEL) {
					if (edge) alt = 0;
					
					else if (alt < SNOW_LINE)
						alt = (((alt - SEA_LEVEL) * GREEN_RANGE) / (SNOW_LINE - SEA_LEVEL) + (int)(GREEN_RANGE * 0.75)) << 8;
					
					else
						alt = alt | (alt << 8) | (alt << 16);
				}
				
				pixels[x + y * imgWidth] = Color.shade(alt, light) | 0xff000000;
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
	
	public int addRotation(Vector axis, double rate) {
		rotationAxes.add(axis);
		rotationRates.add(rate);
		
		return rotationAxes.size();
	}
	
	public Vector getRotationAxis(int i) {
		return rotationAxes.get(i);
	}
	
	public double getRotationRate(int i) {
		return rotationRates.get(i);
	}
	
	public int removeRotation(int i) {
		rotationAxes.remove(i);
		rotationRates.remove(i);
		
		return rotationAxes.size();
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
	
	public double getCurrTime() {return currTime;}
	
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
	
	public void setCurrTime(double t) {
		currTime = t;
		
		Vector r = new Vector();
		currLightAngle.set(1, 0, 0);
		
		for (int i = 0; i < rotationAxes.size(); i++) {
			r.set(rotationAxes.get(i));
			r.multiply(currTime);
			
			currLightAngle.rotate(r);
		}
	}
	
	public void setShowContours(boolean showContours) {this.showContours = showContours;}
	
	public void setImage(WritableImage image) {this.image = image;}
	
	// Helpers
	protected abstract void setSizeRatio();
}
