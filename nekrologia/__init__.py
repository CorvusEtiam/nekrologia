import os 
from flask import Flask, send_from_directory, jsonify    
import logging 
import sys 
from . import db 
from nekrologia.blueprints import auth
from nekrologia.blueprints import panel 

def setup_logging():
    logger = logging.getLogger('nekrologia')
    logger.setLevel(logging.DEBUG)
    fh = logging.FileHandler('debug.log')
    fh.setLevel(logging.DEBUG)
    fmt = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    fh.setFormatter(fmt)
    logger.addHandler(fh)
    return logger 

def create_app(test_config=None):
    logger = setup_logging()
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'nekrologia.sqlite')
    )

    if test_config is None:
        app.config.from_pyfile("config.py")
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass 
 
    db.init_app(app)
    logger.info('Datebase initialized')
    logger.info('PYTHON VERSION: ' + sys.version)
    app.register_blueprint(auth.bp)
    app.register_blueprint(panel.bp)

    @app.route('/hello')
    def test_route():
        return "<h1>Hello World!</h1>"


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

    return app 
