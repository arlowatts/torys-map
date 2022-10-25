from random import randint

letters = {"any" : "abcdefghijklmnopqrstuvwxyz", "vowel" : "aeiouy", "consonant" : "bcdfghjklmnpqrstvwxz", "can be followed by" : "cpst", "can follow" : "h", "must be followed by" : "q", "must follow" : "u"}
frequency = {"a":81, "b":15, "c":27, "d":43, "e":120, "f":23, "g":20, "h":59, "i":73, "j":1, "k":7, "l":40, "m":26, "n":70, "o":77, "p":18, "q":1, "r":60, "s":63, "t":91, "u":29, "v":11, "w":21, "x":2, "y":21, "z":1}

def getWord(length):
    word = getLetter(letters["any"])

    if word in letters["vowel"]:
        word += getLetter(letters["consonant"])
    else:
        word += getLetter(letters["vowel"])

    for i in range(length - 2):
        nextLetter = ""

        if word[-1] in letters["must be followed by"]:
            word += letters["must follow"]
            continue

        if word[-1] in letters["can be followed by"]:
            nextLetter += letters["can follow"]

        if (word[-1] in letters["vowel"]) != (word[-2] in letters["vowel"]):
            nextLetter += letters["any"]
        elif word[-1] in letters["vowel"] and word[-2] in letters["vowel"]:
            nextLetter += letters["consonant"]
        elif word[-1] in letters["consonant"] and word[-2] in letters["consonant"]:
            nextLetter += letters["vowel"]

        word += getLetter(nextLetter)

    return word

def getLetter(string):
    for i in range(len(string)):
        string += (frequency[string[i]] - 1) * string[i]

    return string[randint(0, len(string) - 1)]

def main():
    print("Press Enter to see a new word or q to quit")

    while input() == "":
        print(getWord(randint(4, 8)))

if __name__ == "__main__": main()
