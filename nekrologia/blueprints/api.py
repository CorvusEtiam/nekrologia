from .auth import login_required
from flask import g, current_app, Blueprint, request, render_template, url_for, session, send_file, jsonify
from nekrologia.db import get_db 
from nekrologia.cache import get_cache, get_cached_resource, update_cache
from werkzeug.security import generate_password_hash
from functools import wraps 

bp = Blueprint('api', __name__)

class BaseEndpoint:
    def __init__(self, data):
        self._data = data 
        self._action = data.get('action')
        self._name = self._action.lower()
    def run(self):
        if hasattr(self, 'do_' + self._name):
            return getattr(self, 'do_'+self._name)(self._data or {})
 

class InternalEndpoint(BaseEndpoint):
    def do_remove(self, data):
        try:
            param = data['param']
        except KeyError as key:
            print("Bad Request :: {!r}".format(data))
            return jsonify({ 'status_msg' : 'no param specified' })

        if param == 'grave':
            return self._remove_grave(data)
        elif param == 'user':
            return self._remove_user(data)
        elif param == 'cementary':
            return self._remove_cementary(data)
        else:
            print("Bad Request :: {!r}".format(data))
            return jsonify({ 'status_msg' : 'incorrect param specified', 'param' : param })
    
    @update_cache('graves')
    def _remove_grave(self, data):
        get_db().execute('DELETE FROM grave WHERE id=?', (data['id'],)).commit()
        return {'status_msg' : 'ok' }
    
    @update_cache('users')
    def _remove_user(self, data):
        get_db().execute('DELETE FROM user WHERE id=?', (data['id'],)).commit()
        return {'status_msg' : 'ok' }
    
    @update_cache('cementaries') 
    def _remove_cementary(self, data):
        get_db().execute('DELETE FROM cementary WHERE id=?', (data['id'],)).commit()
        return {'status_msg' : 'ok' }
    
    def do_create(self, data):
        try:
            param = data['param']
        except KeyError as key:
            print("Bad Request :: {!r}".format(data))
            return { 'status_msg' : 'no param specified' }

        if param == 'grave':
            return self._create_grave(data)
        elif param == 'user':
            return self._create_user(data)
        elif param == 'cementary':
            return self._create_cementary(data)
        else:
            print("Bad Request :: {!r}".format(data))
            return { 'status_msg' : 'incorrect param specified', 'param' : param }
     
    @update_cache('users')
    def _create_user(self, data):
        sql = "INSERT INTO user (username, email, password_hash, admin_permit, activated) VALUES (?,?,?,0,0)"
        placeholders = (data['username'], data['email'], generate_password_hash(data['password']))
        get_db().execute(sql, placeholders)
        get_db().commit()
        return {"status_msg" : "ok"}

    @update_cache('graves')
    def _create_grave(self, data):
        """
        1. name TEXT NOT NULL,
        2. surname TEXT NOT NULL,
        3. title TEXT NOT NULL,
        4. full_name_with_title TEXT NOT NULL,
        5. date_of_birth TEXT,
        6. date_of_death TEXT,
        7. cementary_id INTEGER NOT NULL,
        8. gps_lon FLOAT,
        9. gps_lat FLOAT, 
        """ 
        fields = ("name", "surname", "title", "full_name_with_title", "date_of_birth", "date_of_death", "cementary_id", "gps_lon", "gps_lat")
        sql = "INSERT INTO user {} VALUES {}".format(', '.join(fields), ','.join(['?']*len(fields)))
        placeholders = [ data[key] for key in fields ]
        get_db().execute(sql, placeholders).commit()
        
        long_text = data['description']
        path = os.path.join(current_app.instance_path, '/res/osoba/' + data['id'] + ".html")
        with open(path, 'w') as fi:
            fi.write(long_text)

        return {"status_msg" : "ok"} 

    @update_cache('cementaries')
    def _create_cementary(self, data):
        """
        full_name TEXT UNIQUE NOT NULL,
        full_address TEXT UNIQUE NOT NULL,
        city TEXT NOT NULL
        """
        sql = "INSERT INTO (full_name, full_address, city) VALUES (?, ?, ?)"
        conn = get_db()
        conn.execute(sql, (data['full_name'], data['full_address'], data['city']))
        conn.commit()
        return {"status_msg" : "ok"} 


        
@bp.route('/api/person/<int:user_id>', methods = ['GET'])
def grave(user_id):
    return send_file(os.path.join(current_app.instance_path, '/res/osoba/{}.html'.format(user_id)))

@bp.route('/api/internal', methods = ['POST', 'GET'])
#@login_required
def internal():
    if request.method == 'POST':
        data = request.json
        
        external = InternalEndpoint(data)
        return jsonify(external.run())
     
@bp.route('/api/list/<string:tablename>', methods = ['POST'])
def list_resource(tablename):
    if tablename not in ('users', 'graves', 'cementaries'):
        return jsonify({'status_msg' : 'Unkown resource %s' % (tablename, )})
    res = get_db().execute('SELECT * FROM ?', (tablename, )).fetchall()
    return jsonify({ row['id'] : dict(row) for row in users })
 
