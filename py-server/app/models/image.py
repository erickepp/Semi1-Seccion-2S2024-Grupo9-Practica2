from config.db import db


class Image(db.Model):
    __tablename__ = 'Imagen'
    
    image_id = db.Column('id_imagen', db.Integer, primary_key=True, autoincrement=True)
    name = db.Column('nombre', db.String(100), nullable=False)
    description = db.Column('descripcion', db.Text, nullable=False)
    url = db.Column('url', db.Text, nullable=False)
    album_id = db.Column('id_album', db.Integer, db.ForeignKey('Album.id_album'), nullable=False)
    
    def to_dict(self, include_album=True):
        data = {
            'image_id': self.image_id,
            'name': self.name,
            'description': self.description,
            'url': self.url
        }
        if include_album:
            data['album'] = self.album.to_dict()
        return data
