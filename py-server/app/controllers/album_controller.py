from flask import request, jsonify
from app.models.user import User
from app.models.album import Album
from app.helpers.s3_helper import delete_files
from config.db import db


def get_albums():
    try:
        albums = Album.query.all()
        return jsonify([album.to_dict() for album in albums]), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def get_albums_by_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404

        return jsonify(user.to_dict(include_albums=True)), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def get_album(album_id):
    try:
        album = Album.query.get(album_id)
        if album:
            return jsonify(album.to_dict()), 200
        else:
            return jsonify({'message': 'Album no encontrado.'}), 404
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def add_album():
    try:
        data = request.get_json()
        name = data.get('name')
        user_id = data.get('user_id')

        # Validar la entrada
        if not all([name, user_id]):
            return jsonify({'message': 'Todos los campos son necesarios.'}), 400

        # Crear y agregar el nuevo album a la base de datos
        new_album = Album(
            name=name,
            user_id=user_id
        )
        db.session.add(new_album)
        db.session.commit()

        return jsonify(new_album.to_dict(include_images=False)), 201
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def update_album(album_id):
    try:
        album = Album.query.get(album_id)
        if not album:
            return jsonify({'message': 'Album no encontrado.'}), 404
        
        # Verificar si el álbum puede ser modificado
        # Buscar el primer álbum con el mismo user_id
        first_album_with_user_id = Album.query.filter_by(user_id=album.user_id).order_by(Album.album_id).first()
        if first_album_with_user_id and first_album_with_user_id.album_id == album_id:
            return jsonify({'message': f'El álbum "{album.name}" no se puede modificar.'}), 403

        data = request.get_json()
        name = data.get('name')

        # Verificar si el nombre fue proporcionado
        if not name:
            return jsonify({'message': 'Se requiere el nombre.'}), 400

        album.name = name
        db.session.commit()

        return jsonify(album.to_dict()), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def delete_album(album_id):
    try:
        album = Album.query.get(album_id)
        if not album:
            return jsonify({'message': 'Album no encontrado.'}), 404
        
        # Verificar si el álbum puede ser eliminado
        # Buscar el primer álbum con el mismo user_id
        first_album_with_user_id = Album.query.filter_by(user_id=album.user_id).order_by(Album.album_id).first()
        if first_album_with_user_id and first_album_with_user_id.album_id == album_id:
            return jsonify({'message': f'El álbum "{album.name}" no se puede eliminar.'}), 403

        # Eliminar el album de la base de datos
        db.session.delete(album)
        db.session.commit()

        return jsonify({'message': 'Album eliminado exitosamente.'}), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500
