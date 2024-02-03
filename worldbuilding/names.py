import random

letters = {}

letters["vowel"] = list("aeiou")
letters["consonant"] = list("bcdfghjklmnprstvwxyz") + ["qu", "ch", "ph", "sh", "th"]
letters["any"] = letters["vowel"] + letters["consonant"]
letters["middle"] = letters["any"] + ["-", "'"]

frequency = {
    "a":81, "b":15, "c":23, "d":43, "e":120, "f":23, "g":20, "h":43, "i":73, "j":1,
    "k":7, "l":40, "m":26, "n":70, "o":77, "p":12, "r":60, "s":57, "t":84, "u":24,
    "v":11, "w":21, "x":2, "y":21, "z":1, "qu":6, "ch":8, "ph":6, "sh":10, "th":11,
    "-":21, "'":24
}

# generates a new word of approximately the given length
def getWord(length: int):
    word = [getLetter(letters["any"])]

    if word[0] in letters["vowel"]:
        word.append(getLetter(letters["consonant"]))

    else:
        word.append(getLetter(letters["vowel"]))

    for i in range(length - 2):
        if word[-1] in letters["vowel"] and word[-2] in letters["vowel"]:
            word.append(getLetter(letters["consonant"]))

        elif word[-1] in letters["consonant"] and word[-2] in letters["consonant"]:
            word.append(getLetter(letters["vowel"]))

        elif i < length - 3:
            word.append(getLetter(letters["middle"]))

        else:
            word.append(getLetter(letters["any"]))

    return "".join(word)

# returns a randomly chosen letter from the list based on each letter's frequency
def getLetter(array: []):
    sum = 0

    for char in array:
        sum += frequency[char]

    val = random.randint(1, sum)

    for char in array:
        val -= frequency[char]

        if val <= 0:
            return char

# fetches new words when prompted by the user
def main():
    print("Press Enter to get a new word or q to quit. Enter a number to get a word of roughly that length.")

    val = input()
    length = 0

    while val != "q":
        if val.isdigit():
            length = int(val)
        else:
            length = random.randint(4, 8)

        print(getWord(length))

        val = input()

if __name__ == "__main__": main()
