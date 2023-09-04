import java.util.ArrayList;

public class Player {
	public String name;
	public Location location;

	public ArrayList<Item> inventory;

	public Player(String name) {
		this.name = name;

		this.location = null;

		this.inventory = new ArrayList<Item>();
	}

	public void addItem(Item item) {
		inventory.add(item);
	}

	public Item removeItem(String name) {
		for (int i = 0; i < inventory.size(); i++) {
			if (inventory.get(i).name.equalsIgnoreCase(name)) return inventory.remove(i);
		}
		return null;
	}

	public String takeItem(String name) {
		Item item = location.removeItem(name);
		if (item != null) {
			addItem(item);
			return "Taken " + name + ".";
		}
		else return "You can't do that.";
	}

	public String dropItem(String name) {
		Item item = removeItem(name);
		if (item != null) {
			location.addItem(item);
			return "Dropped " + name + ".";
		}
		else return "You can't do that.";
	}

	public String setLocation(Location newLocation) {
		location = newLocation;

		return location.toString();
	}

	public String getInventory() {
		String out = "";

		if (inventory.size() != 0) {
			for (int i = 0; i < inventory.size(); i++) {
				if (i > 0) out += "\n";
				out += inventory.get(i).name;
			}
		}
		else {
			out += "You are carrying nothing.";
		}

		return out;
	}

	public String toString() {
		String out = "";

		out += name + "\nIn:\n" + location.name + "\nCarrying:\n" + getInventory();

		return out;
	}
}