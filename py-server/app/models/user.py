from config.db import db


class User(db.Model):
    __tablename__ = 'Usuario'
    
    user_id = db.Column('id_usuario', db.Integer, primary_key=True, autoincrement=True)
    username = db.Column('nombre_usuario', db.String(100), nullable=False, unique=True)
    email = db.Column('correo', db.String(100), nullable=False, unique=True)
    password = db.Column('pass', db.String(100), nullable=False)
    confirm_password = db.Column('confirmacion_pass', db.String(100), nullable=False)
    image = db.Column('imagen', db.Text, nullable=False)
    login_image = db.Column('login_imagen', db.Boolean, default=False)
    image_key = db.Column('imagen_clave', db.Text)

    # Relación con Album
    albums = db.relationship('Album', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_albums=False):
        data = {
            'user_id': self.user_id,
            'username': self.username,
            'email': self.email,
            'image': self.image,
            'login_image': self.login_image,
            'image_key': self.image_key
        }
        if include_albums:
            data['albums'] = [album.to_dict(include_user=False) for album in self.albums]
        return data
