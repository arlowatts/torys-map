import sqlite3

def connect(name):
    return sqlite3.connect(name)

def makeTable(name, properties):
    try: c.execute("DROP TABLE " + name)
    except: pass
    vals = ""
    for column in properties: vals += "," + column
    c.execute("CREATE TABLE {} (id integer PRIMARY KEY {});".format(name, vals))

def addRow(table, properties):
    cols = ""
    c.execute("SELECT * FROM " + table)
    for desc in c.description[1:]: cols += desc[0] + ","
    cols = cols[:-1]
    c.execute("INSERT INTO {} ({}) VALUES {}".format(table, cols, properties))

def get(command):
    try:
        com = command.split(".")
        sqlCom = "SELECT " + com[1] + " FROM " + com[0]
        if len(com) > 2: sqlCom += " WHERE " + com[2]
        vals = c.execute(sqlCom).fetchall()
        return vals
    except Exception as e: print("Get error", e)

def change(path, vals):
    try:
        path = path.split(".")
        good = False
        for val in vals:
            if val != []:
                c.execute("SELECT "+path[1]+" FROM "+path[0]+" WHERE "+path[2])
                if len(c.fetchall()): good = True
                c.execute("UPDATE "+path[0]+" SET "+path[1]+"="+str(val[0][0])+" WHERE "+path[2])
                break
    except Exception as e: print("Change error", e)
    assert good

def finish():
    db.commit()
    db.close()
