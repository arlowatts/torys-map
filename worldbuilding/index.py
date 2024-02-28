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

        for path in sorted(index[key]):
            title = getFileTitle(path)

            if title in index[key][path]:
                content += "  - " + index[key][path][title] + "\n"
                del index[key][path][title]
            else:
                content += "  - " + title + "\n"

            for title in index[key][path]:
                content += "    - " + index[key][path][title] + "\n"

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
        content = re.split("\*\*+", file.read())

    headerTitle = getFileTitle(path)
    urlKey = ""

    # index the phrases inside the bold indicators, which are all odd-indexed
    # also track the last seen header in urlKey for jumplinking
    for i in range(len(content)):
        # if the current phrase is bolded, index it
        if (i % 2 != 0):
            key = content[i].strip()

            # add the phrase to the index if it isn't there already
            if not key in index:
                index[key] = {}

            # add the current path to the phrase if it isn't there already
            if not path in index[key]:
                index[key][path] = {}

            # assemble the jumplink to the current location
            link = "[" + headerTitle + "](" + path + urlKey + ")"

            if not link in index[key][path]:
                index[key][path][headerTitle] = link

        # otherwise, check the phrase for the latest title
        else:
            titleIndex = content[i].rfind("# ")

            # if a title is found, get the name of the title and format it
            if (titleIndex > 0):
                headerTitle = content[i][titleIndex + 1 : content[i].find("\n", titleIndex)].strip()
                urlKey = "#" + re.sub("[^0-9a-zA-Z\-]", "", re.sub(" ", "-", headerTitle.lower()))

# get the title from the contents of the file
# if no title is defined in the file, return the filename
def getFileTitle(path: str):
    with open(path) as file:
        for line in file:
            if line.startswith("title:"):
                return line[line.find(":") + 1 :].strip()

    return os.path.basename(path)

if __name__ == "__main__": main()
