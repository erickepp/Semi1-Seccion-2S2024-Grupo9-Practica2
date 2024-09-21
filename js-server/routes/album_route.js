const express = require('express');
const router = express.Router();
const rutasAlbum =  require('../controllers/album_controller')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Configuración para manejar archivos


//mostrar todos los albums
router.get('/albums', rutasAlbum.get_albums);
//mostrar albums de un usuario por su ID
router.get('/users/:user_id/albums', rutasAlbum.get_albums_by_user);
//mostrar un album por su ID
router.get('/albums/:album_id', rutasAlbum.get_album);
// agregar album
router.post('/albums', rutasAlbum.add_album);
//actualizar album
router.patch('/albums/:album_id',rutasAlbum.update_album);
//eliminar album
router.delete('/albums/:album_id', rutasAlbum.delete_album);


module.exports = router;