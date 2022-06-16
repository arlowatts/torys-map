import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.ImageIcon;
import java.awt.image.BufferedImage;

import java.awt.image.WritableRaster;
import java.awt.image.Raster;
import java.awt.image.ComponentSampleModel;
import java.awt.image.DataBuffer;
import java.awt.Point;

public class Mapping {
	public static final int NUM_BANDS = 1;
	
	private static JFrame frame;
	private static BufferedImage image;
	private static Map map;
	
	public static void main (String[] args) {
		if (args.length == 1) {
			/* load map from file */
			System.out.println("To create a new map, pass a width and height as arguments");
			return;
		}
		else if (args.length == 2) {
			int width = Integer.parseInt(args[0]);
			int height = Integer.parseInt(args[1]);
			
			map = new Map(width, height, NUM_BANDS);
		}
		else {
			System.out.println("To create a new map, pass a width and height as arguments");
			return;
		}
		
		for (int y = 0; y < map.getHeight(); y++) {
			for (int x = 0; x < map.getWidth(); x++) {
				map.setSample(x, y, 0, Math.random() * 1000);
				System.out.print(map.getSample(x, y, 0) + "\t");
			}
			System.out.println();
		}
		
		image = map.toImage();
		JLabel label = new JLabel(new ImageIcon(image));
		frame.getContentPane().removeAll();
		frame.getContentPane().add(label);
		
		frame = new JFrame("The Heart of a Dead Star");
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setLocationRelativeTo(null);
		frame.setVisible(true);
	}
}
