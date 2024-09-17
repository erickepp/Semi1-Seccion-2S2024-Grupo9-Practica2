from flask import Flask, jsonify
from flask_cors import CORS
from config.db import init_db
from app.routes import auth_routes, user_routes, album_routes


def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.json.sort_keys = False
    CORS(app)

    init_db(app)

    app.add_url_rule('/check', 'check_status', lambda: (jsonify({'status': 'OK'}), 200))

    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(user_routes.bp)
    app.register_blueprint(album_routes.bp)

    return app