@bp.route('/api/show/<string:tablename>', methods = ['POST']):
def show_data(tablename):
    if request.method == 'POST':
        res_id = request.values.get('id')
        if res_id == None:
            return jsonify({'status_msg' : 'No' + tablename +  'specified'})
        else:
            if tablename not in ('grave', 'cementary', 'user'):
                return jsonify({'status_msg' : 'Table: ' + tablename + " is unknown"})
            data = get_db().execute('SELECT * FROM ? WHERE id = ?', (tablename, res_id)).fetchone()
            return jsonify(dict(user))

def api_create_user():
    sql = "INSERT INTO user (username, email, password_hash, admin_permit, activated) VALUES (?,?,?,0,0)"
    data = dict(request.values) 
    try:
        placeholders = (data['username'], data['email'], generate_password_hash(data['password']))
    except KeyError as ke:
        return jsonify({'status_msg' : 'Missing field :: ' + ke.message})
    db = get_db()
    db.execute(sql, placeholders)
    db.commit()
    return {"status_msg" : "ok"}

def api_create_grave():
    """
    1. name TEXT NOT NULL,
    2. surname TEXT NOT NULL,
    3. title TEXT NOT NULL,
    4. full_name_with_title TEXT NOT NULL,
    5. date_of_birth TEXT,
    6. date_of_death TEXT,
    7. cementary_id INTEGER NOT NULL,
    8. gps_lon FLOAT,
    9. gps_lat FLOAT, 
    """ 
    data = dict(request.values)
    fields = ("name", "surname", "title", "full_name_with_title", "date_of_birth", "date_of_death", "cementary_id", "gps_lon", "gps_lat")
    sql = "INSERT INTO user {} VALUES {}".format(', '.join(fields), ','.join(['?']*len(fields)))
    try:
        placeholders = [ data[key] for key in fields ]
    except KeyError as ke:
        return jsonify({'status_msg' : 'Missing field :: ' + ke.message})

    db = get_db()
    db.execute(sql, placeholders)
    db.commit()
    
    long_text = data['description']
    path = os.path.join(current_app.instance_path, '/res/osoba/' + data['id'] + ".html")
    with open(path, 'w') as fi:
        fi.write(long_text)
    return {"status_msg" : "ok"} 


def api_create_cementary():
    """
    full_name TEXT UNIQUE NOT NULL,
    full_address TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL
    """
    data = dict(request.values)
    sql = "INSERT INTO (full_name, full_address, city) VALUES (?, ?, ?)"
    try:
        placeholders = (data['full_name'], data['full_address'], data['city'])
    except KeyError as ke:
        return jsonify({'status_msg' : 'Missing field :: ' + ke.message})
    
    conn = get_db()
    conn.execute(sql, placeholders)
    conn.commit()
    return {"status_msg" : "ok"} 

@bp.route('/api/create/<string:tablename>', methods = ['POST'])
def create_endpoint(tablename):
    if tablename == 'grave':
        return api_create_grave()
    elif tablename == 'cementary':
        return api_create_cementary()
    elif tablename == 'user':
        return api_create_user()
    else:
        return jsonify({ "status_msg" : "Unkown resource " + tablename})

def api_update_helper(target, data, fields):
    out = { k : v for k,v in data.items() if k in fields and v != None }
    
    if 'password' in fields and 'password' in data:
        out['password_hash'] = generate_password_hash(data['password'])    

    kv = list(out.items())
    keys = list(item[0] for item in kv)
    columns = ', '.join([key + ' = ?' for key in keys])
    
    vals = list(item[1] for item in kv)
    
    vals.append(id)
    sql = 'UPDATE {} SET {} WHERE id=?'.format(target, columns)
    db = get_db()
    db.execute(sql, vals)
    db.commit()
    return {"status_msg" : "ok"} 


@bp.route('/api/update/<string:param>', methods = ['POST']):
def update(param):
    target = data.get('id', None)
    if target == None:
        return jsonify({'status_msg' : "key(id) not specified"})
    
    if request.json == None:
        return jsonify({'status_msg' : "AJAX problem -- json not visible for server"})
    
    if param == 'grave':
        fields = ("name", "surname", "title", "full_name_with_title", "date_of_birth", 
            "date_of_death", "cementary_id", "gps_lon", "gps_lat")
        
        return api_update_helper('grave', request.json, fields)
    elif param == 'user':
        fields = ("username", "email", "password_hash", "admin_permit", "activated")
        return api_update_helper('user', request.json, fields)

    elif param == 'cementary':
        fields = ("full_name", "full_address", "city")
        return api_update_helper('cementary', request.json, fields)

    else:
        print("Bad Request :: {!r}".format(data))
        return { 'status_msg' : 'incorrect param specified', 'param' : param }

