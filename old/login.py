from flask import Flask, Blueprint, render_template, request, url_for, send_from_directory, send_file, jsonify, current_app
from flask.ext.login import LoginManager, login_user, logout_user, login_required, current_user 
from wtforms import Form, TextField, PasswordField, validators
from nekrologia.models import User 

login_page = Blueprint('login_page', __name__, template_folder= 'templates')

class LoginForm(Form):
    username = TextField('Użytkownik', [validators.Required(), validators.Length(min = 5, max = 40)])
    password = PasswordField('Hasło', [validators.Required(), validators.Length(min = 5, max = 100)])

login_manager = LoginManager()
login_manager.setup_app(current_app)

@login_manager.user_loader
def load_user(userid):
    return User.query.get(userid)

@login_page.route('/login', methods = ['POST', 'GET'])
def login():
    form = LoginForm(request.form)
    if request.method == 'POST' and form.validate():
        username = request.json['username']
        user = User.get(username = username)
        password = request.json['password']
    return render_template('login.html', form = form)