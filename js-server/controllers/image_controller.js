const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const conexion  = require('../conexion/conexion')
const deleteFiles = require('../eliminarS3/eliminar')

dotenv.config();

//Configuracion de las credenciales para AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    //bucketName: process.env.AWS_BUCKET_NAME
});

const s3 = new AWS.S3();
//const upload = multer();
//const router = express.Router();

const nameBucket = process.env.AWS_BUCKET_NAME //nombre del bucket
const region = process.env.AWS_BUCKET_REGION //region

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


//Obtener imagen por ID
const get_image = async (req, res) => {
    try {
        const imageId = req.params.image_id;

        // Consulta a la tabla Imagen para obtener el id del album
        const queryImage = 'SELECT * FROM Imagen WHERE id_imagen = ?';
        const [imageResults] = await conexion.promise().query(queryImage, [imageId]);

        if (imageResults.length === 0) {
            return res.status(404).json({ message: 'Imagen no encontrada' });
        }

        const image = imageResults[0];
        const albumId = image.id_album;

        // Consulta a la tabla Album para obtener el id del usuario
        const queryAlbum = 'SELECT * FROM Album WHERE id_album = ?';
        const [albumResults] = await conexion.promise().query(queryAlbum, [albumId]);

        if (albumResults.length === 0) {
            return res.status(404).json({ message: 'Álbum no encontrado' });
        }

        const album = albumResults[0];
        const userId = album.id_usuario;

        // Consulta a la tabla Usuario para obtener los detalles del usuario
        const queryUser = 'SELECT * FROM Usuario WHERE id_usuario = ?';
        const [userResults] = await conexion.promise().query(queryUser, [userId]);

        if (userResults.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const user = userResults[0];

        // respuesta
        const response = {
            image_id: image.id_imagen,
            name: image.nombre,
            description: image.descripcion,
            url: image.url,
            album: {
                album_id: album.id_album,
                name: album.nombre,
                user: {
                    user_id: user.id_usuario,
                    username: user.nombre_usuario,
                    email: user.correo,
                    image: user.imagen,
                    login_image: user.login_imagen,
                    image_key: user.imagen_clave
                }
            }
        };

        res.status(200).json(response);

    } catch (err) {
        res.status(500).json({ message: `Error en la consulta: ${err.message}` });
    }
};


//Obtener todas las imagenes
const get_images = (req, res) => {
    const queryImages = 'SELECT * FROM Imagen';
    
    conexion.query(queryImages, (err, images) => {
        if (err) {
            return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
        }

        if (images.length === 0) {
            return res.status(404).json({ message: 'No se encontraron imágenes' });
        }

        // Obtener todos los IDs de álbumes
        const albumIds = [...new Set(images.map(image => image.id_album))];
        
        // Consultar álbumes
        const queryAlbums = 'SELECT * FROM Album WHERE id_album IN (?)';
        conexion.query(queryAlbums, [albumIds], (err, albums) => {
            if (err) {
                return res.status(500).json({ message: `Error en la consulta de álbumes: ${err.message}` });
            }

            // Obtener todos los IDs de usuarios
            const userIds = [...new Set(albums.map(album => album.id_usuario))];
            
            // Consultar usuarios
            const queryUsers = 'SELECT * FROM Usuario WHERE id_usuario IN (?)';
            conexion.query(queryUsers, [userIds], (err, users) => {
                if (err) {
                    return res.status(500).json({ message: `Error en la consulta de usuarios: ${err.message}` });
                }

                // Mapear datos para acceso rápido
                const albumMap = new Map(albums.map(album => [album.id_album, album]));
                const userMap = new Map(users.map(user => [user.id_usuario, user]));

                // Combinar la información
                const response = images.map(image => {
                    const album = albumMap.get(image.id_album);
                    const user = userMap.get(album.id_usuario);

                    return {
                        image_id: image.id_imagen,
                        name: image.nombre,
                        description: image.descripcion,
                        url: image.url,
                        album: {
                            album_id: album.id_album,
                            name: album.nombre,
                            user: {
                                user_id: user.id_usuario,
                                username: user.nombre_usuario,
                                email: user.correo,
                                image: user.imagen,
                                login_image: user.login_imagen,
                                image_key: user.imagen_clave
                            }
                        }
                    };
                });

                res.status(200).json(response);
            });
        });
    });
};


//Agregar imagenes
const add_image = async (req, res) => {
    try {
        const { name, description, album_id } = req.body;

        // Verificar que todos los campos
        if (!name || !description || !album_id || !req.file) {
            return res.status(400).json({ message: 'Todos los campos son necesarios.' });
        }

        const albumId = parseInt(album_id, 10);

        // Obtener el álbum
        const getAlbumQuery = 'SELECT * FROM Album WHERE id_album = ?';
        const [albumResults] = await conexion.promise().query(getAlbumQuery, [albumId]);

        if (!albumResults || albumResults.length === 0) {
            return res.status(404).json({ message: 'Álbum no encontrado.' });
        }

        const album = albumResults[0];

        // Verificar si se pueden subir imágenes al álbum
        const getFirstAlbumQuery = 'SELECT * FROM Album WHERE id_usuario = ? ORDER BY id_album LIMIT 1';
        const [firstAlbumResults] = await conexion.promise().query(getFirstAlbumQuery, [album.id_usuario]);

        if (!firstAlbumResults || firstAlbumResults.length === 0) {
            return res.status(404).json({ message: 'No se encontraron álbumes para este usuario.' });
        }

        if (firstAlbumResults[0].id_album === albumId) {
            return res.status(403).json({ message: `El álbum "${album.nombre}" no permite subir imágenes.` });
        }

        // Subir la imagen al bucket S3
        const prefix = `Fotos_Publicadas/Usuario-${album.id_usuario}/Album-${albumId}`;
        const imageFile = req.file;
        const filePath = `${prefix}/${imageFile.originalname}`;
        const imageUrl = `https://${nameBucket}.s3.${region}.amazonaws.com/${filePath}`;

        await uploadFile(imageFile, filePath);

        // Insertar la imagen en la base de datos
        const addImageQuery = 'INSERT INTO Imagen (nombre, descripcion, url, id_album) VALUES (?, ?, ?, ?)';
        const [insertResult] = await conexion.promise().query(addImageQuery, [name, description, imageUrl, albumId]);

        if (!insertResult) {
            return res.status(500).json({ message: 'Error al agregar la imagen.' });
        }

        // Obtener la nueva imagen para respuesta
        const newImageId = insertResult.insertId;
        const getImageQuery = 'SELECT * FROM Imagen WHERE id_imagen = ?';
        const [newImageResults] = await conexion.promise().query(getImageQuery, [newImageId]);

        if (!newImageResults || newImageResults.length === 0) {
            return res.status(404).json({ message: 'Imagen no encontrada después de la inserción.' });
        }

        const newImage = newImageResults[0];

        // Obtener información del álbum y del usuario relacionado
        const getAlbumUserQuery = `
            SELECT 
                a.id_album, a.nombre AS album_name, u.id_usuario AS user_id, u.nombre_usuario, u.correo, u.imagen AS image, u.login_imagen, u.imagen_clave 
            FROM Album a 
            JOIN Usuario u ON a.id_usuario = u.id_usuario 
            WHERE a.id_album = ?`;
        const [albumUserInfo] = await conexion.promise().query(getAlbumUserQuery, [albumId]);

        if (!albumUserInfo || albumUserInfo.length === 0) {
            return res.status(404).json({ message: 'Álbum o usuario no encontrado.' });
        }

        const albumInfo = albumUserInfo[0];
        //console.log(albumInfo)

        // Responder con la nueva imagen agregada y detalles del álbum y usuario
        return res.status(201).json({
            image_id: newImage.id_imagen,
            name: newImage.nombre,
            description: newImage.descripcion,
            url: newImage.url,
            album: {
                album_id: albumInfo.id_album,
                name: albumInfo.album_name,
                user: {
                    user_id: albumInfo.user_id,
                    username: albumInfo.nombre_usuario,
                    email: albumInfo.correo,
                    image: albumInfo.image, //? `https://${nameBucket}.s3.amazonaws.com/${albumInfo.image}` : null,
                    login_image: albumInfo.login_imagen,
                    image_key: albumInfo.imagen_clave
                }
            }
        });
    } catch (err) {
        return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
    }
};




module.exports = {add_image,get_images,get_image}