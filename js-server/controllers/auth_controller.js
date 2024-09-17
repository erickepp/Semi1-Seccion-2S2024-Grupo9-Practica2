const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const conexion  = require('../conexion/conexion')


const authenticate = (req, res) => {
    const { username_or_email, password } = req.body;

    if (!username_or_email || !password) {
        return res.status(400).json({ message: 'Todos los campos son necesarios.' });
    }

    // Buscar el usuario por username o email
    conexion.query('SELECT * FROM Usuario WHERE nombre_usuario = ? OR correo = ?', [username_or_email, username_or_email], (error, results) => {
        if (error) {
            console.error('Error al buscar el usuario:', error);
            return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
        }

        const user = results[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Comparar la contraseña
        bcrypt.compare(password, user.pass, (error, isMatch) => {
            if (error) {
                console.error('Error al comparar las contraseñas:', error);
                return res.status(500).json({ message: `Error interno del servidor: ${error.message}` });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'La contraseña es incorrecta.' });
            }

            // Devolver la información del usuario
            const userToDict = {
                user_id: user.id_usuario,
                username: user.nombre_usuario,
                email: user.correo,
                image: user.imagen,
                login_image: user.login_imagen,
                image_key: user.imagen_clave
            };

            return res.status(200).json(userToDict);
        });
    });
};


module.exports = { authenticate };