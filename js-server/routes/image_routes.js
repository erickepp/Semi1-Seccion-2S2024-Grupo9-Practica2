const express = require('express');
const router = express.Router();
const rutasImages =  require('../controllers/image_controller')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Configuración para manejar archivos


//ruta para ver todas las imagenes
router.get('/images',rutasImages.get_images)
//ruta para imagen por id
router.get('/images/:image_id',rutasImages.get_image)
//ruta para agregar imagen a un album
router.post('/images', upload.single('url'), rutasImages.add_image);


module.exports = router;