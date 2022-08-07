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
		
		terrainNoise = new ArrayList<Noise>();
		temperatureNoise = new ArrayList<Noise>();
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
		return new ArrayList<Region>();
	}
	
	public double[] getFullCoords(double x, double y) {
		return new double[] {0, 0};
	}
	
	public double getX(double... coords) {
		return 0;
	}
	
	public double getY(double... coords) {
		return 0;
	}
}
