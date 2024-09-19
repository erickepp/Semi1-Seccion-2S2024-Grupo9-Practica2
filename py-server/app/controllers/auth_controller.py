import bcrypt
from flask import request, jsonify
from app.models.user import User
from app.helpers.s3_helper import get_file
from app.helpers.rekognition_helper import get_face_count, compare_faces


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
        image = request.files.get('image')

        # Validar la entrada
        if not image:
            return jsonify({'message': 'No se proporcionó ninguna imagen.'}), 400

        # Obtener el número de rostros detectados
        face_count = get_face_count(image)

        if face_count != 1:
            return jsonify({
                    'message': f'La imagen debe contener exactamente un rostro. Detectados: {face_count}'
            }), 400
        
        # Obtener todos los usuarios con autenticación facial activada
        users = User.query.filter_by(login_image=True).all()
        
        # Comparar la imagen con las imágenes de los usuarios
        for user in users:
            image_key = get_file(user.image_key)
            
            # Comparar imágenes
            if compare_faces(image, image_key):
                return jsonify(user.to_dict()), 200
        
        # Si no se encontró ninguna coincidencia
        return jsonify({'message': 'Usuario no encontrado.'}), 404
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500
