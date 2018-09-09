from functools import wraps 
from flask_wtf import FlaskForm 
from flask import Blueprint, flash, g, redirect, render_template, url_for, request, session
from werkzeug.security import check_password_hash, generate_password_hash
from wtforms import TextField, PasswordField
import wtforms.validators as v 

from nekrologia.db import get_db 

bp = Blueprint('auth', __name__)

class LoginForm(FlaskForm):
    username = TextField('Login', validators=[v.DataRequired()]) 
    password = PasswordField('Hasło', validators=[v.DataRequired()])

class RegisterForm(FlaskForm):
    username = TextField('Login', validators=[v.DataRequired()]) 
    password = PasswordField('Hasło', validators=[v.DataRequired()])
    confirm  = PasswordField('Powtórz hasło', validators=[v.DataRequired(), v.EqualTo('password', message = 'Hasła muszą się zgadzać')])
    email    = TextField(
                    'Email', 
                    validators=[
                        v.DataRequired(), 
                        v.Email(message=None), 
                        v.Length(6, 255)
                    ])
        



@bp.route('/register', methods = ['POST', 'GET'])
def register():
    db = get_db()
    error = None 
    form = RegisterForm(request.form)
    if request.method == 'POST':
        if form.validate_on_submit():
            user = db.execute('SELECT * FROM user WHERE username = ?', (form.username.data,)).fetchone()
            if user is not None:
                error = "Użytkownik: {} istnieje".format(form.username.data)
                
            if error is None:
                db.execute('INSERT INTO user (username, password_hash, email, admin_permit, activated) VALUES (?, ?, ?, ?, ?)', 
                        (form.username.data, generate_password_hash(form.password.data), form.email.data, False, False))
                db.commit()
                
                return redirect(url_for('auth.accept'))
    return render_template('auth/register.html', form = form, error = error)

@bp.route('/wait_for_accept')
def accept():
    if g.user is not None and g.user['activated']:
        return redirect(url_for('panel'))
    return render_template('auth/wait_for_accept.html')

@bp.route('/login', methods = ['POST', 'GET'])
def login():
    form = LoginForm(request.form)
    error = None 
    db = get_db()
    if request.method == 'POST':
        if form.validate_on_submit():
            user = db.execute('SELECT * FROM user WHERE username = ?', (form.username.data, )).fetchone()
            if user is None:
                error = "Użytkownik {} nie istnieje".format(form.username.data)
            else:
                if not check_password_hash(user['password_hash'], form.password.data):
                    error = "Hasło niepoprawne"
            if error is None:
                session.clear()
                session['user_id'] = user['id']
                return redirect(url_for('panel.panel'))     
        else:
            error = "Niewłaściwy email lub hasło"
    return render_template('auth/login.html', form = form, error = error)

@bp.before_app_request
def load_logged_user():
    user_id = session.get('user_id')
    if user_id is None:
        g.user = None 
        g.admin = None 
    else:
        g.user = get_db().execute("SELECT * FROM user WHERE id = ?", (user_id, )).fetchone()
        g.admin = (g.user['admin_permit']) == 1
#        print("{} => {}".format(g.user, g.admin))

@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))
    

def login_required(view):
    @wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))
        return view(**kwargs)
    return wrapped_view

    
