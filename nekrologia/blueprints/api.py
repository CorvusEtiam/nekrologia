from .auth import login_required
from flask import g, current_app, Blueprint, request, render_template, url_for, session, send_file, jsonify, Response
from nekrologia.db import get_db 
from nekrologia.cache import get_cache, get_cached_resource, update_cache
from werkzeug.security import generate_password_hash
from functools import wraps 

bp = Blueprint('api', __name__)

@bp.route('/api/person/<int:user_id>', methods = ['GET'])
def person_descr(user_id):
    path = os.path.join(current_app.instance_path, '/res/osoba/{}.html'.format(user_id))
    if not os.path.exist(path):
        path = os.path.join(current_app.instance_path, '/res/osoba/error.html')
    with open(path, 'r') as fi:
        return Response(fi.read(), mimetype = "text/html")
    
@bp.route('/api/list/<string:tablename>', methods = ['POST'])
def list_resource(tablename, id):
    if tablename not in ('user', 'grave', 'cementary'):
        return jsonify({'status_msg' : 'Unkown resource %s' % (tablename, )})
    res = get_db().execute('SELECT * FROM ?', (tablename, )).fetchall()
    return jsonify({ row['id'] : dict(row) for row in users })
 
@bp.route('/api/show/<string:tablename>/<int:uid>', methods = ['GET'])
def show(tablename):
    if request.method == 'POST':
        if tablename not in ('grave', 'cementary', 'user'):
            return jsonify({'status_msg' : 'Table: ' + tablename + " is unknown"})
        data = get_db().execute('SELECT * FROM ? WHERE id = ?', (tablename, uid)).fetchone()
        return jsonify(dict(data))

def api_create_helper(target, fields, data):
    sql = "INSERT INTO {} {} VALUES {}".format(target, ', '.join(fields), ','.join(['?']*len(fields)))
    try:
        placeholders = []
        for key in fields:
            if key == 'password_hash':
                placeholders.append(generate_password_hash(data['password']))
            placeholders.append(data[key])
    except KeyError as ke:
        return jsonify({'status_msg' : 'Missing field :: ' + ke.message})

    db = get_db()
    db.execute(sql, placeholders)
    db.commit() 

@bp.route('/api/create/<string:tablename>', methods = ['POST'])
def create(tablename):
    if request.json == None:
        return jsonify({'status_msg' : "AJAX problem -- json not visible for server"})
    
    if tablename == 'grave':
        panresult = api_create_helper("grave", fields, request.json)
        if result is not None:
            return jsonify(result)
        long_text = request.json['description']
        path = os.path.join(current_app.instance_path, '/res/osoba/' + data['id'] + ".html")
        with open(path, 'w') as fi:
            fi.write(long_text)
        return jsonify({"status_msg" : "ok"})
    elif tablename == 'cementary':
        fields = ("full_name", "full_address", "city")
        return api_create_helper("cementary", fields, request.json)
    elif tablename == 'user':
        fields = ("username", "email", "password_hash", "admin_permit", "activated")
        return api_create_helper('users', fields, request.json)
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

@bp.route('/api/update/<string:param>', methods = ['POST'])
def update(param):
    if request.json == None:
        return jsonify({'status_msg' : "AJAX problem -- json not visible for server"})
    
    target = request.json.get('id', None)
    
    if target == None:
        return jsonify({'status_msg' : "key(id) not specified"})
    
    if param == 'grave':
        fields = ("name", "surname", "title", "full_name_with_title", "date_of_birth", 
            "date_of_death", "cementary_id", "gps_lon", "gps_lat")
        result = api_update_helper('grave', request.json, fields)
        if 'description' in request.json:
            long_text = request.json['description']
            path = os.path.join(current_app.instance_path, '/res/osoba/' + data['id'] + ".html")
            with open(path, 'w') as fi:
                fi.write(long_text)
    elif param == 'user':
        fields = ("username", "email", "password_hash", "admin_permit", "activated")
        result = api_update_helper('user', request.json, fields)
    elif param == 'cementary':
        fields = ("full_name", "full_address", "city")
        result = api_update_helper('cementary', request.json, fields)
    else:
        print("Bad Request :: {} => {!r}".format(param, request.json))
        result = { 'status_msg' : 'incorrect param specified', 'param' : param }
    return jsonify(result)

@bp.route('/api/remove/<string:param>', methods = ['POST'])
def remove(param):
    if request.json == None:
        return jsonify({'status_msg' : "AJAX problem -- json not visible for server"})
    
    target = request.json.get('id', None)
    
    if target == None:
        return jsonify({'status_msg' : "key(id) not specified"})
    
    def helper(target, id):
        db = get_db()
        db.execute('DELETE FROM {} WHERE id=?'.format(target), (id,))
        db.commit()
    
    if param == 'grave':
        helper('grave', target)
        result = {"status_msg" : "ok"}
    elif param == 'user':
        helper('user', target)
        result = {"status_msg" : "ok"}
    elif param == 'cementary':
        helper('cementary', target)
        result = {"status_msg" : "ok"}
    else:
        print("Bad Request :: {!r}".format(data))
        result = { 'status_msg' : 'incorrect param specified', 'param' : param }
    return jsonify(result)


@bp.route('/api/image', methods = ['GET'])
def get_real_image_href():
    if request.method == 'GET':
        userid = request.args.get('userid')
        result = get_db().select('SELECT img_path FROM image WHERE userid = ?', (userid, )).fetchone()
        return 