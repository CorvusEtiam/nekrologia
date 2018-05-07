import os 
from flask import Flask, send_from_directory, jsonify, request     
import logging 
import sys 
from nekrologia import db 
from nekrologia.blueprints import auth, panel, api 
from nekrologia import cache 

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
    cache.init_app(app)   
    
    app.register_blueprint(auth.bp)
    app.register_blueprint(panel.bp)
    app.register_blueprint(api.bp)
    # select(columns = '*', table = 'name', where='')
    @app.route('/', methods = ['GET'])
    def root():
        if request.method == 'GET':
            city = request.param['city']
        return render_template("index.html", graves = cache.get_cached_resource('graves').copy())

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
