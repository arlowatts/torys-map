import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.ImageIcon;
import java.awt.image.BufferedImage;

import javax.imageio.ImageIO;
import java.io.IOException;
import java.io.File;

import java.lang.Math;

public class Mapping {
	public static final int NUM_BANDS = 1;
	
	private static JFrame frame;
	private static BufferedImage image;
	private static Map map;
	
	public static void main (String[] args) {
		if (args.length == 1) {
			/* load map from file */
			System.out.println("To create a new map, enter a width and height as arguments");
			return;
		}
		else if (args.length == 2) {
			int width = Integer.parseInt(args[0]);
			int height = Integer.parseInt(args[1]);
			
			image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
			
			map = new Map(width, height, NUM_BANDS);
		}
		else {
			System.out.println("To create a new map, enter a width and height as arguments");
			return;
		}
		
		frame = new JFrame("The Heart of a Dead Star");
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.setLocationRelativeTo(null);
		frame.setVisible(true);
		
		JLabel label = new JLabel(new ImageIcon(image));
		frame.getContentPane().add(label);
		frame.pack();
		
		double R = 5.05425;
		double r = 1.31675;
		
		double resolution = 1.5;
		
		int layers = 5;
		
		double factor = 1;
		double scale = 0;
		
		double[] dimensions = {2 * (R + r), 2 * r, 2 * (R +  r)};
		
		for (int i = 0; i < layers; i++) {
			factor /= (i + 1);
			scale += factor;
		}
		
		factor = 1;
		scale = 1 / scale;
		
		for (int i = 0; i < layers; i++) {
			factor /= (i + 1);
			
			map.addNoiseLayer(0, new Noise(i, resolution * factor, factor * scale, dimensions));
		}
		
		for (int a = 0; a < map.getWidth(); a++) {
			for (int b = 0; b < map.getHeight(); b++) {
				double phi = (double)a / map.getWidth() * Math.PI * 2;
				double theta = (double)b / map.getHeight() * Math.PI * 2;
				
				double x = Math.sin(phi) * (R + Math.cos(theta) * r) + R + r;
				double y = Math.sin(theta) * r + r;
				double z = Math.cos(phi) * (R + Math.cos(theta) * r) + R + r;
				
				double val = 0;
				
				for (int i = 0; i < layers; i++) {
					val += map.getNoiseLayer(0, i).getNoise(x, y, z);
				}
				
				map.setSample(a, b, 0, (int)(val * 256));
			}
		}
		
		map.toImage(image);
		label.updateUI();
		
		try {ImageIO.write(image, "png", new File("map.png"));}
		catch (IOException e) {System.out.println(e);}
	}
}
