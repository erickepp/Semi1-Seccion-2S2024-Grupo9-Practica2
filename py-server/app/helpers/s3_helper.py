import os
import boto3
import filetype

aws_access_key_id = os.getenv('AWS_ACCESS_KEY_ID')
aws_secret_access_key = os.getenv('AWS_SECRET_ACCESS_KEY')
aws_bucket_name = os.getenv('AWS_BUCKET_NAME')
aws_bucket_region = os.getenv('AWS_BUCKET_REGION')

s3_client = boto3.client(
    's3',
    region_name=aws_bucket_region,
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key
)


def upload_file(file, object_name):
    try:
        # Detecta el tipo MIME del archivo
        file_bytes = file.read()
        kind = filetype.guess(file_bytes)
        file.seek(0)  # Vuelve al principio del archivo
            
        if kind is None:
            raise ValueError('No se pudo determinar el tipo MIME del archivo.')
            
        file_type = kind.mime
            
        # Subir el archivo al bucket S3
        s3_client.upload_fileobj(
            file,
            aws_bucket_name,
            object_name,
            ExtraArgs={'ContentType': file_type}
        )
            
        # Obtener la URL pública del archivo subido
        file_url = f'https://{aws_bucket_name}.s3.{aws_bucket_region}.amazonaws.com/{object_name}'
        return file_url
    except Exception as e:
        raise RuntimeError(
            f'Error al subir el archivo "{object_name}" al bucket "{aws_bucket_name}": {str(e)}'
        )


def delete_files(prefix):
    try:
        # Obtener la lista de objetos con el prefijo dado
        response = s3_client.list_objects_v2(Bucket=aws_bucket_name, Prefix=prefix)
        
        if 'Contents' not in response:
            print(f'No se encontraron archivos con el prefijo "{prefix}".')
            return
        
        # Preparar la lista de claves de los objetos a eliminar
        objects_to_delete = [{'Key': obj['Key']} for obj in response['Contents']]
        
        # Eliminar los objetos
        delete_response = s3_client.delete_objects(
            Bucket=aws_bucket_name,
            Delete={'Objects': objects_to_delete}
        )
        
        # Comprobar si hay errores
        if 'Errors' in delete_response:
            raise RuntimeError(f'Error al eliminar algunos archivos: {delete_response["Errors"]}')
        
        print(f'Se eliminaron {len(objects_to_delete)} archivos con el prefijo "{prefix}".') 
    except Exception as e:
        raise RuntimeError(f'Error al eliminar archivos con el prefijo "{prefix}": {str(e)}')
