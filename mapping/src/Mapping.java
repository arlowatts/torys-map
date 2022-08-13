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
			
			map = new TorusMap(5.05425, 1.31675, 1.5, Map.FACTORIAL, 0.6, Map.POWER_OF_TWO);
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
		
		map.toImage(image);
		label.updateUI();
		
		try {ImageIO.write(image, "png", new File("map.png"));}
		catch (IOException e) {System.out.println(e);}
	}
}
