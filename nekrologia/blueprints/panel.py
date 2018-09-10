from .auth import login_required, admin_required
from flask import g, current_app, Blueprint, request, render_template, url_for, session, Response
import re 

from nekrologia.db import get_db 
import os  
from werkzeug.utils import secure_filename
bp = Blueprint('panel', __name__)

@bp.route('/panel')
@login_required
def panel():
    users = get_db().execute("SELECT * FROM user").fetchall()
    cementaries = get_db().execute("SELECT * FROM cementary").fetchall()
    graves = get_db().execute('SELECT * FROM grave').fetchall()
    return render_template("panel/panel.html", users = users, cementaries = cementaries, images = os.listdir(current_app.config['UPLOAD_FOLDER']), graves = graves)

ALLOWED = ('.jpeg','.jpg', '.png', 'gif')
def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED 

def correct_filename(filename):
    return re.match(r"^[A-Za-z0-9_]*\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$", filename) is not None 

@bp.route('/panel/upload', methods = ['GET', 'POST'])
def upload_image():
    if request.method == 'POST':
        print(dict(request.files))
        if 'file' not in request.files:
            
            return Response("Błąd z wysłaniem pliku. Prosimy o kontakt  <a href='/panel'>Powrót</a>", status = 500)
        file = request.files['file']
        
        if file.filename == '':    
            return Response("Pusta nazwa pliku, nie został wysłany. Prosimy o kontakt <a href='/panel'>Powrót</a>", status = 500)

        if file and correct_filename(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            return Response("Wysłano  <a href='/panel'>Powrót</a>", status = 200)
        
    