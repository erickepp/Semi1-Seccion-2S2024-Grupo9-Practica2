import os
import boto3
from botocore.exceptions import BotoCoreError, ClientError

# Crear cliente de Translate
translate_client = boto3.client(
    'translate',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_BUCKET_REGION')
)

# Mapeo de códigos de idioma a nombres completos en inglés
language_map = {
    'es': 'Spanish',
    'en': 'English',
    'de': 'German',
    'fr': 'French'
}


def translate_text(text):
    try:
        # Español, Inglés, Alemán, Francés
        target_languages = ['es', 'en', 'de', 'fr']

        translations = []

        # Detectar el idioma de origen
        detect_response = translate_client.translate_text(
            Text=text,
            SourceLanguageCode='auto',
            TargetLanguageCode='en'  # Utiliza un idioma específico para la detección
        )

        # Obtener el idioma detectado
        detected_language = detect_response['SourceLanguageCode']

        # Excluir el idioma detectado
        filtered_languages = [lang for lang in target_languages if lang != detected_language]

        # Traducir a los idiomas finales y usar los nombres completos como claves
        for target_language in filtered_languages[:3]:
            translate_response = translate_client.translate_text(
                Text=text,
                SourceLanguageCode=detected_language,
                TargetLanguageCode=target_language
            )
            language_name = language_map.get(target_language, target_language)
            translations.append({
                'language': language_name,
                'description': translate_response['TranslatedText']
            })

        return translations
    except (BotoCoreError, ClientError) as e:
        raise RuntimeError(f'Error en el servicio de Translate: {str(e)}')
    except Exception as e:
        raise RuntimeError(f'Error inesperado durante la traducción: {str(e)}')
