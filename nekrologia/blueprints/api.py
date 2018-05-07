from .auth import login_required
from flask import g, current_app, Blueprint, request, render_template, url_for, session, send_file 
from nekrologia.db import get_db 
from nekrologia.cache import get_cache, get_cached_resource, update_cache
from werkzeug.security import generate_password_hash
from functools import wraps 

bp = Blueprint('api', __name__)

class BaseEndpoint:
    def connect(self, action, data = None):
        action_name = action.lower()
        if hasattr('do_' + action_name):
            return getattr(self, 'do_'+action_name)(data or {})
 

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
        get_db().execute(sql, placeholders).commit()
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
        get_db().execute(sql, (data['full_name'], data['full_address'], data['city'])).commit()
        return {"status_msg" : "ok"} 

    def do_update(self, data):
        try:
            param = data['param']
        except KeyError as key:
            print("Bad Request :: {!r}".format(data))
            return { 'status_msg' : 'no param specified' }

        if param == 'grave':
            return self._update_grave(data)
        elif param == 'user':
            return self._update_user(data)
        elif param == 'cementary':
            return self._update_cementary(data)
        else:
            print("Bad Request :: {!r}".format(data))
            return { 'status_msg' : 'incorrect param specified', 'param' : param }
     
    @update_cache('graves') 
    def _update_grave(self, data):
        fields = ("name", "surname", "title", "full_name_with_title", "date_of_birth", "date_of_death", "cementary_id", "gps_lon", "gps_lat")
        out = {}
        target = data['id']
        for k, v in data.items():
            if k in fields and v != None:
                out[k] = v 
        keys = list(out.keys())
        
        columns = ', '.join([key + ' = ?' for key in keys])
        
        vals = list(out.values())
        vals.append(target)

        sql = 'UPDATE grave SET {} WHERE id=?'.format(columns)

        get_db().execute(sql, vals).commit()
        return {"status_msg" : "ok"} 

    @update_cache('users')     
    def _update_user(self, data):
        fields = ("username", "email", "password_hash", "admin_permit", "activated")
        out = {}
        target = data['id']
        for k, v in data.items():
            if k in fields and v != None:
                out[k] = v 
        if 'password' in data:
            out['password_hash'] = generate_password_hash(data['password'])
        

        keys = list(out.keys())
        
        columns = ', '.join([key + ' = ?' for key in keys])
        
        vals = list(out.values())
        vals.append(target)

        sql = 'UPDATE user SET {} WHERE id=?'.format(columns)

        get_db().execute(sql, vals).commit()
        return {"status_msg" : "ok"} 
    
    @update_cache('cementary')
    def _update_cementary(self, data):
        fields = ("full_name", "full_address", "city")
        out = {}
        target = data['id']
        for k, v in data.items():
            if k in fields and v != None:
                out[k] = v 
        keys = list(out.keys())
        
        columns = ', '.join([key + ' = ?' for key in keys])
        
        vals = list(out.values())
        vals.append(target)

        sql = 'UPDATE cementary SET {} WHERE id=?'.format(columns)

        get_db().execute(sql, vals).commit()
        return {"status_msg" : "ok"} 

class ExternalEndpoint(BaseEndpoint):
    def do_list(self, data):
        param = data['param']
        if param == 'grave':
            return get_cached_resource('graves').copy()
        elif param == 'user' and 'is_admin' is g and g.is_admin == True:
            return get_cached_resource('users').copy()
        elif param == 'cementary':
            return get_cached_resource('cementaries').copy()
    
    def do_show(self, data):
        param = data['param']
        if param not in ("grave", "cementary", "user"):
            print("Bade Request :: wrong parameter")
            return {"status_msg" : "Wrong param"}
        db = get_db()
        if param == 'grave':
            row = db.execute('SELECT * FROM grave WHERE id=?', (data['id'],)).fetchone()
            return dict(row)
        elif param == 'cementary':
            row = db.execute('SELECT * FROM cementary WHERE id=?', (data['id'],)).fetchone()
            return dict(row) 
        elif param == 'user':
            row = db.execute('SELECT * FROM user WHERE id=?', (data['id'],)).fetchone()
            return dict(row)   

        
@bp.route('/api/person/<int:user_id>', methods = ['GET'])
def grave(user_id):
    return send_file(os.path.join(current_app.instance_path, '/res/osoba/{}.html'.format(user_id)))

@bp.route('/api/internal', methods = ['POST', 'GET'])
@login_required
def internal():
    action = request.values.get('action') 
    endpoint = Endpoint()
    return jsonify(endpoint.connect(action, data = request.values))
     
@bp.route('/api/external', methods = ['POST', 'GET'])
def external():
    action = request.values.get('action')
    external = ExternalEndpoint()
    return jsonify(external.connect(action, data = request.values))

