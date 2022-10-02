import java.util.ArrayList;

import java.lang.Math;

public class TorusMap extends Map {
	private static final double MIN_LENGTH = 0.01;
	
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
		
		double val = 0;
		double scale = 1;
		
		for (int i = 0; scale > 0.1 * zoom && scale > 0.005; i++) {
			if (altitudeNoiseType == POWER_OF_TWO) scale *= 0.5;
			else if (altitudeNoiseType == FACTORIAL) scale /= i + 1;
			else if (altitudeNoiseType == SQUARES) scale = 1 / ((i + 1) * (i + 1));
			
			val += Noise.getNoise(i, baseAltitudeResolution * scale, spaceDimensions, c.getX(), c.getY(), c.getZ()) * scale;
		}
		
		val *= altitudeNoiseType;
		
		return Math.min(Math.max(val, 0), 1);
	}
	
	public double getWaterLevel(double x, double y) {
		return 0;
	}
	
	public double getLight(double x, double y) {
		Vector n = getNormal(x, y);
		Vector pos = getFullCoords(x, y);
		
		double dot = n.dotProduct(currLightAngle);
		
		if (dot <= 0 || march(pos, n, currLightAngle)) return 0;
		
		return dot;
	}
	
	public double getAverageLight(double x, double y) {
		return 0;
	}
	
	public double getAverageLight(double x, double y, double startTime, double endTime) {
		return 0;
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
		
		c.setX(Math.sin(phi) * (largeRadius + Math.cos(theta) * smallRadius) + largeRadius + smallRadius);
		c.setY(Math.sin(theta) * smallRadius + smallRadius);
		c.setZ(Math.cos(phi) * (largeRadius + Math.cos(theta) * smallRadius) + largeRadius + smallRadius);
		
		return c;
	}
	
	public Vector getNormal(double x, double y) {
		Vector n = new Vector();
		
		double phi = x * Math.PI * 2;
		double theta = y * Math.PI * 2;
		
		n.setX(Math.sin(phi) * Math.cos(theta));
		n.setY(Math.sin(theta));
		n.setZ(Math.cos(phi) * Math.cos(theta));
		
		n.setLength(1);
		
		return n;
	}
	
	public double getX(double... coords) {
		return 0;
	}
	
	public double getY(double... coords) {
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
		sizeRatio = (largeRadius + smallRadius) / smallRadius;
	}
	
	private boolean march(Vector pos, Vector n, Vector dir) {
		Vector v = new Vector(pos);
		v.add(n, MIN_LENGTH * 2);
		v.add(-largeRadius - smallRadius, -smallRadius, -largeRadius - smallRadius);
		
		double a = 0;
		double distance = 0;
		
		while (distance < largeRadius + smallRadius) {
			a = Math.sqrt(v.getX()*v.getX() + v.getZ()*v.getZ()) - largeRadius;
			distance = Math.sqrt(a*a + v.getY()*v.getY()) - smallRadius;
			
			if (distance < MIN_LENGTH) return true;
			
			v.add(dir, distance);
		}
		
		return false;
	}
}
