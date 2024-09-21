const AWS = require('aws-sdk');

// Configurar AWS con las credenciales del archivo .env
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();
const bucketName = process.env.AWS_BUCKET_NAME;

const deleteFiles = (prefix, callback) => {
    // Obtén la lista de objetos en el bucket
    s3.listObjectsV2({ Bucket: bucketName, Prefix: prefix }, (err, data) => {
        if (err) return callback(err);

        // Elimina los objetos
        const objectsToDelete = data.Contents.map(obj => ({ Key: obj.Key }));
        if (objectsToDelete.length === 0) return callback(null);

        s3.deleteObjects({ Bucket: bucketName, Delete: { Objects: objectsToDelete } }, (deleteErr) => {
            if (deleteErr) return callback(deleteErr);
            callback(null);
        });
    });
};

const delete_files = (prefix) => {
    return new Promise((resolve, reject) => {
        //console.log(`Buscando objetos con el prefijo: ${prefix}`);
        
        // Obtén la lista de objetos en el bucket
        s3.listObjectsV2({ Bucket: bucketName, Prefix: prefix }, (err, data) => {
            if (err) {
                console.error(`Error al listar objetos: ${err}`);
                return reject(err);
            }

            console.log(`Objetos encontrados: ${data.Contents.length}`);
            if (data.Contents.length === 0) {
                console.log('No hay objetos para eliminar.');
                return resolve(); // No hay objetos que eliminar
            }

            const objectsToDelete = data.Contents.map(obj => ({ Key: obj.Key }));
            console.log(`Objetos a eliminar: ${JSON.stringify(objectsToDelete)}`);

            s3.deleteObjects({ Bucket: bucketName, Delete: { Objects: objectsToDelete } }, (deleteErr) => {
                if (deleteErr) {
                    console.error(`Error al eliminar objetos: ${deleteErr}`);
                    return reject(deleteErr);
                }
                console.log('Objetos eliminados exitosamente.');
                resolve();
            });
        });
    });
};

module.exports = {deleteFiles,delete_files};
