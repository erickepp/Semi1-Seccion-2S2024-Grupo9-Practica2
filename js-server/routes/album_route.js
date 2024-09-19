const express = require('express');
const router = express.Router();
const rutasAlbum =  require('../controllers/album_controller')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Configuración para manejar archivos




router.post('/albums', rutasAlbum.add_album);

//actualizar album
router.patch('/albums/:album_id',rutasAlbum.update_album);
//eliminar album
//router.delete('/albums/:user_id', rutasAlbum.delete_album);


module.exports = router;