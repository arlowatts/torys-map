import os

def main():
    os.chdir(os.path.dirname(__file__))

    # add the front matter
    content = "---\ntitle: Index\n---\n"

    index = {}

    read("adventures", index)
    read("locations", index)
    read("races", index)

    letter = "@"

    # add each key to the output in alphabetical order
    for key in sorted(index):
        # track the alphabetical letter to add helpful headers
        if key[0] > letter:
            letter = key[0]
            content += "\n## " + letter + "\n\n"

        content += "- " + key + "\n"

        for entry in sorted(index[key]):
            content += "  - " + entry + "\n"

    with open("index.md", "w") as file:
        file.write(content)

# recursively search files in the given directory
def read(dirname: str, index: dict):
    for subpath in os.listdir(dirname):
        path = os.path.join(dirname, subpath)

        if os.path.isdir(path):
            read(path, index)

        if os.path.isfile(path):
            getFileEntries(path, index)

# get the index entries for this path and add them to the given dict
def getFileEntries(path: str, index: dict):
    with open(path) as file:
        # split the file along bold indicators
        content = file.read().split("**")

    # every other part of the split file is inside the bold indicators
    for i in range(1, len(content), 2):
        key = content[i].strip()

        if not key in index:
            index[key] = []

        link = "[" + getFileTitle(path) + "](" + path + ")"

        if not link in index[key]:
            index[key].append(link)

# get the title from the contents of the file
# if no title is defined in the file, return the filename
def getFileTitle(path: str):
    with open(path) as file:
        for line in file:
            if line.startswith("title:"):
                return line[line.find(":") + 1 :].strip()

    return os.path.basename(path)

if __name__ == "__main__": main()
