# API Documentation

## Authentication Routes

### POST /login

**Descripción:** Autentica a un usuario basado en su nombre de usuario o correo electrónico y contraseña. 

**Cuerpo:** Objeto JSON con los siguientes campos:
-   **username_or_email** (requerido): Nombre de usuario o correo electrónico del usuario.
-   **password** (requerido): Contraseña del usuario.

 **Respuesta:** Devuelve los datos del usuario si la autenticación es exitosa.

---

### POST /login/facial-recognition

**Descripción:** Autentica a un usuario utilizando reconocimiento facial.  

**Cuerpo:** Datos del formulario con los siguientes campos:

-   **username_or_email** (requerido): Nombre de usuario o correo electrónico del usuario.
-   **image** (requerido): Imagen del rostro del usuario para la comparación.  

**Respuesta:** Devuelve los datos del usuario si la autenticación es exitosa.

---

## User Routes

### GET /users

**Descripción:** Recupera una lista de todos los usuarios.  
**Respuesta:** Devuelve una lista de usuarios.

---

### GET /users/user_id

**Descripción:** Recupera los detalles de un usuario específico por su ID.  

**Parámetros de ruta:**

-   **user_id** (requerido): El ID del usuario.

**Respuesta:** Devuelve los detalles del usuario.

---

### POST /users

**Descripción:** Registra un nuevo usuario en la base de datos.  

**Cuerpo:** Datos del formulario con los siguientes campos obligatorios:

-   **username** (requerido): Nombre de usuario.
-   **email** (requerido): Correo electrónico.
-   **password** (requerido): Contraseña.
-   **confirm_password** (requerido): Confirmación de la contraseña.
-   **image** (requerido): Imagen del usuario.  

**Respuesta:** Devuelve los datos del nuevo usuario si la creación es exitosa.

---

### PATCH /users/user_id

**Descripción:** Actualiza los detalles de un usuario específico.  

**Parámetros de ruta:**

-   **user_id** (requerido): El ID del usuario a actualizar.  

 **Cuerpo:** Datos del formulario:
    
-   **username** (opcional): Nombre de usuario.
-   **email** (opcional): Correo electrónico.
-   **image** (opcional): Imagen del usuario.
-   **password** (requerido): Contraseña.

 **Respuesta:** Devuelve los detalles del usuario actualizado.

---

### PATCH /users/user_id/facial-recognition

**Descripción:** Actualiza el estado del reconocimiento facial de un usuario.  

**Parámetros de ruta:**

-   **user_id** (requerido): El ID del usuario.  

**Cuerpo:** Datos del formulario con los siguientes campos:

-   **status** (requerido): Estado (0 para desactivar, 1 para activar).
-   **image_key** (opcional si el estado es 0, requerido si es 1): Imagen clave para activar el reconocimiento facial.
-   **password** (requerido): Contraseña del usuario.  

**Respuesta:** Mensaje de éxito y datos del usuario si la actualización es exitosa.

---

### PATCH /users/user_id/image-key

**Descripción:** Actualiza la imagen clave para el reconocimiento facial de un usuario.

**Parámetros de ruta:**

-   **user_id** (requerido): El ID del usuario.

**Cuerpo:** Datos del formulario con los siguientes campos:
-   **image_key** (requerido): Imagen clave del usuario.
-   **password** (requerido): Contraseña del usuario.

**Respuesta:** Devuelve los detalles del usuario actualizado.

---

### DELETE /users/user_id

**Descripción:** Elimina un usuario específico.

**Parámetros de ruta:**

-   **user_id** (requerido): El ID del usuario a eliminar.  

**Cuerpo:** Objeto JSON con el siguiente campo:

-   **password** (requerido): Contraseña del usuario.  

**Respuesta:** Mensaje de éxito si el usuario es eliminado correctamente.

---

## Album Routes

### GET /albums

**Descripción:** Recupera una lista de todos los álbumes.  
**Respuesta:** Devuelve una lista de álbumes.

---

### GET /users/user_id/albums

**Descripción:** Recupera una lista de álbumes creados por el usuario especificado.

**Parámetros de ruta:**

-   **user_id** (requerido): El ID del usuario.

**Respuesta:** Devuelve una lista de álbumes del usuario.

---

### GET /albums/album_id

**Descripción:** Recupera los detalles de un álbum específico por su ID.
  
**Parámetros de ruta:**

-   **album_id** (requerido): El ID del álbum.

**Respuesta:** Devuelve los detalles del álbum.

---

### POST /albums

**Descripción:** Crea un nuevo álbum para un usuario.  

**Cuerpo:** Objeto JSON con los siguientes campos:

-   **name** (requerido): Nombre del álbum.
-   **user_id** (requerido): ID del usuario propietario del álbum. 
 
**Respuesta:** Devuelve los detalles del nuevo álbum si la creación es exitosa.

---

### PATCH /albums/album_id

**Descripción:** Actualiza los detalles de un álbum específico.

**Parámetros de ruta:**

-   **album_id** (requerido): El ID del álbum a actualizar.

**Cuerpo:** Objeto JSON con los siguientes campos:
-   **name** (requerido): Nombre del álbum.  

**Respuesta:** Devuelve los detalles del álbum actualizado.

---

### DELETE /albums/album_id

**Descripción:** Elimina un álbum específico.  

**Parámetros de ruta:**

-   **album_id** (requerido): El ID del álbum a eliminar.

  **Respuesta:** Mensaje de éxito si el álbum es eliminado correctamente.

---

## Image Routes

### GET /images

**Descripción:** Recupera una lista de todas las imágenes.  
**Respuesta:** Devuelve una lista de imágenes.

---

### GET /images/image_id

**Descripción:** Recupera los detalles de una imagen específica por su ID. 

**Parámetros de ruta:**

-   **image_id** (requerido): El ID de la imagen.

**Respuesta:** Devuelve los detalles de la imagen.

---

### GET /images/image_id/labels

**Descripción:** Genera etiquetas de una imagen específica por su ID.

**Parámetros de ruta:**

-   **image_id** (requerido): El ID de la imagen.

**Respuesta:** Devuelve una lista de etiquetas de la imagen.

---

### GET /images/image_id/translate

**Descripción:**  Traduce la descripción de una imagen por su ID a múltiples idiomas.

**Parámetros de ruta:**

-   **image_id** (requerido): El ID de la imagen.

**Respuesta:** Un objeto JSON con las traducciones en tres idiomas.

---

### POST /images

**Descripción:** Registra una nueva imagen en un álbum.

**Cuerpo:** Datos del formulario con los siguientes campos:

-   **name** (requerido): Nombre de la imagen.
-   **description** (requerido): Descripción de la imagen.
-   **url** (requerido): Archivo de la imagen.
-   **album_id** (requerido): ID del álbum donde se agregará la imagen.

**Respuesta:** Devuelve los detalles de la nueva imagen si la creación es exitosa.

---

### POST /images/text

**Descripción:** Extrae el texto de una imagen.

**Cuerpo:** Datos del formulario con los siguientes campos:

-   **image** (requerido): Archivo de la imagen.

**Respuesta:** Devuelve el texto de la imagen.
