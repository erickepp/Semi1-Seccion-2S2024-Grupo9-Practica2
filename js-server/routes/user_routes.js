const express = require('express');
const router = express.Router();
const rutasUsuario =  require('../controllers/user_controller')
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Configuración para manejar archivos

router.get('/users',(req,res) =>{
    res.send('users todos')
});

router.post('/users', upload.single('image'), rutasUsuario.addUser);

module.exports = router;