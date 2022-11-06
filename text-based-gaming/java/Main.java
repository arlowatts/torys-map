import java.util.ArrayList;
import java.util.Scanner;

public class Main {
	public static String HELP = "\n quit: Saves your progress and quits the game."
							+ "\n\n inventory: Displays all of the items in your inventory."
							+ "\n\n look: Prints a description of your location and nearby objects."
							+ "\n\n take [item]: Adds the named item to your inventory, if possible."
							+ "\n\n drop [item]: Removes the named item from your inventory."
							+ "\n\n go [direction]: Moves you in the named direction, if possible.";
	
	public static ArrayList<Location> locations;
	public static ArrayList<Item> items;
	
	public static Player player;
	
	public static Scanner scanner;
	public static String[] input;
	
	public static void main(String[] args) {
		init();
		
		do {
			input = scanner.nextLine().toLowerCase().split(" ");
			System.out.println(parse(input) + "\n");
		} while (!input[0].equals("quit"));
	}
	
	public static String parse(String[] input) {
		switch (input[0]) {
			case "quit":		return "Quitting the game...";
			case "help":		return HELP;
			case "inventory":	return player.getInventory();
			case "look":		return player.location.toString();
			case "take":		if (input.length > 1) return player.takeItem(input[1]); break;
			case "drop":		if (input.length > 1) return player.dropItem(input[1]); break;
			case "go":			if (input.length > 1) return null; break;
		}
		
		return "Unrecognized command. Type 'help' for a list of basic commands";
	}
	
	public static void init() {
		scanner = new Scanner(System.in);
		
		locations = new ArrayList<Location>();
		items = new ArrayList<Item>();
		
		player = new Player("Arlo");
		
		locations.add(new Location("Bedroom"));
		
		items.add(new Item("Mouse"));
		items.add(new Item("Glass"));
		
		locations.get(0).addItem(items.get(0));
		locations.get(0).addItem(items.get(1));
		
		System.out.println(player.setLocation(locations.get(0)) + "\n");
	}
}