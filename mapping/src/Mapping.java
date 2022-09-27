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

import javafx.scene.image.PixelFormat;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import javax.imageio.ImageIO;

import java.lang.Math;

public class Mapping extends Application {
	private static final double ZOOM_SCROLL_SPEED = 1.0 / 5000.0;
	
	private Scene scene;
	
	private WritableImage img;
	private ImageView imgView;
	private Map map;
	
	private double dragStartX = 0;
	private double dragStartY = 0;
	
	private double imgViewPrevX = 0;
	private double imgViewPrevY = 0;
	
	@Override
	public void start(Stage stage) {
		int imgWidth = 500;
		int imgHeight = 500;
		
		img = new WritableImage(imgWidth, imgHeight);
		map = new TorusMap(5.05425, 1.31675, 1.5, Map.FACTORIAL, 0.6, Map.POWER_OF_TWO);
		map.setImage(img);
		
		imgView = new ImageView(img);
		
		scene = new Scene(new StackPane(imgView), imgWidth, imgHeight);
        stage.setScene(scene);
		stage.show();
		
		initEventHandlers();
		
		map.start();
	}
	
	@Override
	public void stop() {
		int imgWidth = (int)img.getWidth();
		int imgHeight = (int)img.getHeight();
		
		BufferedImage bufferedImg = new BufferedImage(imgWidth, imgHeight, BufferedImage.TYPE_INT_RGB);
		int[] pixels = new int[imgWidth * imgHeight];
		
		img.getPixelReader().getPixels(0, 0, imgWidth, imgHeight, PixelFormat.getIntArgbInstance(), pixels, 0, imgWidth);
		
		bufferedImg.setRGB(0, 0, imgWidth, imgHeight, pixels, 0, imgWidth);
		
		try {
			File imgOut = new File("C:\\Users\\Arlo\\Documents\\the-heart-of-a-dead-star\\mapping\\map.png");
			ImageIO.write(bufferedImg, "png", imgOut);
		}
		catch (IOException e) {
			System.out.println("Image could not be saved.");
		}
	}
	
	public void initEventHandlers() {
		EventHandler<WorkerStateEvent> mapAdjustHandler = new EventHandler<WorkerStateEvent>() {
			@Override
			public void handle(WorkerStateEvent e) {
				imgView.setTranslateX(0);
				imgView.setTranslateY(0);
				
				imgView.setFitWidth(img.getWidth());
				imgView.setFitHeight(img.getHeight());
			}
		};
		
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
		
		map.setOnSucceeded(mapAdjustHandler);
		
		scene.setOnMousePressed(pressHandler);
		scene.setOnMouseDragged(dragHandler);
		scene.setOnMouseReleased(releaseHandler);
		
		scene.setOnScroll(zoomHandler);
	}
	
	public static void main(String[] args) {
		launch();
	}
}
