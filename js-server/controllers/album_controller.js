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

module.exports = {add_album, update_album}