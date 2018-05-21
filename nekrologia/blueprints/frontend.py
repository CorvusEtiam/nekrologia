from flask import Blueprint, flash, g, redirect, render_template, url_for, request, session
from nekrologia.db import get_db 
from requests.utils import unquote
import logging as log 
bp = Blueprint("frontend", __name__)

@bp.route('/')
def goto_route():
    cities = get_db().execute("SELECT city FROM cementary").fetchall()
    city_list = [ row['city'] for row in cities ]
    return render_template("frontend/goto.html", cities = city_list)

def get_graves_from_city(city=None):
    graves_in_city = """SELECT 
        grave.id as id, 
        full_name_with_title, 
        date_of_birth, 
        date_of_death,  
        cementary_id, 
        cementary.full_name as full_name, 
        cementary.city as city  FROM grave
        INNER JOIN cementary ON cementary.id = grave.cementary_id"""
    
    if city != None:
        graves_in_city += """ WHERE city = ?"""
        data = get_db().execute(graves_in_city, (city,)).fetchall()
    else:
        data = get_db().execute(graves_in_city)
    return data 

@bp.route('/index', methods = ['GET'])
def root():
    if request.method == 'GET':
        city_name = request.args.get('city')
    if city_name != None:
        city = unquote(city_name)
    else:
        city = None 
    data = get_graves_from_city(city)
    
    return render_template("frontend/index.html", graves = data, city = city)