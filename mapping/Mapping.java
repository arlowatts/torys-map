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
		
		int R = 1000;
		int r = 400;
		
		for (int phi = 0; phi < map.getWidth(); phi++) {
			for (int theta = 0; theta < map.getHeight(); theta++) {
				int x = (int)(Math.sin((double)phi / map.getWidth() * Math.PI) * (R + Math.cos((double)theta / map.getHeight() * Math.PI) * r)) + R + r;
				int y = (int)(Math.cos((double)theta / map.getHeight() * Math.PI) * r) + r;
				int z = (int)(Math.cos((double)phi / map.getWidth() * Math.PI) * (R + Math.cos((double)theta / map.getHeight() * Math.PI) * r)) + R + r;
				
				map.setSample(phi, theta, 0, (int)(Noise.getNoise(20, map.getWidth(), map.getHeight(), x, y, z) * 256));
			}
		}
		
		map.toImage(image);
		label.updateUI();
		
		try {ImageIO.write(image, "png", new File("torus_texture.png"));}
		catch (IOException e) {System.out.println(e);}
	}
}
