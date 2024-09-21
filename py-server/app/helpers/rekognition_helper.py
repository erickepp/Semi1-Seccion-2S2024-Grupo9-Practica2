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


def compare_faces(source_image, s3_bucket_name, s3_object_name, threshold=90):
    try:
        # Leer el contenido de la imagen de origen
        source_image_bytes = source_image.read()
        source_image.seek(0) # Vuelve al principio del archivo

        # Compara la imagen de origen con la imagen en S3
        response = rekognition_client.compare_faces(
            SourceImage={'Bytes': source_image_bytes},
            TargetImage={
                'S3Object': {
                    'Bucket': s3_bucket_name,
                    'Name': s3_object_name
                }
            },
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


def get_labels(s3_bucket_name, s3_object_name, max_labels=10):
    try:
        # Obtener etiquetas de la imagen desde S3
        response = rekognition_client.detect_labels(
            Image={
                'S3Object': {
                    'Bucket': s3_bucket_name,
                    'Name': s3_object_name
                }
            },
            MaxLabels=max_labels
        )

        # Procesar las etiquetas obtenidas
        labels = response.get('Labels', [])

        # Retornar los nombres de las etiquetas
        return [label['Name'] for label in labels]
    except (BotoCoreError, ClientError) as e:
        raise RuntimeError(f'Error al utilizar el servicio de Rekognition para obtener etiquetas: {str(e)}')
    except Exception as e:
        raise RuntimeError(f'Error inesperado durante la obtención de etiquetas: {str(e)}')


def extract_text(image):
    try:
        # Leer el contenido de la imagen
        image_bytes = image.read()
        image.seek(0)  # Vuelve al principio del archivo

        # Llamar a detect_text de Rekognition
        response = rekognition_client.detect_text(
            Image={
                'Bytes': image_bytes
            }
        )

        # Procesar el texto extraído y filtrar por líneas completas
        detected_texts = []
        for item in response.get('TextDetections', []):
            # Solo tomar detecciones de tipo "LINE" para evitar duplicados por palabras
            if item['Type'] == 'LINE':
                detected_texts.append(item['DetectedText'])

        # Unir los textos en una sola cadena
        return ' '.join(detected_texts)
    except (BotoCoreError, ClientError) as e:
        raise RuntimeError(f'Error al utilizar el servicio de Rekognition para extraer texto: {str(e)}')
    except Exception as e:
        raise RuntimeError(f'Error inesperado durante la extracción de texto: {str(e)}')
