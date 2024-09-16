import os
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def init_db(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f'mysql+pymysql://{os.getenv('DB_USER')}:'
        f'{os.getenv('DB_PASSWORD')}@'
        f'{os.getenv('DB_HOST')}:'
        f'{os.getenv('DB_PORT')}/'
        f'{os.getenv('DB_NAME')}'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    try:
        with app.app_context():
            db.engine.connect()
        print('Conexión establecida correctamente con la base de datos.')
    except Exception as e:
        print(f'Error al conectar con la base de datos: {e}')
