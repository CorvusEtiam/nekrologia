from flask import Blueprint, flash, g, redirect, render_template, url_for, request, session
from nekrologia.db import get_db 


bp = Blueprint("frontend", __name__)

@bp.route('/goto')
def goto_route():
    get_cities = get_db().execute("SELECT city FROM cementary").fetchall()
    if get_cities is None:
        get_cities = []
    print(get_cities)
    return render_template("goto.html", cities = get_cities)

@bp.route('/index/<string:city>', methods = ['GET'])
def root(city):
    pl_city = unquote(city)
    get_graves_in_city = """SELECT 
        id, 
        full_name_with_title, 
        date_of_birth, 
        date_of_death,  
        cementary_id, 
        cementary_full_name, 
        cementary.city AS city FROM grave 
        INNER JOIN cementary ON cementary.id = grave.cementary_id WHERE city = ?"""
    data = db.get_db().execute(get_graves_in_city, (pl_city,)).fetchall()
    return render_template("index.html", graves = data)