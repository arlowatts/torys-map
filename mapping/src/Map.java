import java.awt.image.BufferedImage;
import java.awt.image.WritableRaster;
import java.awt.image.DataBuffer;
import java.awt.Point;

import javax.imageio.ImageIO;
import java.io.IOException;
import java.io.File;

import java.util.ArrayList;

public class Map {
	public static int SEA_LEVEL = 140;
	public static int GREEN_RANGE = 150;
	public static int SNOW_LINE = 190;
	
	private WritableRaster raster;
	private ArrayList<ArrayList<Noise>> noise;
	
	// Initializes the map's raster and noise layers
	public Map(int width, int height, int numBands) {
		raster = WritableRaster.createBandedRaster(DataBuffer.TYPE_INT, width, height, numBands, new Point());
		
		noise = new ArrayList<ArrayList<Noise>>();
		
		for (int i = 0; i < numBands; i++)
			noise.add(new ArrayList<Noise>());
	}
	
	// Creates a BufferedImage from the map's raster
	public BufferedImage toImage(BufferedImage image) {
		int[] pixels = new int[getWidth() * getHeight()];
		
		for (int x = 0; x < getWidth(); x++) {
			for (int y = 0; y < getHeight(); y++) {
				int val = raster.getSample(x, y, 0) / 10 * 10;
				
				boolean edge = false;
				
				for (int i = 0; i <= 1 && x + i < getWidth(); i++) {
					for (int j = 0; j <= 1 && y + j < getHeight(); j++) {
						if (val / 10 != getSample(x + i, y + j, 0) / 10) {
							edge = true;
							break;
						}
					}
				}
				
				if (val < SEA_LEVEL) {
					pixels[x + y * getWidth()] = val;
				}
				else if (val < SNOW_LINE) {
					if (edge) pixels[x + y * getWidth()] = 0;
					else pixels[x + y * getWidth()] = (((val - SEA_LEVEL) * GREEN_RANGE) / (SNOW_LINE - SEA_LEVEL) + GREEN_RANGE / 2) << 8;
				}
				else {
					if (edge) pixels[x + y * getWidth()] = 0;
					else pixels[x + y * getWidth()] = val | (val << 8) | (val << 16);
				}
			}
		}
		
		image.setRGB(0, 0, getWidth(), getHeight(), pixels, 0, getWidth());
		
		return image;
	}
	
	public BufferedImage toImage() {
		return toImage(createImage());
	}
	
	public BufferedImage createImage() {
		return new BufferedImage(getWidth(), getHeight(), BufferedImage.TYPE_INT_RGB);
	}
	
	// Writes the map to a file
	public void toFile(String fileName) {
		try {ImageIO.write(toImage(), "png", new File(fileName));}
		catch (IOException e) {System.out.println(e);}
	}
	
	public int getSample(int x, int y, int band) {return raster.getSample(x, y, band);}
	public void setSample(int x, int y, int band, int val) {raster.setSample(x, y, band, val);}
	
	public Noise getNoiseLayer(int band, int index) {return noise.get(band).get(index);}
	public void addNoiseLayer(int band, Noise layer) {noise.get(band).add(layer);}
	
	public WritableRaster getRaster() {return raster;}
	public int getWidth() {return raster.getWidth();}
	public int getHeight() {return raster.getHeight();}
}
