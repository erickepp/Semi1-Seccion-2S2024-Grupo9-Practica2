const express = require('express');
const router = express.Router();
const rutasUsuario =  require('../controllers/user_controller')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Configuración para manejar archivos



//mostrar usuarios
router.get('/users',rutasUsuario.get_users)
//mostrar usuario por su id
router.get('/users/:user_id',rutasUsuario.get_user)
//registrar usuario
router.post('/users', upload.single('image'), rutasUsuario.addUser);
//actualizar usuario
router.patch('/users/:user_id',upload.single('image'),rutasUsuario.update_user);
//eliminar usuario
router.delete('/users/:user_id', rutasUsuario.delete_user_route);

module.exports = router;