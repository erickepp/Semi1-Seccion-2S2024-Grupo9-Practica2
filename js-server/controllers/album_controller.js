const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const conexion  = require('../conexion/conexion')
const deleteFiles = require('../eliminarS3/eliminar');
const { use } = require('../routes/album_route');

dotenv.config();

//Configuracion de las credenciales para AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    //bucketName: process.env.AWS_BUCKET_NAME
});

const s3 = new AWS.S3();
const upload = multer();
const router = express.Router();

//Funcion para subir archivos a S3
const uploadFile =  (file, filePath) =>{
    const parametros = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: filePath,
        Body: file.buffer,
        ContentType: file.mimetype
    };
    return s3.upload(parametros).promise().then(data => data.Location).catch(err =>{
        throw new Error(`Error al subir archivo a S3: ${err.message}`);
    });
    
};


const get_albums = (req, res) => {
    try {
        // Consultar todos los álbumes con información del usuario
        const query = `
            SELECT a.id_album AS album_id, a.nombre AS album_name, 
                   u.id_usuario AS user_id, u.nombre_usuario, u.correo, u.imagen AS user_image, u.login_imagen AS l_imagen, u.imagen_clave AS clave_i 
            FROM Album a
            JOIN Usuario u ON a.id_usuario = u.id_usuario
        `;

        conexion.query(query, (err, albumResults) => {
            if (err) {
                return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
            }

            // Inicializar una lista para los álbumes
            //console.log(albumResults)
            const albums = albumResults.map(album => ({
                
                album_id: album.album_id,
                name: album.album_name,
                user: {
                    user_id: album.user_id,
                    username: album.nombre_usuario,
                    email: album.correo,
                    image: album.user_image,
                    login_image: album.l_imagen, 
                    image_key: album.clave_i 
                },
                images: [] // Inicializar la lista de imágenes
            }));

            // Obtener imágenes para cada álbum
            const getImagesForAlbum = (album, callback) => {
                const imageQuery = 'SELECT * FROM Imagen WHERE id_album = ?';
                conexion.query(imageQuery, [album.album_id], (err, imageResults) => {
                    if (err) return callback(err);

                    album.images = imageResults.map(image => ({
                        image_id: image.id_imagen,
                        name: image.nombre,
                        description: image.descripcion,
                        url: image.url
                    }));

                    callback(null);
                });
            };

            // Usar un contador para asegurarnos de que todas las imágenes se han cargado
            let remainingAlbums = albums.length;

            if (remainingAlbums === 0) {
                return res.status(200).json(albums);
            }

            albums.forEach(album => {
                getImagesForAlbum(album, (err) => {
                    if (err) {
                        return res.status(500).json({ message: `Error al obtener imágenes: ${err.message}` });
                    }

                    remainingAlbums--;

                    // Cuando todos los álbumes han sido procesados
                    if (remainingAlbums === 0) {
                        return res.status(200).json(albums);
                    }
                });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
    }
};

const get_albums_by_user = (req, res) => {
    const userId = req.params.user_id;

    try {
        // Consultar el usuario por ID
        const userQuery = 'SELECT * FROM Usuario WHERE id_usuario = ?';
        conexion.query(userQuery, [userId], (err, userResults) => {
            if (err) {
                return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
            }

            if (userResults.length === 0) {
                return res.status(404).json({ message: 'Usuario no encontrado.' });
            }

            const user = userResults[0];
            //console.log(user)

            // Preparar la estructura del usuario
            const userData = {
                user_id: user.id_usuario,
                username: user.nombre_usuario,
                email: user.correo,
                image: user.imagen,
                login_image: user.login_imagen, // Ajusta según la lógica
                image_key: user.imagen_clave, // Ajusta según la lógica
                albums: []
            };

            // Consultar álbumes del usuario
            const albumsQuery = 'SELECT a.id_album AS album_id, a.nombre AS album_name FROM Album a WHERE a.id_usuario = ?';
            conexion.query(albumsQuery, [userId], (err, albumResults) => {
                if (err) {
                    return res.status(500).json({ message: `Error al obtener álbumes: ${err.message}` });
                }

                // Obtener imágenes para cada álbum
                const getImagesForAlbum = (albumId, callback) => {
                    const imagesQuery = 'SELECT * FROM Imagen WHERE id_album = ?';
                    conexion.query(imagesQuery, [albumId], (err, imageResults) => {
                        if (err) return callback(err);

                        const images = imageResults.map(image => ({
                            image_id: image.id_imagen,
                            name: image.nombre,
                            description: image.descripcion,
                            url: image.url
                        }));

                        callback(null, images);
                    });
                };

                let remainingAlbums = albumResults.length;

                if (remainingAlbums === 0) {
                    return res.status(200).json(userData);
                }

                albumResults.forEach(album => {
                    const albumData = {
                        album_id: album.album_id,
                        name: album.album_name,
                        images: []
                    };

                    getImagesForAlbum(album.album_id, (err, images) => {
                        if (err) {
                            return res.status(500).json({ message: `Error al obtener imágenes: ${err.message}` });
                        }

                        albumData.images = images;
                        userData.albums.push(albumData);
                        remainingAlbums--;

                        // Cuando todos los álbumes han sido procesados
                        if (remainingAlbums === 0) {
                            return res.status(200).json(userData);
                        }
                    });
                });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
    }
};

const get_album = (req, res) => {
    const albumId = req.params.album_id;

    try {
        // Consultar el álbum por ID
        const albumQuery = 'SELECT * FROM Album WHERE id_album = ?';
        conexion.query(albumQuery, [albumId], (err, albumResults) => {
            if (err) {
                return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
            }

            if (albumResults.length === 0) {
                return res.status(404).json({ message: 'Álbum no encontrado.' });
            }

            const album = albumResults[0];

            // Preparar la estructura del álbum
            const albumData = {
                album_id: album.id_album,
                name: album.nombre,
                user: {},
                images: []
            };

            // Consultar el usuario del álbum
            const userQuery = 'SELECT * FROM Usuario WHERE id_usuario = ?';
            conexion.query(userQuery, [album.id_usuario], (err, userResults) => {
                if (err) {
                    return res.status(500).json({ message: `Error al obtener el usuario: ${err.message}` });
                }

                if (userResults.length > 0) {
                    const user = userResults[0];
                    //console.log(user)
                    albumData.user = {
                        user_id: user.id_usuario,
                        username: user.nombre_usuario,
                        email: user.correo,
                        image: user.imagen,
                        login_image: user.login_imagen, // Ajusta según la lógica
                        image_key: user.imagen_clave // Ajusta según la lógica
                    };
                }

                // Consultar imágenes del álbum
                const imagesQuery = 'SELECT * FROM Imagen WHERE id_album = ?';
                conexion.query(imagesQuery, [albumId], (err, imageResults) => {
                    if (err) {
                        return res.status(500).json({ message: `Error al obtener imágenes: ${err.message}` });
                    }

                    albumData.images = imageResults.map(image => ({
                        image_id: image.id_imagen,
                        name: image.nombre,
                        description: image.descripcion,
                        url: image.url
                    }));

                    // Devolver el álbum completo
                    return res.status(200).json(albumData);
                });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
    }
};





const add_album = (req, res) => {
    const { name, user_id } = req.body;

    // Validar la entrada
    if (!name || !user_id) {
        return res.status(400).json({ message: 'Todos los campos son necesarios.' });
    }

    // Query para insertar el álbum
    const insertQuery = 'INSERT INTO Album (nombre, id_usuario) VALUES (?, ?)';

    // Ejecutar la inserción
    conexion.query(insertQuery, [name, user_id], (insertError, insertResults) => {
        if (insertError) {
            return res.status(500).json({ message: `Error interno del servidor al crear el álbum: ${insertError.message}` });
        }

        // Obtener el ID del álbum recién creado usando LAST_INSERT_ID()
        const lastInsertIdQuery = 'SELECT LAST_INSERT_ID() AS album_id';

        conexion.query(lastInsertIdQuery, (lastInsertError, lastInsertResults) => {
            if (lastInsertError) {
                return res.status(500).json({ message: `Error al obtener el ID del álbum: ${lastInsertError.message}` });
            }

            const albumId = lastInsertResults[0].album_id;

            // Query para obtener los detalles del usuario
            const userQuery = 'SELECT id_usuario AS user_id, nombre_usuario AS username, correo AS email, imagen, login_imagen, imagen_clave FROM Usuario WHERE id_usuario = ?';

            conexion.query(userQuery, [user_id], (userError, userResults) => {
                if (userError) {
                    return res.status(500).json({ message: `Error al obtener la información del usuario: ${userError.message}` });
                }

                if (userResults.length === 0) {
                    return res.status(404).json({ message: 'Usuario no encontrado.' });
                }

                const user = userResults[0];

                // Formatear la respuesta
                const response = {
                    album_id: albumId,
                    name: name,
                    user: {
                        user_id: user.user_id,
                        username: user.username,
                        email: user.email,
                        image: user.imagen,
                        login_image: user.login_imagen,
                        image_key: user.imagen_clave
                    }
                };

                return res.status(201).json(response);
            });
        });
    });
};



const update_album = (req, res) => {
    const albumId = req.params.album_id;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Se requiere el nombre.' });
    }

    // Llamar al procedimiento almacenado para modificar el nombre del álbum
    const modifyAlbumQuery = 'CALL ModificarNombreAlbum(?, ?)';
    conexion.query(modifyAlbumQuery, [albumId, name], (error) => {
        if (error) {
            return res.status(500).json({ message: `Error al modificar el nombre del álbum: ${error.message}` });
        }

        // Después de modificar, obtener el álbum actualizado con el usuario y formatearlo
        const getAlbumQuery = `
            SELECT a.id_album, a.nombre AS nombre, u.id_usuario, u.nombre_usuario, u.correo, u.imagen, u.login_imagen, u.imagen_clave 
            FROM Album a 
            JOIN Usuario u ON a.id_usuario = u.id_usuario
            WHERE a.id_album = ?;
        `;

        conexion.query(getAlbumQuery, [albumId], (error, results) => {
            if (error) {
                return res.status(500).json({ message: `Error al obtener el álbum actualizado: ${error.message}` });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Álbum no encontrado.' });
            }

            const album = results[0];

            // Formatear la respuesta para incluir la estructura esperada
            const formattedResponse = {
                album_id: album.id_album,
                name: album.nombre,
                user: {
                    user_id: album.id_usuario,
                    username: album.nombre_usuario,
                    email: album.correo,
                    image: album.imagen,
                    login_image: album.login_imagen,
                    image_key: album.imagen_clave
                },
                images: []  // Asumiendo que no hay imágenes en este punto
            };

            // Devolver el álbum modificado en el formato solicitado
            return res.status(200).json(formattedResponse);
        });
    });
};

const delete_album = async (req, res) => {
    const album_id = req.params.album_id;

    try {
        // Buscar el álbum por ID
        const queryAlbum = 'SELECT * FROM Album WHERE id_album = ?';
        conexion.query(queryAlbum, [album_id], (err, results) => {
            if (err) {
                return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Álbum no encontrado.' });
            }

            const album = results[0];

            // Verificar si es el primer álbum del usuario
            const queryFirstAlbum = 'SELECT * FROM Album WHERE id_usuario = ? ORDER BY id_album LIMIT 1';
            conexion.query(queryFirstAlbum, [album.id_usuario], (err, firstAlbumResults) => {
                if (err) {
                    return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
                }

                // Validar que haya un primer álbum
                if (firstAlbumResults.length > 0) {
                    const firstAlbum = firstAlbumResults[0];

                    // Comprobar si el álbum que se intenta eliminar es el primer álbum del usuario
                    if (firstAlbum && firstAlbum.id_album === album.id_album) {
                        return res.status(403).json({ message: `El álbum "${album.nombre}" no se puede eliminar porque es el primer álbum del usuario.` });
                    }
                }

                // Eliminar archivos del bucket S3
                const prefix = `Fotos_Publicadas/Usuario-${album.id_usuario}/Album-${album_id}`;
                deleteFiles.delete_files(prefix)
                    .then(() => {
                        // Llamar al procedimiento almacenado para eliminar el álbum
                        const deleteAlbumProcedure = 'CALL EliminarAlbum(?)';
                        conexion.query(deleteAlbumProcedure, [album_id], (err) => {
                            if (err) {
                                return res.status(500).json({ message: `Error en la eliminación del álbum: ${err.message}` });
                            }

                            return res.status(200).json({ message: 'Álbum eliminado exitosamente.' });
                        });
                    })
                    .catch((err) => {
                        return res.status(500).json({ message: `Error eliminando archivos en S3: ${err.message}` });
                    });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
    }
};


module.exports = {add_album, update_album, delete_album,get_albums, get_albums_by_user,get_album}