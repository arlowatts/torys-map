import java.util.ArrayList;

public class Location {
	public String name;
	public String description;

	public ArrayList<Item> contents;

	public Location(String name) {
		this.name = name;

		this.contents = new ArrayList<Item>();
	}

	public void addItem(Item item) {
		contents.add(item);
	}

	public Item removeItem(String name) {
		for (int i = 0; i < contents.size(); i++) {
			if (contents.get(i).name.equalsIgnoreCase(name)) return contents.remove(i);
		}
		return null;
	}

	public String getContents() {
		String out = "";

		if (contents.size() != 0) {
			for (int i = 0; i < contents.size(); i++) {
				if (i > 0) out += "\n";
				out += contents.get(i).name;
			}
		}
		else {
			out += "Nothing.";
		}

		return out;
	}

	public String toString() {
		String out = "";

		out += "\n" + name + "\n\n" + description + "\n\nThis room contains:\n" + getContents();

		return out;
	}
}