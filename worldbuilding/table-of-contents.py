import os

def main():
    os.chdir(os.path.dirname(__file__))

    # add the front matter
    content = "---\ntitle: Table of Contents\n---\n"

    content += read("adventures")
    content += read("locations")
    content += read("races")

    with open("table-of-contents.md", "w") as file:
        file.write(content)

# recursively list files in the given directory
def read(dirname: str, depth: int = 0):
    paths = sorted(os.listdir(dirname))

    content = getDirEntry(dirname, depth)

    for subpath in paths:
        path = os.path.join(dirname, subpath)

        if os.path.isdir(path):
            content += read(path, depth + 1)

        if os.path.isfile(path) and os.path.basename(path) != "index.md":
            content += getFileEntry(path, depth + 1)

    return content

# get the table of contents line for this path, given the recursion depth
def getDirEntry(path: str, depth: int = 0):
    if depth <= 0:
        return "\n## " + getDirTitle(path) + "\n\n"

    indexPath = os.path.join(path, "index.md")
    if os.path.isfile(indexPath):
        return getFileEntry(indexPath, depth)

    return "  " * (depth - 1) + "- " + getDirTitle(path) + "\n"

# get the table of contents line for this path, given the recursion depth
def getFileEntry(path: str, depth: int = 0):
    return "  " * (depth - 1) + "- [" + getFileTitle(path) + "](" + path + ")\n"

# get the title from the contents or name of the directory
# if the directory contains index.md, the title will be inherited from it
# otherwise the name of the directory is capitalized and returned
def getDirTitle(path: str):
    return os.path.basename(path).capitalize()

# get the title from the contents of the file
# if no title is defined in the file, return the filename
def getFileTitle(path: str):
    with open(path) as file:
        for line in file:
            if line.startswith("title:"):
                return line[line.find(":") + 1 :].strip()

    return os.path.basename(path)

if __name__ == "__main__": main()
