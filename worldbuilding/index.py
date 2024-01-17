import os, re

def main():
    os.chdir(os.path.dirname(__file__))

    # add the front matter
    content = "---\ntitle: Index\n---\n"

    index = {}

    read("adventures", index)
    read("guides", index)
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
        # split the file along bold indicators (two or more *)
        content = re.split("(\*\*+)", file.read())

    # index the phrases inside the bold indicators
    # every fourth element in the split file is in bold
    for i in range(2, len(content), 4):
        key = content[i].strip()
        urlKey = re.sub("[^0-9a-zA-Z]", "-", key.lower())

        if not key in index:
            index[key] = []

        link = "[" + getFileTitle(path) + "](" + path + "#" + urlKey + ")"

        if not link in index[key]:
            index[key].append(link)
            content[i] = "<a name=\"" + urlKey + "\">" + content[i] + "</a>"

    with open(path, "w") as file:
        file.write("".join(content))

# get the title from the contents of the file
# if no title is defined in the file, return the filename
def getFileTitle(path: str):
    with open(path) as file:
        for line in file:
            if line.startswith("title:"):
                return line[line.find(":") + 1 :].strip()

    return os.path.basename(path)

if __name__ == "__main__": main()
