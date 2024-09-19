import os
import bcrypt
from flask import request, jsonify
from app.models.user import User
from app.helpers.rekognition_helper import compare_faces


def authenticate():
    try:
        data = request.get_json()
        username_or_email = data.get('username_or_email')
        password = data.get('password')
        
        # Validar la entrada
        if not username_or_email or not password:
            return jsonify({'message': 'Todos los campos son necesarios.'}), 400
        
        # Buscar el usuario primero por username
        user = User.query.filter_by(username=username_or_email).first()
        
        # Si no se encontró por username, intentar buscar por email
        if not user:
            user = User.query.filter_by(email=username_or_email).first()
        
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404
        
        # Comparar la contraseña
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({'message': 'La contraseña es incorrecta.'}), 401
        
        return jsonify(user.to_dict()), 200   
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def authenticate_with_facial_recognition():
    try:
        username_or_email = request.form.get('username_or_email')
        image = request.files.get('image')

        # Validar la entrada
        if not username_or_email or not image:
            return jsonify({'message': 'Todos los campos son necesarios.'}), 400

        # Buscar el usuario primero por username
        user = User.query.filter_by(username=username_or_email).first()
        
        # Si no se encontró por username, intentar buscar por email
        if not user:
            user = User.query.filter_by(email=username_or_email).first()
        
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404

        # Verificar si el usuario tiene activado el reconocimiento facial
        if not user.login_image:
            return jsonify({'message': 'El reconocimiento facial está desactivado para este usuario.'}), 403

        # Obtener el nombre del bucket de la variable de entorno
        s3_bucket_name = os.getenv('AWS_BUCKET_NAME')

        # Extraer el nombre del objeto S3 desde la URL de image_key del usuario
        s3_object_name = user.image_key.split('/', 3)[-1]

        # Comparar imágenes
        if not compare_faces(image, s3_bucket_name, s3_object_name):
            return jsonify({'message': 'Los rostros no coinciden.'}), 404

        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500
