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



// Función para obtener un usuario específico por ID
const get_user = (req, res) => {
    const userId = req.params.user_id;

    // Consulta para obtener el usuario por ID
    conexion.query('SELECT * FROM Usuario WHERE id_usuario = ?', [userId], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
        }

        // Verificar si se encontró el usuario
        if (results.length > 0) {
            const user = results[0]; 
            
            if (user.login_image == 0){

            }
            return res.status(200).json({
                user_id: user.id_usuario,
                username: user.nombre_usuario, 
                email: user.correo, 
                image: user.imagen, 
                login_image: user.login_imagen, 
                image_key: user.imagen_clave 
            });
        } else {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
    });
};


// Función para obtener todos los usuarios
const get_users = (req, res) => {
    // Consulta para obtener todos los usuarios
    conexion.query('SELECT * FROM Usuario', (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
        }

        // Transformar los resultados en el formato deseado
        const users = results.map(user => ({
            user_id: user.id_usuario, 
            username: user.nombre_usuario, 
            email: user.correo, 
            image: user.imagen, 
            login_image: user.login_imagen, 
            image_key: user.imagen_clave
        }));

        return res.status(200).json(users);
    });
};



// Método para agregar un usuario
const addUser = (req, res) => {
    const { username, email, password, confirm_password } = req.body;
    const image = req.file;

    // Validar la entrada
    if (!username || !email || !password || !confirm_password || !image) {
        return res.status(400).json({ message: 'Todos los campos son necesarios.' });
    }

    // Verificar que las contraseñas coincidan
    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
    }

    // Verificar si el nombre de usuario ya existe
    conexion.query('SELECT * FROM Usuario WHERE nombre_usuario = ?', [username], (error, userResults) => {
        if (error) return res.status(500).json({ message: `Error al verificar el nombre de usuario: ${error.message}` });
        if (userResults.length > 0) {
            return res.status(400).json({ message: `El nombre de usuario '${username}' ya está en uso.` });
        }

        // Verificar si el correo electrónico ya está en uso
        conexion.query('SELECT * FROM Usuario WHERE correo = ?', [email], (error, emailResults) => {
            if (error) return res.status(500).json({ message: `Error al verificar el correo: ${error.message}` });
            if (emailResults.length > 0) {
                return res.status(400).json({ message: `El correo electrónico '${email}' ya está registrado.` });
            }

            // Encriptar la contraseña
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) return res.status(500).json({ message: `Error al encriptar la contraseña: ${err.message}` });

                // Llamar al procedimiento almacenado 'AgregarUsuario'
                conexion.query('CALL AgregarUsuario(?, ?, ?, ?, ?)', 
                    [username, email, hashedPassword, hashedPassword, ''], (error) => {
                    if (error) return res.status(500).json({ message: `Error al agregar el usuario: ${error.message}` });

                    // Obtener el ID del nuevo usuario
                    conexion.query('SELECT LAST_INSERT_ID() AS id_usuario', (error, idResults) => {
                        if (error) return res.status(500).json({ message: `Error al obtener el ID del usuario: ${error.message}` });
                        const newUserId = idResults[0].id_usuario;

                        // Subir la imagen a S3
                        uploadFile(image, `Fotos_Perfil/Usuario-${newUserId}/${image.originalname}`)
                            .then(imageUrl => {
                                // Actualizar la URL de la imagen en la tabla 'Usuario'
                                conexion.query('UPDATE Usuario SET imagen = ? WHERE id_usuario = ?', [imageUrl, newUserId], (error) => {
                                    if (error) return res.status(500).json({ message: `Error al actualizar la imagen: ${error.message}` });

                                    // Crear el álbum para el usuario
                                    conexion.query('CALL CrearAlbum(?, ?)', ['Fotos de perfil', newUserId], (error) => {
                                        if (error) return res.status(500).json({ message: `Error al crear el álbum: ${error.message}` });

                                        // Obtener el ID del álbum
                                        conexion.query('SELECT LAST_INSERT_ID() AS id_album', (error, albumResults) => {
                                            if (error) return res.status(500).json({ message: `Error al obtener el ID del álbum: ${error.message}` });
                                            const newAlbumId = albumResults[0].id_album;

                                            // Agregar la imagen al álbum
                                            conexion.query('CALL AgregarImagen(?, ?, ?, ?)', 
                                                ['Foto de perfil inicial', 'Foto de la creación del usuario', imageUrl, newAlbumId], (error) => {
                                                if (error) return res.status(500).json({ message: `Error al agregar la imagen: ${error.message}` });

                                                // Responder con los datos del usuario y la imagen
                                                return res.status(201).json({
                                                    user_id: newUserId,
                                                    username: username,
                                                    email: email,
                                                    image: imageUrl,
                                                    login_image: false,
                                                    image_key: null

                                                });
                                            });
                                        });
                                    });
                                });
                            })
                            .catch(err => res.status(500).json({ message: `Error al subir la imagen: ${err.message}` }));
                    });
                });
            });
        });
    });
};

