from flask import jsonify 
from nekrologia.db import get_db


def update_cache_graves():
    graves = get_db().execute('SELECT * FROM grave').fetchall()
    grave_dict = { grave['id'] : dict(grave) for grave in graves }    
    return grave_dict

def update_cache_cementaries():
    cementaries = get_db().execute('SELECT * FROM cementary').fetchall()
    cementary_dict = { cementary['id'] : dict(cementary) for cementary in cementaries }    
    return cementary_dict

def update_cache_users():
    users = get_db().execute('SELECT * FROM user').fetchall()
    user_dict = { user['id'] : dict(user) for user in users }    
    return user_dict 


CACHE = {}

class Cached:
    def __init__(self, data, update_callback):
        self.data = data
        self._update = update_callback 
    
    def json(self):
        return jsonify(deepcopy(self.data))

    def update(self):
        self._update()


def add_cached_resource(name, update_callback, start_data = None):
    global CACHE 
    data = update_callback() if start_data == None else start_data  
    CACHE[name] = Cached(data, update_callback)

def init_cache():
    add_cached_resource('graves', update_cache_graves)
    add_cached_resource('cementaries', update_cache_cementaries)
    add_cached_resource('users', update_cache_users)
    