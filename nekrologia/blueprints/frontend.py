from flask import Blueprint, flash, g, redirect, render_template, url_for, request, session
from nekrologia.db import get_db 
from requests.utils import unquote

bp = Blueprint("frontend", __name__)

@bp.route('/goto')
def goto_route():
    cities = get_db().execute("SELECT city FROM cementary").fetchall()
    city_list = [ row['city'] for row in cities ]
    return render_template("frontend/goto.html", cities = city_list)

@bp.route('/index/<string:city>', methods = ['GET'])
def root(city):
    pl_city = unquote(city)
    get_graves_in_city = """SELECT 
        grave.id as id, 
        full_name_with_title, 
        date_of_birth, 
        date_of_death,  
        cementary_id, 
        cementary.full_name as full_name, 
        cementary.city as city  FROM grave
        INNER JOIN cementary ON cementary.id = grave.cementary_id WHERE city = ?"""
    data = get_db().execute(get_graves_in_city, (pl_city,)).fetchall()
    return render_template("frontend/index.html", graves = data)