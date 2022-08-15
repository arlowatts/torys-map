import javafx.application.Application;
import javafx.stage.Stage;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;

import javafx.event.EventHandler;
import javafx.scene.input.MouseEvent;
import javafx.concurrent.WorkerStateEvent;

import javafx.scene.image.WritableImage;
import javafx.scene.image.ImageView;

public class Mapping extends Application {
	private Scene scene;
	
	private WritableImage image;
	private ImageView imgView;
	private Map map;
	
	private double dragStartX = 0;
	private double dragStartY = 0;
	
	private double mapPrevX = 0;
	private double mapPrevY = 0;
	
	private double imgViewPrevX = 0;
	private double imgViewPrevY = 0;
	
	@Override
	public void start(Stage stage) {
		int imageWidth = 2000;
		int imageHeight = 500;
		
		image = new WritableImage(imageWidth, imageHeight);
		map = new TorusMap(5.05425, 1.31675, 1.5, Map.FACTORIAL, 0.6, Map.POWER_OF_TWO);
		map.setImage(image);
		
		imgView = new ImageView(image);
		
		scene = new Scene(new StackPane(imgView), imageWidth, imageHeight);
        stage.setScene(scene);
		stage.show();
		
		initEventHandlers();
		
		map.start();
	}
	
	public void initEventHandlers() {
		EventHandler<MouseEvent> pressHandler = new EventHandler<MouseEvent>() {
			@Override
			public void handle(MouseEvent e) {
				dragStartX = e.getSceneX();
				dragStartY = e.getSceneY();
				
				imgViewPrevX = imgView.getTranslateX();
				imgViewPrevY = imgView.getTranslateY();
				
				map.cancel();
			}
		};
		
		EventHandler<MouseEvent> dragHandler = new EventHandler<MouseEvent>() {
			@Override
			public void handle(MouseEvent e) {
				imgView.setTranslateX(e.getSceneX() - dragStartX + imgViewPrevX);
				imgView.setTranslateY(e.getSceneY() - dragStartY + imgViewPrevY);
			}
		};
		
		EventHandler<MouseEvent> releaseHandler = new EventHandler<MouseEvent>() {
			@Override
			public void handle(MouseEvent e) {
				map.setCurrX(map.getCurrX() + (dragStartX - e.getSceneX()) / image.getWidth());
				map.setCurrY(map.getCurrY() + (dragStartY - e.getSceneY()) / image.getWidth() * map.getSizeRatio());
				
				map.reset();
				map.start();
			}
		};
		
		EventHandler<WorkerStateEvent> mapAdjustHandler = new EventHandler<WorkerStateEvent>() {
			@Override
			public void handle(WorkerStateEvent e) {
				imgView.setTranslateX(0);
				imgView.setTranslateY(0);
			}
		};
		
		scene.setOnMousePressed(pressHandler);
		scene.setOnMouseDragged(dragHandler);
		scene.setOnMouseReleased(releaseHandler);
		
		map.setOnSucceeded(mapAdjustHandler);
	}
	
	public static void main(String[] args) {
		launch();
	}
}
