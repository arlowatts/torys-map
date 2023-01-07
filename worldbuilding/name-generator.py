import random

letters = {"any" : list("abcdefghijklmnoprstuvwxyz") + ["qu", "ch", "ph", "sh", "th"],
           "middle" : list("abcdefghijklmnoprstuvwxyz-'") + ["qu", "ch", "ph", "sh", "th"],
           "vowel" : list("aeiou"),
           "consonant" : list("bcdfghjklmnprstvwxyz") + ["qu", "ch", "ph", "sh", "th"]}

frequency = {"a":81, "b":15, "c":23, "d":43, "e":120, "f":23, "g":20, "h":43, "i":73, "j":1,
             "k":7, "l":40, "m":26, "n":70, "o":77, "p":12, "r":60, "s":57, "t":84, "u":24,
             "v":11, "w":21, "x":2, "y":21, "z":1, "qu":6, "ch":8, "ph":6, "sh":10, "th":11,
             "-":21, "'":24}

def getWord(length):
    word = [getLetter(letters["any"])]

    if word in letters["vowel"]:
        word.append(getLetter(letters["consonant"]))

    else:
        word.append(getLetter(letters["vowel"]))

    for i in range(length - 1):
        nextLetter = ""

        if word[-1] in letters["vowel"] and word[-2] in letters["vowel"]:
            word.append(getLetter(letters["consonant"]))

        elif word[-1] in letters["consonant"] and word[-2] in letters["consonant"]:
            word.append(getLetter(letters["vowel"]))

        elif i < length - 2:
            word.append(getLetter(letters["middle"]))

        else:
            word.append(getLetter(letters["any"]))

    return "".join(word)

def getLetter(array):
    string = []
    
    for i in range(len(array)):
        string += [array[i]] * frequency[array[i]]

    return random.choice(string)

def main():
    print("Press Enter to get a new word or q to quit")

    while input() == "":
        print(getWord(random.randint(4, 8)))

if __name__ == "__main__": main()
