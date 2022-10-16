package mapping;

import javafx.scene.image.WritableImage;
import javafx.scene.image.PixelFormat;

import javafx.concurrent.Service;
import javafx.concurrent.Task;

import java.util.ArrayList;

public abstract class Map extends Service<WritableImage> {
	public static final double POWER_OF_TWO = 1 / 1.0; // The sum of the series sum(k=1,inf)(1/2^k) is 1.0
	public static final double FACTORIAL    = 1 / 1.71828; // Approximately the sum of the series sum(k=1,inf)(1/k!)
	public static final double SQUARES      = 1 / 1.64493; // Approximately the sum of the series sum(k=1,inf)(1/k^2)
	
	public static final Vector BASE_LIGHT_ANGLE = new Vector(1, 0, 0);
	
	public static final int SEA_LEVEL = 150;
	public static final int GREEN_RANGE = 120;
	public static final int SNOW_LINE = 230;
	
	private WritableImage image;
	
	private double baseAltitudeResolution, baseTemperatureResolution;
	private double altitudeNoiseType, temperatureNoiseType;
	
	private double zoom, currX, currY, currTime, sizeRatio;
	private boolean showContours;
	
	private Vector currLightAngle;
	
	private ArrayList<Vector> rotations;
	
	private ArrayList<Region> regions;
	
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
		
		currLightAngle = new Vector(BASE_LIGHT_ANGLE);
		
		regions = new ArrayList<Region>();
		
		rotations = new ArrayList<Vector>();
	}
	
	public void toImage() {
		int imgWidth = (int)image.getWidth();
		int imgHeight = (int)image.getHeight();
		
		int[] pixels = new int[imgWidth * imgHeight];
		
		for (int x = 0; x < imgWidth; x++) {
			for (int y = 0; y < imgHeight; y++) {
				if (cancelled) return;
				
				int alt = (int)(getAltitude(scaledX(x, imgWidth), scaledY(y, imgWidth)) * 255);
				
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
				
				pixels[x + y * imgWidth] = alt;
			}
		}
		
		for (int x = 0; x < imgWidth; x += 10) {
			for (int y = 0; y < imgHeight; y += 10) {
				double light = getAverageLight(scaledX(x, imgWidth), scaledY(y, imgWidth));
				light = (int)(Math.min(Math.pow(light, 5) * Math.pow(4, 5) * 10, 10)) / 10.0;
				
				int i = 0, j = 0;
				
				for (i = 0; i < 10 && x + i < imgWidth; i++) {
					for (j = 0; j < 10 && y + j < imgHeight; j++) {
						pixels[x+i + (y+j) * imgWidth] = Color.shade(pixels[x+i + (y+j) * imgWidth], light) | 0xff000000;
					}
				}
			}
		}
		
		image.getPixelWriter().setPixels(0, 0, imgWidth, imgHeight, PixelFormat.getIntArgbInstance(), pixels, 0, imgWidth);
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
	
	public abstract double getX(Vector coords);
	public abstract double getY(Vector coords);
	
	protected abstract void setSizeRatio();
	
	public ArrayList<Region> getRegions(double x, double y) {
		ArrayList<Region> localRegions = new ArrayList<Region>();
		
		for (int i = 0; i < regions.size(); i++) {
			if (regions.get(i).pointInRegion(x, y))
				localRegions.add(regions.get(i));
		}
		
		return localRegions;
	}
	
	public void addRotation(Vector axis) {
		rotations.add(axis);
		setCurrTime(currTime);
	}
	
	public Vector getRotation(int i) {
		return rotations.get(i);
	}
	
	public void removeRotation(int i) {
		rotations.remove(i);
		setCurrTime(currTime);
	}
	
	public int getNumRotations() {return rotations.size();}
	
	public void setCurrTime(double t) {
		currTime = t;
		
		Vector r = new Vector();
		currLightAngle.set(BASE_LIGHT_ANGLE);
		
		for (int i = rotations.size() - 1; i >= 0; i--) {
			r.set(rotations.get(i));
			r.z *= currTime;
			
			currLightAngle.rotate(r);
		}
	}
	
	public double scaledX(int x, int width) {return x * zoom / width + currX - 0.5 * zoom;}
	public double scaledY(int y, int width) {return y * zoom / width * sizeRatio + currY - 0.5 * zoom;}
	
	// Getters
	public WritableImage getImage() {return image;}
	
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
	
	protected Vector getCurrLightAngle() {return currLightAngle;}
	
	public ArrayList<Region> getRegions() {return regions;}
	
	// Setters
	public void setImage(WritableImage image) {this.image = image;}
	
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
	
	protected void setSizeRatio(double sizeRatio) {this.sizeRatio = sizeRatio;}
	
	public void setShowContours(boolean showContours) {this.showContours = showContours;}
	
	// Helpers
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
}
