from .auth import login_required
from flask import g, current_app, Blueprint, request, render_template, url_for, session
from nekrologia.db import get_db 

bp = Blueprint('panel', __name__)

@bp.route('/panel')
@login_required
def panel():
    return render_template("panel/panel.html")

