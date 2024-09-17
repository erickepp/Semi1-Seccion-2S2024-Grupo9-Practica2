from flask import Blueprint
from app.controllers import album_controller as ac

bp = Blueprint('album_routes', __name__)


@bp.route('/albums', methods=['GET'])
def get_albums_route():
    return ac.get_albums()


@bp.route('/users/<int:user_id>/albums', methods=['GET'])
def get_albums_by_user_route(user_id):
    return ac.get_albums_by_user(user_id)


@bp.route('/albums/<int:album_id>', methods=['GET'])
def get_album_route(album_id):
    return ac.get_album(album_id)


@bp.route('/albums', methods=['POST'])
def post_album_route():
    return ac.add_album()


@bp.route('/albums/<int:album_id>', methods=['PATCH'])
def patch_user_route(album_id):
    return ac.update_album(album_id)


@bp.route('/albums/<int:album_id>', methods=['DELETE'])
def delete_user_route(album_id):
    return ac.delete_album(album_id)
