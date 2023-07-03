package src;

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

public class MappingMain extends Application {
	private static final double ZOOM_SCROLL_SPEED = 1.0 / 10000.0;
	
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
		// Define image width and height based on the dimensions of the torus world
		int imgWidth = (int)(200.0 * (5.05425 + 1.31675));
		int imgHeight = (int)(200.0 * 1.31675);
		
		/// Create the map and the image
		img = new WritableImage(imgWidth, imgHeight);
		map = new TorusMap(5.05425, 1.31675, 1.5, Map.FACTORIAL, 0.6, Map.POWER_OF_TWO);
		map.setImage(img);
		
		// Add rotations to the map for day and year cycles
		map.addRotation(new Vector(Math.PI/7, Math.PI/2, 1.0));
		map.addRotation(new Vector(0, Math.PI/2, 1.0/365.0));
		
		// Display the image to the screen
		imgView = new ImageView(img);
		scene = new Scene(new StackPane(imgView), imgWidth, imgHeight);
        stage.setScene(scene);
		stage.show();
		
		initEventHandlers();
		
		map.start();
	}
	
	// Save the image to a fileand close the display
	@Override
	public void stop() {
		int imgWidth = (int)img.getWidth();
		int imgHeight = (int)img.getHeight();
		
		BufferedImage bufferedImg = new BufferedImage(imgWidth, imgHeight, BufferedImage.TYPE_INT_RGB);
		int[] pixels = new int[imgWidth * imgHeight];
		
		img.getPixelReader().getPixels(0, 0, imgWidth, imgHeight, PixelFormat.getIntArgbInstance(), pixels, 0, imgWidth);
		
		bufferedImg.setRGB(0, 0, imgWidth, imgHeight, pixels, 0, imgWidth);
		
		try {
			File imgOut = new File("map.png");
			ImageIO.write(bufferedImg, "png", imgOut);
		}
		catch (IOException e) {
			System.out.println("Image could not be saved.");
		}
	}
	
	// Initialise and continue to check the event handlers
	public void initEventHandlers() {
		// When the map finishes resizing or panning, this handler resets the image view
		EventHandler<WorkerStateEvent> mapAdjustHandler = new EventHandler<WorkerStateEvent>() {
			@Override
			public void handle(WorkerStateEvent e) {
				imgView.setTranslateX(0);
				imgView.setTranslateY(0);
				
				imgView.setFitWidth(img.getWidth());
				imgView.setFitHeight(img.getHeight());
			}
		};
		
		// The handler that checks for mouse press events
		// When the mouse is pressed, it cancels the map updates until the mouse is released
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
		
		// Move the image view with the mouse until the mouse is released
		EventHandler<MouseEvent> dragHandler = new EventHandler<MouseEvent>() {
			@Override
			public void handle(MouseEvent e) {
				imgView.setTranslateX(e.getSceneX() - dragStartX + imgViewPrevX);
				imgView.setTranslateY(e.getSceneY() - dragStartY + imgViewPrevY);
			}
		};
		
		// When the mouse is released, the map starts updating to the new position and zoom
		EventHandler<MouseEvent> releaseHandler = new EventHandler<MouseEvent>() {
			@Override
			public void handle(MouseEvent e) {
				map.setCurrX(map.getCurrX() + (dragStartX - e.getSceneX()) / img.getWidth() * map.getZoom());
				map.setCurrY(map.getCurrY() + (dragStartY - e.getSceneY()) / img.getWidth() * map.getSizeRatio() * map.getZoom());
				
				//map.setCurrTime(map.getCurrTime() + 0.1);
				//System.out.println(map.getCurrTime() / Math.PI / 2);
				
				map.restart();
			}
		};
		
		// Manage the zoom level of the map when the scroll wheel is used
		// When the map is zoomed, don't wait; start updating the map immediately
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