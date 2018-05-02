import json 
import csv 
import sys 

PEOPLES =  []
# id,imie,nazwisko,data_urodzin,data_smierci,plec,title,cmentarz_krotka,cmentarz_dluga,coords_lat,coords_lon,group
id = 0
imie = 1
nazwisko = 2
du = 3
ds = 4
plec = 5
title = 6
cmkr = 7
cmdl = 8
lat  = 9 
lon = 10
group = 11
json_str = ""
print("Loading peoples...")
with open(sys.argv[1] or "osoby.json", "r") as fi:
    reader = csv.reader(fi, delimiter = ",")
    result = []
    for row in reader:
        person = {}
        person["id"] = row[id]
        person["imie"] = row[imie]
        person["nazwisko"] = row[nazwisko]
        person["data_urodzin"] = row[du]
        person["data_smierci"] = row[ds]
        person["plec"] = row[plec].lower()
        person["cmentarz"] = {
            "krotka" : row[cmkr],
            "dluga"  : row[cmdl] 
        } 
        person["coords"] = [ int(row[lat]), int(row[lon]) ]
        result.append(person)
    json_str = json.dumps(dict(osoby = result), ensure_ascii=False).encode('utf8')
print("Loaded")
print()
print("Converting to json file")
with open(sys.argv[2] or "ludzie.json", "w") as fout:
    fout.write(json_str)
print("finished")
