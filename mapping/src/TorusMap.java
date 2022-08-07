import java.util.ArrayList;

import java.lang.Math;

import java.awt.image.BufferedImage;

public class TorusMap extends MapAbstract {
	private double largeRadius, smallRadius;
	
	public TorusMap(double R, double r) {
		largeRadius = R;
		smallRadius = r;
		
		zoom = 1;
		currX = 0;
		currY = 0;
		
		showContours = false;
		
		terrainNoise = new ArrayList<Noise>();
		temperatureNoise = new ArrayList<Noise>();
		regions = new ArrayList<Region>();
	}
	
	public double getAltitude(double x, double y) {
		double[] coords = getFullCoords(x, y);
		
		double val = 0;
		
		for (int i = 0; i < terrainNoise.size(); i++) {
			val += terrainNoise.get(i).getNoise(coords);
		}
		
		return Math.min(Math.max(val, 0), 1);
	}
	
	public double getWaterLevel(double x, double y) {
		return 0;
	}
	
	public double getLight(double x, double y, double time) {
		return 0;
	}
	
	public double getAverageLight(double x, double y) {
		return 0;
	}
	
	public double getAverageLight(double x, double y, double startTime, double endTime) {
		return 0;
	}
	
	public double getTemperature(double x, double y, double time) {
		return 0;
	}
	
	public double getAverageTemperature(double x, double y) {
		return 0;
	}
	
	public double getAverageTemperature(double x, double y, double startTime, double endTime) {
		return 0;
	}
	
	public ArrayList<Region> getRegions(double x, double y) {
		ArrayList<Region> localRegions = new ArrayList<Region>();
		
		x %= width;
		y %= height;
		
		for (int i = 0; i < regions.size(); i++) {
			if (regions.get(i).pointInRegion(x, y))
				localRegions.add(regions.get(i));
		}
		
		return localRegions;
	}
	
	public double[] getFullCoords(double x, double y) {
		double[] coords = new double[3];
		
		double phi = (double)x / width * Math.PI * 2;
		double theta = (double)y / height * Math.PI * 2;
		
		coords[0] = Math.sin(phi) * (largeRadius + Math.cos(theta) * smallRadius) + largeRadius + smallRadius;
		coords[1] = Math.sin(theta) * smallRadius + smallRadius;
		coords[2] = Math.cos(phi) * (largeRadius + Math.cos(theta) * smallRadius) + largeRadius + smallRadius;
		
		return coords;
	}
	
	public double getX(double... coords) {
		return 0;
	}
	
	public double getY(double... coords) {
		return 0;
	}
}
