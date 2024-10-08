import bcrypt
from flask import request, jsonify
from app.models.user import User
from app.models.album import Album
from app.models.image import Image
from app.helpers.s3_helper import upload_file, delete_files
from config.db import db


def get_users():
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def get_user(user_id):
    try:
        user = User.query.get(user_id)
        if user:
            return jsonify(user.to_dict()), 200
        else:
            return jsonify({'message': 'Usuario no encontrado.'}), 404
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def add_user():
    try:
        data = request.form
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        image = request.files.get('image')

        # Validar la entrada
        if not all([username, email, password, confirm_password, image]):
            return jsonify({'message': 'Todos los campos son necesarios.'}), 400
        
        # Verificar si el username ya existe
        if db.session.query(User).filter(User.username == username).first():
            return jsonify({'message': 'El nombre de usuario ya está en uso.'}), 400
        
        # Verificar si el email ya existe
        if db.session.query(User).filter(User.email == email).first():
            return jsonify({'message': 'El correo electrónico ya está en uso.'}), 400
        
         # Verificar que la contraseña y la confirmación coincidan
        if password != confirm_password:
            return jsonify({'message': 'Las contraseñas no coinciden.'}), 400

        # Encriptar la contraseña del usuario
        hashed_password_bytes = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        hashed_password = hashed_password_bytes.decode('utf-8')

        # Crear y agregar el nuevo usuario a la base de datos
        new_user = User(
            username=username,
            email=email,
            password=hashed_password,
            confirm_password=hashed_password,
            image=''
        )
        db.session.add(new_user)
        db.session.commit()
        
        # Subir la imagen al bucket S3
        prefix = f'Fotos_Perfil/Usuario-{new_user.user_id}'
        image_url = upload_file(image, f'{prefix}/{image.filename}')
            
        # Asignar la URL de la imagen al campo 'image' del usuario
        new_user.image = image_url
        db.session.commit()

        # Crear un nuevo álbum para el usuario
        new_album = Album(
            name='Fotos de perfil',
            user_id=new_user.user_id
        )
        db.session.add(new_album)
        db.session.commit()
            
        # Crear un nuevo registro de imagen en el álbum creado
        new_image = Image(
            name='Foto de perfil inicial',
            description='Foto de la creación del usuario',
            url=image_url,
            album_id=new_album.album_id
        )
        db.session.add(new_image)
        db.session.commit()

        return jsonify(new_user.to_dict()), 201
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def update_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404

        data = request.form
        username = data.get('username')
        email = data.get('email')
        image = request.files.get('image')
        password = data.get('password')

        # Verificar si la contraseña fue proporcionada
        if not password:
            return jsonify({'message': 'Se requiere la contraseña.'}), 400
        
        # Validar la contraseña del usuario
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({'message': 'La contraseña es incorrecta.'}), 400

        if username:
             # Verificar si el username ya existe
            if db.session.query(User).filter(User.username == username).first():
                return jsonify({'message': 'El nombre de usuario ya está en uso.'}), 400
            user.username = username
        if email:
            # Verificar si el email ya existe
            if db.session.query(User).filter(User.email == email).first():
                return jsonify({'message': 'El correo electrónico ya está en uso.'}), 400
            user.email = email
        if image:
            # Buscar el primer álbum asociado al usuario
            album = Album.query.filter_by(user_id=user_id).first()
            if not album:
                return jsonify({'message': 'Álbum no encontrado.'}), 404
            
            # Subir la imagen al bucket S3
            prefix = f'Fotos_Perfil/Usuario-{user.user_id}'
            image_url = upload_file(image, f'{prefix}/{image.filename}')
            user.image = image_url

            # Crear un nuevo registro de imagen en el álbum de fotos de perfil
            new_image = Image(
                name='Foto de perfil',
                description='Foto actualizada',
                url=image_url,
                album_id=album.album_id
            )
            db.session.add(new_image)

        db.session.commit()

        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def update_facial_recognition(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404

        data = request.form
        status_str = data.get('status')
        image_key = request.files.get('image_key')
        password = data.get('password')

        # Verificar si el eatado fue proporcionado
        if not status_str:
            return jsonify({'message': 'El estado (0 o 1) es requerido.'}), 400
        
        # Castear el estado a entero
        try:
            status = int(status_str)
        except ValueError:
            return jsonify({'message': 'El estado debe ser un número (0 o 1).'}), 400

        # Verificar si la contraseña fue proporcionada
        if not password:
            return jsonify({'message': 'Se requiere la contraseña.'}), 400
        
        # Validar la contraseña del usuario
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({'message': 'La contraseña es incorrecta.'}), 400
        
        if status == 0:
            # Desactivar reconocimiento facial
            user.login_image = False
            user.image_key = None
            
            message = 'Reconocimiento facial desactivado.'
        elif status == 1:
             # Verificar si la imagen clave fue proporcionada
            if not image_key:
                return jsonify({'message': 'Se requiere la imagen clave.'}), 400

            # Subir la imagen al bucket S3
            prefix = f'Fotos_Reconocimiento_Facial/Usuario-{user.user_id}'
            image_url = upload_file(image_key, f'{prefix}/{image_key.filename}')
                
            # Actualizar el estado del login_image y image_key
            user.login_image = True
            user.image_key = image_url

            message = 'Reconocimiento facial activado.'
        else:
            return jsonify({'message': 'El valor del estado no es válido. Debe ser 0 o 1.'}), 400

        db.session.commit()
        
        return jsonify({'message': message, 'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def update_image_key(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404
        
        # Verificar si el usuario tiene activado el reconocimiento facial
        if not user.login_image:
            return jsonify({'message': 'El reconocimiento facial está desactivado para este usuario.'}), 403

        image_key = request.files.get('image_key')
        password = request.form.get('password')

        # Verificar si la imagen clave fue proporcionada
        if not image_key:
            return jsonify({'message': 'Se requiere la imagen clave.'}), 400

        # Verificar si la contraseña fue proporcionada
        if not password:
            return jsonify({'message': 'Se requiere la contraseña.'}), 400
        
        # Validar la contraseña del usuario
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({'message': 'La contraseña es incorrecta.'}), 400
        
        # Subir la imagen al bucket S3
        prefix = f'Fotos_Reconocimiento_Facial/Usuario-{user.user_id}'
        image_url = upload_file(image_key, f'{prefix}/{image_key.filename}')
            
        # Actualizar el campo image_key del usuario
        user.image_key = image_url
        db.session.commit()

        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500


def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'Usuario no encontrado.'}), 404
        
        data = request.get_json()
        password = data.get('password')

        # Verificar si la contraseña fue proporcionada
        if not password:
            return jsonify({'message': 'Se requiere la contraseña.'}), 400
        
        # Validar la contraseña del usuario
        if not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({'message': 'La contraseña es incorrecta.'}), 400
        
        # Eliminar las imagenes de perfil del usuario del bucket S3
        prefix = f'Fotos_Perfil/Usuario-{user_id}'
        delete_files(prefix)

        # Eliminar los álbumes del usuario del bucket S3
        prefix = f'Fotos_Publicadas/Usuario-{user_id}'
        delete_files(prefix)

        # Eliminar las imagenes de reconocimiento facial del usuario del bucket S3
        prefix = f'Fotos_Reconocimiento_Facial/Usuario-{user_id}'
        delete_files(prefix)

        # Eliminar el usuario de la base de datos
        db.session.delete(user)
        db.session.commit()

        return jsonify({'message': 'Usuario eliminado exitosamente.'}), 200
    except Exception as e:
        return jsonify({'message': f'Error interno del servidor: {str(e)}'}), 500
