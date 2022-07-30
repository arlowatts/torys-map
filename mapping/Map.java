import java.awt.image.BufferedImage;
import java.awt.image.WritableRaster;
import java.awt.image.DataBuffer;
import java.awt.Point;

public class Map {
	private WritableRaster raster;
	
	public Map(int width, int height, int numBands) {
		raster = WritableRaster.createBandedRaster(DataBuffer.TYPE_INT, width, height, numBands, new Point());
	}
	
	public BufferedImage toImage() {
		return toImage(createImage());
	}
	
	public BufferedImage toImage(BufferedImage image) {
		image.setData(raster);
		return image;
	}
	
	public BufferedImage createImage() {
		return new BufferedImage(getWidth(), getHeight(), BufferedImage.TYPE_INT_RGB);
	}
	
	public void toFile(String fileName) {
		return;
	}
	
	public int getSample(int x, int y, int band) {return raster.getSample(x, y, band);}
	
	public void setSample(int x, int y, int band, int val) {raster.setSample(x, y, band, val);}
	
	public WritableRaster getRaster() {return raster;}
	public int getWidth() {return raster.getWidth();}
	public int getHeight() {return raster.getHeight();}
}
