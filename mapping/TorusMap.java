import javax.swing.JFrame;

import java.awt.image.WritableRaster;
import java.awt.image.Raster;
import java.awt.image.ComponentSampleModel;
import java.awt.image.DataBuffer;
import java.awt.Point;

public class TorusMap {
	public static final int NUM_BANDS = 1;
	
	private static JFrame frame;
	private static WritableRaster map;
	
	public static void main (String[] args) {
		if (args.length == 1) {
			/* load map from file */
			System.out.println("To create a new map, pass a width and height as arguments");
			return;
		}
		else if (args.length == 2) {
			int width = Integer.parseInt(args[0]);
			int height = Integer.parseInt(args[1]);
			
			ComponentSampleModel sample = new ComponentSampleModel(DataBuffer.TYPE_BYTE, width, height, 0, 0, new int[NUM_BANDS]);
			
			map = Raster.createWritableRaster(sample, new Point());
		}
		else {
			System.out.println("To create a new map, pass a width and height as arguments");
			return;
		}
		
		for (int x = 0; x < map.getWidth(); x++) {
			for (int y = 0; y < map.getHeight(); y++) {
				System.out.print(map.getSample(x, y, 0) + " ");
			}
			System.out.println();
		}
	}
}