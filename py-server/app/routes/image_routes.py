from flask import Blueprint
from app.controllers import image_controller as ic

bp = Blueprint('image_routes', __name__)


@bp.route('/images', methods=['GET'])
def get_images_route():
    return ic.get_images()


@bp.route('/images/<int:image_id>', methods=['GET'])
def get_image_route(image_id):
    return ic.get_image(image_id)


@bp.route('/images', methods=['POST'])
def post_image_route():
    return ic.add_image()
