import manager as m

def reload():
    m.makeTable("locations",("name text","desc text"))
    m.makeTable("connections",("loc1 integer","loc2 integer","dir1 integer","dir2 integer",\
                               "type text","status integer","locked integer","size integer"))

    m.makeTable("items",("name text","desc text","loc integer","locTable integer","conType integer",\
                         "locked integer","size integer","capac integer","use text"))

    m.makeTable("actions",("command text","desc text","effects text"))

    m.makeTable("player",("loc integer","actCount integer"))

    m.addRow("player", (4, 0))

    m.addRow("locations",("North of house","You are on a scrappy lawn to the north of a light gray house. There is a driveway to the west leading onto a quiet street going east-west lined with similar townhouses. The houses are built next to each other with no space in between."))
    m.addRow("locations",("South of house","You are on a scrappy lawn to the south of a light gray house. There are fences all around."))
    m.addRow("locations",("Entryway","The floor is made of wooden planks. The walls are painted light gray."))
    m.addRow("locations",("Kitchen","The floor and counter are tiled. The walls are painted pale yellow. There is a stove and an oven on the west wall."))
    m.addRow("locations",("Living room","The floor is made of wooden planks. The walls are painted pale yellow."))
    m.addRow("locations",("Bedroom","The floor is carpeted. The walls are painted light blue."))
    m.addRow("locations",("Bathroom","The floor is tiled. The walls are painted white. There is a toilet in the southwest corner and a sink in the southeast corner. There is a small shower on the west wall."))
    m.addRow("locations",("Hallway","The floor is made of wooden planks. The walls are painted pale yellow. There is a heating apparatus on the north wall."))

    m.addRow("connections", (1, 3, 5, 1, "door", 2, 0, 32))
    m.addRow("connections", (2, 8, 1, 5, "door", 2, 0, 32))
    m.addRow("connections", (3, 4, 7, 3, "doorway", 0, 1, 32))
    m.addRow("connections", (3, 5, 3, 7, "doorway", 0, 1, 32))
    m.addRow("connections", (3, 8, 5, 1, "doorway", 0, 1, 32))
    m.addRow("connections", (8, 6, 3, 7, "door", 1, 0, 32))
    m.addRow("connections", (8, 7, 7, 3, "door", 2, 0, 32))
    m.addRow("connections", (1, 4, 6, 1, "window", 2, 0, 16))
    m.addRow("connections", (1, 5, 4, 1, "window", 2, 0, 16))
    m.addRow("connections", (2, 6, 2, 5, "window", 2, 0, 16))
    m.addRow("connections", (2, 7, 8, 5, "window", 1, 0, 8))

    m.addRow("items",("table","The table is small and round. It is made of light wood and is painted green.",\
                      4, 0, 1, 1, 32, 16, ""))
    m.addRow("items",("notebook","The notebook is a pocket-sized ring notebook and is backed with green cardstock. It contains around 50 pages and has \"The Daily Eclipse\" written on it.",\
                      4, 1, 3, 0, 2, 0, ""))
    m.addRow("items",("pen","The pen is a blue ballpoint pen with \"The Daily Eclipse\" written on the side.",\
                      4, 1, 0, 1, 1, 0, ""))
    m.addRow("items",("newspaper","The paper is an issue of The Daily Eclipse, the most popular newspaper on inner rim of the planet.",\
                      4, 1, 0, 0, 4, 0, ""))
    m.addRow("items",("mug","The mug is slightly chipped around the rim and is painted with horizontal blue and orange stripes.",\
                      4, 1, 1, 1, 3, 2, ""))
    m.addRow("items",("couch","The couch is a disturbing dark yellow colour that does not match the rest of the house. It is old and musty and the cushions are all flat.",\
                      5, 0, 1, 1, 64, 32, ""))
    m.addRow("items",("coffee table","The table is low at knee-height. It is surprisingly fancy-looking for such a run-down place.",\
                      5, 0, 1, 1, 16, 8, ""))
    m.addRow("items",("atlas","The atlas shows diagrams of the planet; the planet is a ring around the small core of a long-dead star. You are on the inner rim of the ring.",\
                      5, 1, 0, 0, 4, 0, ""))
    m.addRow("items",("television","The TV is clearly quite old, being several inches thick.",\
                      5, 0, 0, 1, 16, 0, ""))
    m.addRow("items",("pair of shoes","They are comfortable-looking, well-worn, leather shoes of the sort that someone might wear to work.",\
                      3, 0, 1, 1, 8, 4, ""))
    m.addRow("items",("bed","The bed is a single-sized bed that is unusually silent.",\
                      6, 0, 1, 1, 96, 32, ""))
    m.addRow("items",("wardrobe","The wardrobe is medium-sized and the wooden doors are decorated with carvings of grapes and vine leaves.",\
                      6, 0, 2, 0, 32, 28, ""))
    m.addRow("items",("toothbrush","The toothbrush is blue with a white head. It is definitely well-used and not well-loved.",\
                      7, 0, 0, 1, 1, 0, ""))
    m.addRow("items",("bar of soap","The soap is in the form of a half-used green bar.",\
                      7, 0, 0, 1, 2, 0, ""))
    m.addRow("items",("car","The car is a pale blue sleek family car from a cheap brand. It has a dented bumper and has \"The Daily Eclipse\" printed on both sides in big white letters.",\
                      1, 0, 3, 1, 256, 96, ""))


    m.addRow("actions", ("help","",\
                         "for action in m.get('actions.command,desc.command!='+repr('help')): print('\n',action[0],' '*(15-len(action[0])),action[1])"))
    m.addRow("actions", ("quit","Saves the game state and exits the game.",\
                         "m.finish();quit()"))
    m.addRow("actions", ("restart","Resets the entire game and puts you back at the start.",\
                         "filler.reload();m.change('player.actCount.id=1',[[[-1]]]);run('look')"))
    m.addRow("actions", ("look","Prints out a simple description of the space you are in and the objects in it with you.",\
                         "look(loc)"))
    m.addRow("actions", ("go","Moves you in the desired direction if there is a large enough opening for you.",\
                         "go(loc,str(dirs[command[1]]))"))
    m.addRow("actions", ("inventory","Prints out a list of all of the items in your inventory.",\
                         "for item in m.get('items.name.loc=0'): print(item[0])"))
    m.addRow("actions", ("take","Adds a specified item to your inventory if it is nearby.",\
                         "m.change('items.loc.name='+repr(command[1])+' and loc='+loc+' and size<17',[[[0]]]);print('Taken.')"))
    m.addRow("actions", ("drop","Removes a specified item from you inventory and places it in the location you are currently in.",\
                         "m.change('items.loc.name='+repr(command[1])+' and loc=0',[[[loc]]]);print('Dropped.')"))
    m.addRow("actions", ("inspect","Prints out a more detailed description of a specified item.",\
                         "print(m.get('items.desc.name='+repr(command[1])+' and loc='+loc+' or name='+repr(command[1])+' and loc=0')[0][0])"))
    m.addRow("actions", ("open","Opens a door or window in the specified direction. Note that 'open door' will not work; you must enter the direction of the opening: 'open north'.",\
                         "spec=command[1].split(' ');m.change('connections.status.status=2 and locked=0 and loc1='+loc+' and dir1='+str(dirs[spec[0]])+' or status=2 and locked=0 and loc2='+loc+' and dir2='+str(dirs[spec[0]]),[[[1]]]);print('Opened.')"))
    m.addRow("actions", ("close","Closes a door or window in the specified direction, with the same restriction and requirements as 'open'.",\
                         "spec=command[1].split(' ');m.change('connections.status.status=1 and locked=0 and loc1='+loc+' and dir1='+str(dirs[spec[0]])+' or status=1 and locked=0 and loc2='+loc+' and dir2='+str(dirs[spec[0]]),[[[2]]]);print('Closed.')"))
    m.addRow("actions", ("use","Has an effect unique to the specified item that is being used; eating and drinking included.",\
                         "exec(m.get('items.use.name='+repr(command[1])+' and loc='+loc))"))
