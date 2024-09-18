from flask import request, jsonify
from app.models.album import Album
from app.models.image import Image
from app.helpers.s3_helper import upload_file
from config.db import db


def get_images():
    try:
        images = Image.query.all()
        return jsonify([image.to_dict() for image in images]), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def get_image(image_id):
    try:
        image = Image.query.get(image_id)
        if image:
            return jsonify(image.to_dict()), 200
        else:
            return jsonify({'message': 'Imagen no encontrada.'}), 404
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def add_image():
    try:
        data = request.form
        name = data.get('name')
        description = data.get('description')
        url = request.files.get('url')
        album_id = data.get('album_id')

        # Validar la entrada
        if not all([name, description, url, album_id]):
            return jsonify({'message': 'Todos los campos son necesarios.'}), 400

        # Obtener el álbum
        album = Album.query.get(album_id)
        if not album:
            return jsonify({'message': 'Álbum no encontrado.'}), 404
        
        # Verificar si se pueden subir imágenes al álbum
        # Buscar el primer álbum con el mismo user_id
        first_album_with_user_id = Album.query.filter_by(user_id=album.user_id).order_by(Album.album_id).first()
        if first_album_with_user_id and first_album_with_user_id.album_id == int(album_id):
            return jsonify({'message': f'El álbum "{album.name}" no permite subir imágenes.'}), 403
        
        # Subir la imagen al bucket S3
        prefix = f'Fotos_Publicadas/Usuario-{album.user_id}/Album-{album_id}'
        image_url = upload_file(url, f'{prefix}/{url.filename}')

        # Crear y agregar la nueva imagen a la base de datos
        new_image = Image(
            name=name,
            description=description,
            url=image_url,
            album_id=album_id
        )
        db.session.add(new_image)
        db.session.commit()

        return jsonify(new_image.to_dict()), 201
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500
