from nekrologia.db import get_db 
from json import load 
import sys 
import os 

"""
{
    "osoby" : [
    {
        "id":"tadeusz_cybulko",
        "imie":"Tadeusz",
        "nazwisko":"Cybulko",
        "data_urodzin":"22-04-1929",
        "data_smierci":"10-10-2010",
          "plec":"m",
        "title":"Prof. dr. hab. Tadeusz Cybulko",
        "cmentarz": "solacz",
        "coords":[52.438866,16.891833]
    }
    ]
}
"""

def main(fp):
    with open(fp, 'r') as json_file 
        content = load(json_file)
        db = get_db()
        query = "INSERT INTO (name, surname, )"
        for person in content['osoby']:
                     

if __name__ == "__main__":
    if len(sys.argv) == 1:
        print("USAGE: json_to_sql.py file.json")
    else:
        path = os.path.realpath(sys.argv[1])
        if os.path.exists(path):
            main(path)
    