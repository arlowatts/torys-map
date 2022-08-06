import java.util.ArrayList;

import java.awt.image.BufferedImage;

public class TorusMap extends MapAbstract {
	private double largeRadius, smallRadius;
	
	public double getAltitude(double x, double y);
	
	public double getWaterLevel(double x, double y);
	
	public double getLight(double x, double y, double time);
	
	public double getAverageLight(double x, double y);
	
	public double getTemperature(double x, double y, double time);
	
	public double getAverageTemperature(double x, double y);
	
	public ArrayList<Region> getRegions(double x, double y);
	
	public double[] getFullCoords(double x, double y);
	
	public double getX(double... coords);
	
	public double getY(double... coords);
}
