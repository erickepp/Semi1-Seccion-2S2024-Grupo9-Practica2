const express = require('express');
const router = express.Router();
const rutasAutenticacion =  require('../controllers/auth_controller')
const multer = require('multer');
//const upload = multer({ storage: multer.memoryStorage() }); // Configuración para manejar archivos

router.post('/login',rutasAutenticacion.authenticate)

module.exports = router;