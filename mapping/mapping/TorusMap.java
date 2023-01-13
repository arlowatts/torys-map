package mapping;

import java.util.ArrayList;

import java.lang.Math;

public class TorusMap extends Map {
	private static final double MIN_LENGTH = 0.01;
	private static final int DEFAULT_AVG_LIGHT_PRECISION = 1000;
	
	private double largeRadius, smallRadius;
	private double[] spaceDimensions;
	
	public TorusMap(double R, double r, double baseAltitudeResolution, double altitudeNoiseType, double baseTemperatureResolution, double temperatureNoiseType) {
		super(baseAltitudeResolution, altitudeNoiseType, baseTemperatureResolution, temperatureNoiseType);
		
		largeRadius = R;
		smallRadius = r;
		
		setSizeRatio();
		
		spaceDimensions = new double[] {2 * (R + r), 2 * r, 2 * (R + r)};
	}
	
	public double getAltitude(double x, double y) {
		Vector c = getFullCoords(x, y);
		
		//if (Math.abs(c.y - smallRadius) > smallRadius * 0.99) return 1;
		//if ((c.x-largeRadius-smallRadius)*(c.x-largeRadius-smallRadius) + (c.y-smallRadius)*(c.y-smallRadius) < 0.05) return 1;
		
		double val = 0;
		double scale = 1;
		double zoom = getZoom();
		
		for (int i = 0; scale > 0.1 * zoom && scale > 0.005; i++) {
			if (getAltitudeNoiseType() == POWER_OF_TWO) scale *= 0.5;
			else if (getAltitudeNoiseType() == FACTORIAL) scale /= i + 1;
			else if (getAltitudeNoiseType() == SQUARES) scale = 1 / ((i + 1) * (i + 1));
			
			val += Noise.getNoise(i, getBaseAltitudeResolution() * scale, spaceDimensions, c.x, c.y, c.z) * scale;
		}
		
		val *= getAltitudeNoiseType();
		
		return Math.min(Math.max(val, 0), 1);
	}
	
	public double getWaterLevel(double x, double y) {
		return 0;
	}
	
	private double getLight(double x, double y, Vector n) {
		double dot = n.dotProduct(getCurrLightAngle());
		
		if (dot <= 0 || march(getFullCoords(x, y), n, getCurrLightAngle())) return 0;
		
		return dot;
	}
	
	public double getLight(double x, double y) {
		Vector n = getNormal(x, y);
		return getLight(x, y, n);
	}
	
	public double getAverageLight(double x, double y) {
		double time = 0;
		
		for (int i = 0; i < getNumRotations(); i++) {
			time = Math.max(time, Math.abs(1 / getRotation(i).z));
		}
		
		return getAverageLight(x, y, 0, Math.PI * 2 * time);
	}
	
	public double getAverageLight(double x, double y, double startTime, double endTime) {
		setCurrTime(startTime);
		
		Vector n = getNormal(x, y);
		
		double stepSize = (endTime - startTime) / (double)(DEFAULT_AVG_LIGHT_PRECISION - 1);
		
		double light = 0;
		
		for (int i = 0; i < DEFAULT_AVG_LIGHT_PRECISION; i++) {
			light += getLight(x, y, n);
			setCurrTime(getCurrTime() + stepSize);
		}
		
		return light / DEFAULT_AVG_LIGHT_PRECISION;
	}
	
	public double getTemperature(double x, double y) {
		return 0;
	}
	
	public double getAverageTemperature(double x, double y) {
		return 0;
	}
	
	public double getAverageTemperature(double x, double y, double startTime, double endTime) {
		return 0;
	}
	
	public Vector getFullCoords(double x, double y) {
		Vector c = new Vector();
		
		double phi = x * Math.PI * 2;
		double theta = y * Math.PI * 2;
		
		c.x = Math.sin(phi) * (largeRadius + Math.cos(theta) * smallRadius) + largeRadius + smallRadius;
		c.y = Math.sin(theta) * smallRadius + smallRadius;
		c.z = Math.cos(phi) * (largeRadius + Math.cos(theta) * smallRadius) + largeRadius + smallRadius;
		
		return c;
	}
	
	public Vector getNormal(double x, double y) {
		Vector n = new Vector();
		
		double phi = x * Math.PI * 2;
		double theta = y * Math.PI * 2;
		
		n.x = Math.sin(phi) * Math.cos(theta);
		n.y = Math.sin(theta);
		n.z = Math.cos(phi) * Math.cos(theta);
		
		n.setLength(1);
		
		return n;
	}
	
	public double getX(Vector coords) {
		return 0;
	}
	
	public double getY(Vector coords) {
		return 0;
	}
	
	// Getters
	public double getLargeRadius() {return largeRadius;}
	public double getSmallRadius() {return smallRadius;}
	
	// Setters
	public void setLargeRadius(double R) {
		largeRadius = R;
		setSizeRatio();
	}
	
	public void setSmallRadius(double r) {
		smallRadius = r;
		setSizeRatio();
	}
	
	// Helpers
	protected void setSizeRatio() {
		setSizeRatio((largeRadius + smallRadius) / smallRadius);
	}
	
	private boolean march(Vector pos, Vector n, Vector dir) {
		Vector v = new Vector(pos);
		v.add(n, MIN_LENGTH * 2);
		v.add(-largeRadius - smallRadius, -smallRadius, -largeRadius - smallRadius);
		
		double a = 0;
		double distance = 0;
		
		while (distance < largeRadius + smallRadius) {
			a = Math.sqrt(v.x*v.x + v.z*v.z) - largeRadius;
			distance = Math.sqrt(a*a + v.y*v.y) - smallRadius;
			
			if (distance < MIN_LENGTH) return true;
			
			v.add(dir, distance);
		}
		
		return false;
	}
}
