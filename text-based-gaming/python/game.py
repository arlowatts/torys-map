import manager as m
import filler

m.db = m.connect("base_data")
m.c = m.db.cursor()
game = True

dirs = {"n":1, "ne":2, "e":3, "se":4, "s":5, "sw":6, "w":7, "nw":8, "north":1, "northeast":2, "east":3, "southeast":4, "south":5, "southwest":6, "west":7, "northwest":8}
altDirs = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"]
passStat = ["", "open ", "closed "]
objStat = ["", "", "open ", "closed "]
tabs = ["locations", "items"]

def formatList(items, postLink = None, post = None, adj = None):
    if len(items) == 0: return "nothing"
    out = ""
    for i in range(len(items)):
        if adj and len(adj[i]):
            if adj[i][0] in ["a", "e", "i", "o", "u"]: out += "an "
            else: out += "a "
            out += adj[i]
        else:
            if items[i][0] in ["a", "e", "i", "o", "u"]: out += "an "
            else: out += "a "
        out += items[i]
        if post: out += postLink + post[i]
        if i == len(items) - 2 and len(items) == 2: out += " and "
        elif i == len(items) - 2: out += ", and "
        elif i < len(items) - 1: out += ", "
    return out

def look(loc):
    print(m.get("locations.name.id="+loc)[0][0])
    print(m.get("locations.desc.id="+loc)[0][0])
    print("There is", formatList([x[0] for x in m.get("items.name.loc="+loc)]), "here.")
    cons = [m.get("connections.type,dir1,status.loc1="+loc)+m.get("connections.type,dir2,status.loc2="+loc)][0]
    print("There is",formatList([x[0] for x in cons]," to the ",[altDirs[x[1]-1] for x in cons],[passStat[x[2]] for x in cons])+".")

def go(loc, direc):
    m.change("player.loc.id=1",\
             [m.get("connections.loc2.loc1="+loc+" and dir1="+direc+" and status<2 and size>15"),\
              m.get("connections.loc1.loc2="+loc+" and dir2="+direc+" and status<2 and size>15")])
    nLoc = str(m.get("player.loc.id=1")[0][0])
    look(nLoc)
    print("You came from the",\
          altDirs[[m.get("connections.dir1.loc1="+nLoc+" and loc2="+loc)+\
                   m.get("connections.dir2.loc2="+nLoc+" and loc1="+loc)][0][0][0]-1]+".")

def openClose(loc, changeTo):
    pass

def run(command):
    loc = str(m.get("player.loc.id=1")[0][0])
    command = command.lower().split(" ", 1)
    action = m.get("actions.effects.command='" + command[0] + "'")
    if not action or len(action) == 0:
        print("\""+command[0]+"\" is not a verb I recognize. Try using a synonym or type 'help' for a full list of actions.")
        return False
    try:
        exec(action[0][0])
        return True
    except Exception as e:
        print("You can't do that.")
        return False

print("Type 'help' for a full list of actions.")
try: run("look")
except:
    filler.reload()
    run("look")

while game:
    command = input("\n> ")
    act = run(command)
    if act: m.change("player.actCount.id=1", [[[m.get("player.actCount.id=1")[0][0] + 1]]])

m.finish()
quit()
