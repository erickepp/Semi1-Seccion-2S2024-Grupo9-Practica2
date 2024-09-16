import bcrypt
from flask import request, jsonify
from app.models.user import User


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
