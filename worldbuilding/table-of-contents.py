import os

homeDir = __file__[: __file__.rfind("/")]

def main():
    content = "---\ntitle: Table of Contents\n---\n"

    content += "\n" + read(homeDir + "/locations", 0)
    content += "\n" + read(homeDir + "/adventures", 0)
    content += "\n" + read(homeDir + "/races", 0)

    with open(homeDir + "/index.md", "w") as file:
        file.write(content)

def read(rootDir: str, depth: int):
    content = ""

    relativeDir = rootDir[len(homeDir) + 1 :]

    paths = sorted(os.listdir(rootDir))

    title = rootDir.split("/")[-1].capitalize()

    if "index.md" in paths:
        with open(rootDir + "/index.md") as file:
            for line in file:
                if line.startswith("title"):
                    title = line[line.find(":") + 1 :].strip()
                    break

        content += "  " * (depth - 1) + "- [" + title + "](" + relativeDir + "/index.md)\n"

    elif depth > 0:
        content += "  " * (depth - 1) + "- " + title + "\n"
    
    else:
        content += "### " + title + "\n\n"

    for path in paths:
        if os.path.isdir(rootDir + "/" + path):
            content += read(rootDir + "/" + path, depth + 1)

        if path != "index.md" and os.path.isfile(rootDir + "/" + path):
            title = path.capitalize()

            with open(rootDir + "/" + path) as file:
                for line in file:
                    if line.startswith("title"):
                        title = line[line.find(":") + 1 :].strip()
                        break

            content += "  " * depth + "- [" + title + "](" + relativeDir + "/" + path + ")\n"
    
    return content

if __name__ == "__main__": main()
