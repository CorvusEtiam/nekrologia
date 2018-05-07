from flask import Flask, jsonify, g, current_app
from nekrologia.db import get_db
from functools import wraps 
import typing 
from copy import deepcopy 

def update_cache(cached_val_name):
    def cache_wrapper(method):
        @wraps(method)
        def wrapped(self, *args, **kwargs):
            cache = get_cache()
            assert cached_val_name in cache, "No such key as {} in cache".format(cached_val_name)
            method(self, *args, **kwargs)
            for val in cache.values():
                val.update()
        return wrapped 
    return cache_wrapper
            #assert cached_val_name in CACHE, "No such value in cache as " + cached_val_name
            #CACHE[catched_val_name].update()


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

class Cached:
    def __init__(self, update_callback):
        self._data = None
        self._update = update_callback 
    
    def copy(self):
        return deepcopy(self._data)

    def update(self):
        self._data = self._update()


def init_cache():
    cache = {
        'graves' : Cached(update_cache_graves),
        'cementaries' : Cached(update_cache_cementaries),
        'users' : Cached(update_cache_users)
    }
    return cache 

def init_app(app : Flask):
    app.teardown_appcontext(close_cache)

def get_cached_resource(name : str) -> Cached:
    return get_cache()[name];

def get_cache() -> typing.Dict[str, Cached]:
    if 'cache' not in g:
        g.cache = init_cache()
        for cached in g.cache.values():
            cached.update()
    return g.cache

def close_cache(e = None):
    g.pop('cache', None)
    return 
