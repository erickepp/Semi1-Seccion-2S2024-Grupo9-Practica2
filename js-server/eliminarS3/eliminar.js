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

module.exports = deleteFiles;
