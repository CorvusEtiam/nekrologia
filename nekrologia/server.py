from flask import Flask, render_template, request, url_for, send_from_directory, send_file, jsonify
from flask.ext.login import LoginManager, login_user, logout_user, login_required, current_user 
from wtforms import Form, TextField, PasswordField, validators
from flaskext.mysql import MySQL 

import codecs 
import json 
import os 
import requests

TMPLS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
 
class LoginForm(Form):
    username = TextField('Użytkownik', [validators.Required(), validators.Length(min = 5, max = 40)])
    password = PasswordField('Hasło', [validators.Required(), validators.Length(min = 5, max = 100)])

login_manager = LoginManager()

@login_manager.user_loader
def load_user(userid):
    pass

@login_page.route('/login', methods = ['POST', 'GET'])
def login():
    form = LoginForm(request.form)
    if request.method == 'POST' and form.validate():
        username = request.form['username']
        user = User.query.get(username = username)
        password = request.form['password']
         
    return render_template('login.html', form = form)


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

@app.route("/osoba")
def osoba():
    id = request.args.get('id')
    files = os.listdir("./nekrologia/res/osoba")
    fp = "{}.html".format(id)
    if fp in files:
        return send_file("./res/osoba/{}.html".format(id), mimetype = "text/html")
    else:
        return send_file("/nekrologia/res/error.html")



app = Flask(__name__, template_folder = TMPLS)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////home/mrybicki/nekrologia.db'
login_manager.setup_app(app)


if __name__ == '__main__':
    app.run(port = 8008, debug = True)


