import javafx.application.Application;
import javafx.stage.Stage;

import javafx.scene.image.WritableImage;

import javax.imageio.ImageIO;
import java.io.IOException;
import java.io.File;

import java.lang.Math;

public class Mapping extends Application {
	private WritableImage image;
	private Map map;
	
	@Override
	public void start(Stage stage) {
		image = new WritableImage(2000, 500);
		map = new TorusMap(5.05425, 1.31675, 1.5, Map.FACTORIAL, 0.6, Map.POWER_OF_TWO);
		
		System.out.println("Running");
	}
	
	/*public static void main (String[] args) {
		if (args.length == 1) {
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
	}*/
	
	public static void main(String[] args) {
		launch();
	}
}
