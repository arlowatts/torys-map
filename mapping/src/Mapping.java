import javafx.application.Application;
import javafx.stage.Stage;
import javafx.scene.Scene;
import javafx.scene.layout.StackPane;

import javafx.event.EventHandler;
import javafx.scene.input.MouseEvent;
import javafx.scene.input.ScrollEvent;
import javafx.concurrent.WorkerStateEvent;

import javafx.scene.image.WritableImage;
import javafx.scene.image.ImageView;

import java.lang.Math;

public class Mapping extends Application {
	private static final double ZOOM_SCROLL_SPEED = 1.0 / 5000.0;
	
	private Scene scene;
	
	private WritableImage img;
	private ImageView imgView;
	private Map map;
	
	private double dragStartX = 0;
	private double dragStartY = 0;
	
	private double mapPrevX = 0;
	private double mapPrevY = 0;
	
	private double imgViewPrevX = 0;
	private double imgViewPrevY = 0;
	
	private int imgWidth = 2000;
	private int imgHeight = 500;
	
	@Override
	public void start(Stage stage) {
		img = new WritableImage(imgWidth, imgHeight);
		map = new TorusMap(5.05425, 1.31675, 1.5, Map.FACTORIAL, 0.6, Map.POWER_OF_TWO);
		map.setImage(img);
		
		imgView = new ImageView(img);
		//imgView.setPreserveRatio(true);
		
		scene = new Scene(new StackPane(imgView), imgWidth, imgHeight);
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
				map.setCurrX(map.getCurrX() + (dragStartX - e.getSceneX()) / img.getWidth() * map.getZoom());
				map.setCurrY(map.getCurrY() + (dragStartY - e.getSceneY()) / img.getWidth() * map.getSizeRatio() * map.getZoom());
				
				map.restart();
			}
		};
		
		EventHandler<WorkerStateEvent> mapAdjustHandler = new EventHandler<WorkerStateEvent>() {
			@Override
			public void handle(WorkerStateEvent e) {
				imgView.setTranslateX(0);
				imgView.setTranslateY(0);
				
				imgView.setFitWidth(imgWidth);
				imgView.setFitHeight(imgHeight);
			}
		};
		
		EventHandler<ScrollEvent> zoomHandler = new EventHandler<ScrollEvent>() {
			@Override
			public void handle(ScrollEvent e) {
				double zoomChange = Math.pow(0.5, e.getDeltaY() * e.getMultiplierY() * ZOOM_SCROLL_SPEED);
				
				map.setZoom(map.getZoom() * zoomChange);
				
				imgView.setFitWidth(imgView.getFitWidth() / zoomChange);
				imgView.setFitHeight(imgView.getFitHeight() / zoomChange);
				imgView.setTranslateX((imgView.getTranslateX() + 1) / zoomChange);
				imgView.setTranslateY((imgView.getTranslateY() + 1) / zoomChange);
				
				map.restart();
			}
		};
		
		scene.setOnMousePressed(pressHandler);
		scene.setOnMouseDragged(dragHandler);
		scene.setOnMouseReleased(releaseHandler);
		
		map.setOnSucceeded(mapAdjustHandler);
		
		scene.setOnScroll(zoomHandler);
	}
	
	public static void main(String[] args) {
		launch();
	}
}
