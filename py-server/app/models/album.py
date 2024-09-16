from config.db import db


class Album(db.Model):
    __tablename__ = 'Album'
    
    album_id = db.Column('id_album', db.Integer, primary_key=True, autoincrement=True)
    name = db.Column('nombre', db.Text, nullable=False)
    user_id = db.Column('id_usuario', db.Integer, db.ForeignKey('Usuario.id_usuario'), nullable=False)
    
    # Relación con Image
    images = db.relationship('Image', backref='album', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_user=True, include_images=False):
        data = {
            'album_id': self.album_id,
            'name': self.name
        }
        if include_user:
            data['user'] = self.user.to_dict()
        if include_images:
            data['images'] = [image.to_dict(include_album=False) for image in self.images]
        return data
