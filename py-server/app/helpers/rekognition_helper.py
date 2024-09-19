import os
import boto3
from botocore.exceptions import BotoCoreError, ClientError

# Crear cliente de Rekognition
rekognition_client = boto3.client(
    'rekognition',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_BUCKET_REGION')
)


def get_face_count(image):
    try:
        # Leer el contenido de la imagen
        image_bytes = image.read()
        image.seek(0)  # Reiniciar el cursor del archivo al principio

        # Detecta rostros en la imagen
        response = rekognition_client.detect_faces(
            Image={'Bytes': image_bytes},
            Attributes=['ALL']
        )
        
        # Obtiene la lista de detalles de los rostros detectados
        face_details = response['FaceDetails']
        num_faces = len(face_details)
        return num_faces
    except (BotoCoreError, ClientError) as e:
        raise RuntimeError(f'Error al utilizar el servicio de Rekognition para detectar rostros: {str(e)}')
    except Exception as e:
        raise RuntimeError(f'Error inesperado durante la detección de rostros: {str(e)}')


def compare_faces(source_image, target_image, threshold=90):
    try:
        # Leer el contenido de las imágenes
        source_image_bytes = source_image.read()
        target_image_bytes = target_image.read()

        # Reiniciar el cursor de los archivos
        source_image.seek(0)
        target_image.seek(0)

        # Compara las imágenes utilizando Rekognition
        response = rekognition_client.compare_faces(
            SourceImage={'Bytes': source_image_bytes},
            TargetImage={'Bytes': target_image_bytes},
            SimilarityThreshold=threshold
        )

        # Procesa la respuesta para determinar si hay coincidencias
        if response['FaceMatches']:
            for face in response['FaceMatches']:
                if face['Similarity'] >= threshold:
                    return True

        # Si no hay coincidencias o no alcanzan el umbral
        return False
    except (BotoCoreError, ClientError) as e:
        raise RuntimeError(f'Error al utilizar el servicio de Rekognition para comparar imágenes: {str(e)}')
    except Exception as e:
        raise RuntimeError(f'Error inesperado durante la comparación de imágenes: {str(e)}')
