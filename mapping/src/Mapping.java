import javafx.application.Application;
import javafx.stage.Stage;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;

import javafx.scene.image.WritableImage;
import javafx.scene.image.ImageView;

public class Mapping extends Application {
	private WritableImage image;
	private Map map;
	
	@Override
	public void start(Stage stage) {
		int imageWidth = 2000;
		int imageHeight = 750;
		
		image = new WritableImage(imageWidth, imageHeight);
		map = new TorusMap(5.05425, 1.31675, 1.5, Map.FACTORIAL, 0.6, Map.POWER_OF_TWO);
		map.setImage(image);
		
		Scene scene = new Scene(new StackPane(new ImageView(image)), imageWidth, imageHeight);
        stage.setScene(scene);
		stage.show();
		
		map.start();
	}
	
	public static void main(String[] args) {
		launch();
	}
}
