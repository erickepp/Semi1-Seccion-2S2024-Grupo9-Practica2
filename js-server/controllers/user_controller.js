const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const conexion  = require('../conexion/conexion')

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

// Método para agregar un usuario
const addUser = async (req, res) => {
    try {
        const { username, email, password, confirm_password } = req.body;
        const image = req.file;

        // Validar la entrada
        if (!username || !email || !password || !confirm_password || !image) {
            console.log(req.body);
            return res.status(400).json({ message: 'Todos los campos son necesarios.' });
        }

        // Verificar si el nombre de usuario ya existe
        conexion.query('SELECT * FROM Usuario WHERE nombre_usuario = ?', [username], (error, results) => {
            if (error) {
                return res.status(500).json({ message: `Error al verificar el nombre de usuario: ${error.message}` });
            }
            if (results.length > 0) {
                return res.status(400).json({ message: `El nombre de usuario '${username}' ya está en uso.` });
            }

            // Verificar si el correo electrónico ya está en uso
            conexion.query('SELECT * FROM Usuario WHERE correo = ?', [email], (error, results) => {
                if (error) {
                    return res.status(500).json({ message: `Error al verificar el correo electrónico: ${error.message}` });
                }
                if (results.length > 0) {
                    return res.status(400).json({ message: `El correo electrónico '${email}' ya está registrado.` });
                }

                // Verificar que la contraseña y la confirmación coincidan
                if (password !== confirm_password) {
                    return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
                }

                // Encriptar la contraseña del usuario
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) {
                        return res.status(500).json({ message: `Error al encriptar la contraseña: ${err.message}` });
                    }

                    // Llamar al procedimiento almacenado 'AgregarUsuario'
                    conexion.query('CALL AgregarUsuario(?, ?, ?, ?, ?)', 
                        [username, email, hashedPassword, hashedPassword, ''], (error) => {
                            if (error) {
                                return res.status(500).json({ message: `Error al ejecutar el procedimiento almacenado: ${error.message}` });
                            }

                            // Obtener el último ID insertado
                            conexion.query('SELECT LAST_INSERT_ID() AS id_usuario', (err, results) => {
                                if (err) {
                                    return res.status(500).json({ message: `Error al obtener el ID del usuario: ${err.message}` });
                                }

                                const newUserId = results[0].id_usuario;

                                // Subir la imagen al bucket S3
                                uploadFile(image, `Fotos_Perfil/Usuario-${newUserId}/${image.originalname}`)
                                    .then(imageUrl => {
                                        // Actualizar la URL de la imagen del usuario
                                        conexion.query('UPDATE Usuario SET imagen = ? WHERE id_usuario = ?', [imageUrl, newUserId], (err2) => {
                                            if (err2) {
                                                return res.status(500).json({ message: `Error al actualizar la imagen: ${err2.message}` });
                                            }

                                            // Construir el objeto de respuesta
                                            const response = {
                                                user_id: newUserId,
                                                username: username,
                                                email: email,
                                                image: imageUrl,
                                                login_image: false,
                                                image_key: null
                                            };

                                            return res.status(201).json(response);
                                        });
                                    })
                                    .catch(err => res.status(500).json({ message: `Error al subir la imagen: ${err.message}` }));
                            });
                        }
                    );
                });
            });
        });

    } catch (error) {
        return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
    }
};


module.exports = {addUser}