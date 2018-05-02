from flask import request, render_template, redirect, url_for, Flask  
from flask.ext.login import LoginManager, login_user, login_required, logout_user, UserMixin, current_user 
from flask_sqlalchemy import SQLAlchemy 
from werkzeug.security import generate_password_hash, check_password_hash 
from wtforms import Form, TextField, PasswordField, validators
from mistune import Renderer, InlineGrammar, InlineLexer 
from copy import deepcopy 
from functools import wraps 

import os 


CACHE = {}
TMPLS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
app = Flask(__name__, template_folder= TMPLS)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////tmp/test.db'

db = SQLAlchemy(app)

class Cached:
    def __init__(self, data, update_callback):
        self.data = data
        self._update = update_callback 
    
    def json(self):
        return jsonify(deepcopy(self.data))

    def update(self):
        self._update()

class User(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(40), unique = True, nullable = False)
    password_hash = db.Column(db.String(256), nullable = False)
    email = db.Column(db.String(256))
    permit_admin = db.Column(db.Boolean)

    def __init__(self, username=None, email=None, password=None):
        super().__init__()
        self.username = username 
        self.email = email
        self.password_hash = generate_password_hash(password)
    
    def __repr__(self):
        return "<User:{!r}>".format(self.username) 

    def serialize_as_dict(self):
        return { "username" : self.username, "email" : self.email }

class Cementary(db.Model):
    __tablename__ = "cementaries"
    id = db.Column(db.Integer, primary_key = True)
    short_name = db.Column(db.String(256), unique = True)
    full_name = db.Column(db.String(256))
    full_address = db.Column(db.String(256))

    def __init__(self, id, name, address):
        self.cementary_id = id 
        self.full_name = name 
        self.full_address = address


    def serialize_as_dict(self):
        return { "id" : self.cementary_id, "full_name" : self.full_name, 'full_address' : self.full_address }

    def __repr__(self):
        return "<Cementary:{!r}>".format(self.cementary_id) 

class Grave(db.Model):
    __tablename__ = "graves"
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(256))
    surname = db.Column(db.String(256))
    fullname = db.Column(db.String(256))
    date_of_birth = db.Column(db.String(10))
    date_of_death = db.Column(db.String(10))
    cementary = db.Column(db.String(256))
    gps_lon = db.Column(db.Float)
    gps_lat = db.Column(db.Float)
 
    def serialize_as_dict(self):
        result = {
            'id' : self.id,
            'name' : self.name,
            'surname' : self.surname,
            'fullname' : self.fullname,
            'date_of_birth' : self.date_of_birth,
            'date_of_death' : self.date_of_death,
            'coords' [ self.gps_lon, self.gps_lat ]
            'cementary_id' : self.cementary
        }
        return result 

def update_cache_graves():
    graves = map(lambda g: g.serialize_to_json(), Grave.query.all())
    data = { grave.id: grave for grave in graves }
    return data 

def update_cache_cementaries():
    cementaries = map(lambda c: c.serialize_to_json(), Cementary.query.all())
    data = { cementary.cementary_id: cementary for cementary in cementaries }
    return data 

def update_cache_userss():
    users = map(lambda u: u.serialize_to_json(), User.query.all())
    data = { user.id: users for user in users }
    return data 


CACHE['graves'] = Cached(None, update_cache_graves)
CACHE['cementaries'] = Cached(None, update_cache_cementaries)
CACHE['users'] = Cached(None, update_cache_users)

#db.create_all()

################################################################################################

@app.route('/login', methods = ['POST', 'GET'])
def login_handler():
    form = LoginForm(request.form)
    error = None 
    if request.method == 'POST' and form.validate():
        user = User.query.filter_by(username = form.username).first()
        if user:
            if login_user(user):
                app.logger.debug(f'User {user.username} is logged in')
                return redirect(url_for('editor'))
    return render_template('login.html', form = form, error = error)

@app.route('/logout')
def logout_handler():
    logout_user()
    return redirect(url_for('login'))

#####################################################################################

@app.route('/')
def root():
    return render_template("index.html")


@app.route('/src/<path:path>')
def send_js(path):
    return send_from_directory('src', path)

@app.route('/styles/<path:path>')
def send_css(path):
    return send_from_directory('styles', path)


@app.route('/images/<path:path>')
def send_images(path):
    return send_from_directory('images', path)

@app.route("/res/<path:path>")
def endpoint_json(path):
    js = json.load(open("./nekrologia/res/" + path, 'r', encoding="utf-8"))
    return jsonify(js)

@app.route('/editor')
@login_required
def editor():
    return render_template("editor.html")

################################################################################

@current_app.route('/api/internal', methods = ['POST', 'GET'])
@login_required
def api_internal():
    action = request.values.get('action') 
    param  = request.values.get('param')
    grave_attr = ['name', 'surname', 'fullname', 'date_of_birth', 'date_of_death', 'gps_lon', 'gps_lat']
    if action == 'create' and param == 'grave':
        data = { key : request.values.get(key) for key in grave_atrr } 
        grave = Grave(**data)
        db.session.add(grave)
        app.logger.debug("Nowy grób został dodany : " + data['fullname'])
        db.session.commit()
        CACHE['graves'].update()
    elif action == 'update' and param == 'grave':
        CACHE['*graves'].update()
    elif action == 'preview':
        # jsonify({ 'html' : render(some_markdown) })
        pass 
    elif action == 'create' and param == 'user' and current_user.permit_admin == True:
        CACHE['users'].update()
        pass 
    elif action == 'delete' and param == 'user' and current_user.permit_admin == True:
        CACHE['users'].update()
        pass 
     

@current_app.route('/api/external', methods = ['POST', 'GET'])
def api_external():
    action = request.values.get('action')
    param = request.values.get('param')     
    if action == 'list':
        if param == 'graves':
            return CACHE['graves'].json()
        else param == 'cementaries':
            return CACHE['cementaries'].json()
        else param == 'users' and current_user.permit_admin == True:
            return CACHE['users'].json()
    elif action == 'select':
        pass  
    elif action == 'description'
        pass 

