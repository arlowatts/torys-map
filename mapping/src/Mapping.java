import javax.swing.JFrame;
import javax.swing.JLabel;
import javax.swing.ImageIcon;
import java.awt.image.BufferedImage;

import java.lang.Math;

import javax.imageio.ImageIO;
import java.io.IOException;
import java.io.File;

public class Mapping {
	public static final int NUM_BANDS = 3;
	
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
		
		image = map.toImage();
		JLabel label = new JLabel(new ImageIcon(image));
		frame.getContentPane().add(label);
		frame.pack();
		
		int R = 100;
		int r = 50;
		
		for (int a = 0; a < map.getWidth(); a++) {
			for (int b = 0; b < map.getHeight(); b++) {
				double phi = (double)a / map.getWidth() * Math.PI * 2;
				double theta = (double)b / map.getHeight() * Math.PI * 2;
				
				int x = (int)(Math.sin(phi) * (R - Math.cos(theta) * r)) + R + r;
				int y = (int)(Math.sin(theta) * r) + r;
				int z = (int)(Math.cos(phi) * (R - Math.cos(theta) * r)) + R + r;
				
				map.setSample(a, b, 0, (int)(Noise.getNoise(0, map.getWidth(), map.getHeight(), x / 25.0, y / 25.0, z / 25.0) * 256));
			}
		}
		
		/*double angleResolution = 1.0 / 25;
		double lengthResolution = 1.0 / 5;
		double lengthRange = 0;
		double colorResolution = 1.0 / 50;
		
		while (true) {
			for (int x = 0; x < map.getWidth(); x++) {
				for (int y = 0; y < map.getHeight(); y++) {
					for (int i = 0; i < 3; i++) {
						double theta = Noise.getNoise(0, map.getWidth() * angleResolution, x * angleResolution, y * angleResolution) * Math.PI * 2;
						double r = Noise.getNoise(0, map.getWidth() * lengthResolution, x * lengthResolution, y * lengthResolution) * lengthRange;
						
						double a = x * colorResolution + Math.sin(theta) * r + map.getWidth();
						double b = y * colorResolution + Math.cos(theta) * r + map.getHeight();
						
						map.setSample(x, y, i, (int)(Noise.getNoise(i, map.getWidth() * colorResolution, a, b) * 256));
					}
				}
			}
			
			map.toImage(image);
			label.updateUI();
			
			lengthRange += 0.25;
		}*/
		
		map.toImage(image);
		label.updateUI();
		
		try {ImageIO.write(image, "png", new File("noise.png"));}
		catch (IOException e) {System.out.println(e);}
	}
}