//Metodo para actulizar los datos del usuario
const update_user = (req, res) => {
    const userId = parseInt(req.params.user_id, 10);
    const { username, email, password } = req.body;
    const image = req.file;

    if (!userId) {
        return res.status(400).json({ message: 'ID de usuario inválido.' });
    }

    if (!password) {
        return res.status(400).json({ message: 'Se requiere la contraseña.' });
    }

    // Obtener el usuario actual
    conexion.query('SELECT * FROM Usuario WHERE id_usuario = ?', [userId], (error, userResults) => {
        if (error) {
            return res.status(500).json({ message: `Error al obtener el usuario: ${error.message}` });
        }
        if (userResults.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const user = userResults[0];

        // Verificar la contraseña
        bcrypt.compare(password, user.pass, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: `Error al verificar la contraseña: ${err.message}` });
            }
            if (!isMatch) {
                return res.status(400).json({ message: 'La contraseña es incorrecta.' });
            }

            // Función para actualizar el nombre de usuario
            const updateUsername = () => {
                return new Promise((resolve, reject) => {
                    if (username) {
                        conexion.query('SELECT * FROM Usuario WHERE nombre_usuario = ? AND id_usuario != ?', [username, userId], (error, results) => {
                            if (error) return reject({ message: `Error al verificar el nombre de usuario: ${error.message}` });
                            if (results.length > 0) return reject({ message: 'El nombre de usuario ya está en uso.' });

                            conexion.query('UPDATE Usuario SET nombre_usuario = ? WHERE id_usuario = ?', [username, userId], (error) => {
                                if (error) return reject({ message: `Error al actualizar el nombre de usuario: ${error.message}` });
                                resolve();
                            });
                        });
                    } else {
                        resolve();
                    }
                });
            };

            // Función para actualizar el correo electrónico
            const updateEmail = () => {
                return new Promise((resolve, reject) => {
                    if (email) {
                        conexion.query('SELECT * FROM Usuario WHERE correo = ? AND id_usuario != ?', [email, userId], (error, results) => {
                            if (error) return reject({ message: `Error al verificar el correo electrónico: ${error.message}` });
                            if (results.length > 0) return reject({ message: 'El correo electrónico ya está en uso.' });

                            conexion.query('UPDATE Usuario SET correo = ? WHERE id_usuario = ?', [email, userId], (error) => {
                                if (error) return reject({ message: `Error al actualizar el correo electrónico: ${error.message}` });
                                resolve();
                            });
                        });
                    } else {
                        resolve();
                    }
                });
            };

            // Función para manejar la carga de imagen
            const handleImageUpload = () => {
                return new Promise((resolve, reject) => {
                    if (image) {
                        const prefix = `Fotos_Perfil/Usuario-${userId}`;
                        uploadFile(image, `${prefix}/${image.originalname}`)
                            .then(imageUrl => {
                                conexion.query('UPDATE Usuario SET imagen = ? WHERE id_usuario = ?', [imageUrl, userId], (error) => {
                                    if (error) return reject({ message: `Error al actualizar la imagen: ${error.message}` });

                                    conexion.query('INSERT INTO Imagen (nombre, descripcion, url, id_album) VALUES (?, ?, ?, ?)',
                                        ['Foto de perfil', 'Foto actualizada', imageUrl, newAlbumId], (error) => {
                                            if (error) return reject({ message: `Error al agregar la imagen: ${error.message}` });
                                            resolve({ imageUrl });
                                        });
                                });
                            })
                            .catch(err => reject({ message: `Error al subir la imagen: ${err.message}` }));
                    } else {
                        resolve({});
                    }
                });
            };

            // Ejecutar todas las actualizaciones y manejar la respuesta final
            Promise.all([updateUsername(), updateEmail(), handleImageUpload()])
                .then(results => {
                    const imageUrl = results[2]?.imageUrl || user.imagen;

                    res.status(200).json({
                        user_id: userId,
                        username: username || user.nombre_usuario,
                        email: email || user.correo,
                        image: imageUrl,
                        login_image: false,
                        image_key: null
                    });
                })
                .catch(err => {
                    res.status(500).json({ message: err.message });
                });
        });
    });
};


// Función para eliminar un usuario
const delete_user_route = (req, res) => {
    const userId = req.params.user_id;
    const { password } = req.body;

    // Verificar si el usuario existe
    conexion.query('SELECT * FROM Usuario WHERE id_usuario = ?', [userId], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
        }

        const user = results[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Verificar si la contraseña fue proporcionada
        if (!password) {
            return res.status(400).json({ message: 'Se requiere la contraseña.' });
        }

        // Validar la contraseña del usuario
        bcrypt.compare(password, user.pass, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: `Error interno del servidor: ${err.message}` });
            }

            if (!result) {
                return res.status(400).json({ message: 'La contraseña es incorrecta.' });
            }

            // Eliminar las imágenes de perfil del usuario del bucket S3
            const prefix = `Fotos_Perfil/Usuario-${userId}`;
            deleteFiles(prefix, (deleteFilesError) => {
                if (deleteFilesError) {
                    console.error(deleteFilesError);
                    return res.status(500).json({ message: `Error al eliminar archivos: ${deleteFilesError.message}` });
                }

                // Llamar al procedimiento almacenado para eliminar el usuario usando el nombre de usuario
                const username = user.nombre_usuario; 
                conexion.query('CALL EliminarUsuario(?)', [username], (callError, callResults) => {
                    if (callError) {
                        console.error(callError);
                        return res.status(500).json({ message: `Error al eliminar usuario: ${callError.message}` });
                    }

                    return res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
                });
            });
        });
    });
};



module.exports = {get_users,get_user,addUser,update_user,delete_user_route}