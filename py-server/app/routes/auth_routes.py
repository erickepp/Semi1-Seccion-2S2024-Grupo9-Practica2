from flask import Blueprint
from app.controllers import auth_controller as ac

bp = Blueprint('auth_routes', __name__)


@bp.route('/login', methods=['POST'])
def post_auth_route():
    return ac.authenticate()
