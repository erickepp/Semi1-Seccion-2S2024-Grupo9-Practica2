

# Documentacion Seminario de sistemas 1 Practica 2 Grupo 9

## Integrantes:

| Nombre | Carnet | 
| -------- | -------- | 
| Erick Estuardo Patzan Polanco   | 201602627    | 
|Gerson Oswaldo Ruíz Ramírez|202011405|
|Henry Rafael Maldonado Sandoval|201114117|
|Paulo Fernando Mérida Salazar|202002042|

## Arquitectura
Para el desarrollo de la plataforma soundstream se elijio como servicio cloud AWS para hacer uso de sus diferentes servicios y funcionalidades a continuacion se describira brevemente cada uno de los servicios utilizados para el desarrollo del proyecto.

**EC2:**

![image](https://github.com/user-attachments/assets/78748e32-4e8a-4aa4-b897-4b0cd6885317)



* Maquina virtual: Contiene el backend de python de la aplicacion haciendo uso de dos grupos de seguridad para permitir acceso unicamente a los puertos necesarios.
 
* Maquina virtual: Contiene el backend de NodeJS de la aplicacion este es el segundo servidor utilizado para el desarrollo del proyecto, igualmente se hizo uso de 2 grupos de seguridad uno para la conexion SSH y el otro para permitir el accesso a los puertos necesarios HTTP, HTTPS y el puerto 3000

* Balanceador de carga:  Debido a que tenemos dos backend hacemos uso de un balanceador de carga para distribuir de una forma mas eficiente la carga para evitar saturar un servidor y asi garantizar que los servidores estaran funcionando por un tiempo mas prolongado.

**S3:**

![image](https://github.com/user-attachments/assets/5b1d997f-714a-4774-9fd1-cc20d59dafb2)


Bucket multimedia: Tenemos un bucket multimedia con acceso al publico para hacer la gestión de las imagenes y de las canciones utilizadas en la aplicacion, disponemos de dos carpetas una llamada "Fotos" la cual albergará las fotos de perfil y las fotos utilizadas para las canciones o albums, tenemos otra carpeta llamada "Canciones" la cual contiene todas las canciones utilizadas en la plataforma. 

**RDS:**

![image](https://github.com/user-attachments/assets/7f14d98d-f497-4470-8359-d6b99c2d6955)


Para contener la base de datos se hizo uso del servicio RDS para manejar la base de datos, en nuestro caso utilizamos MySQL para el desarrollo de esta aplicacion por lo que se hizo uso de los settings por defecto tales como el puerto 3306, usuario admin y una contraseña proporcionada por amazon.

**Diagrama Entidad  Relacion**

![image](https://github.com/user-attachments/assets/358a44f1-fb08-4ef1-a10b-18082f2af2e7)


## Usuarios IAM

Se hizo uso de 4 usuarios IAM los cuales se estaran explicando acontinuación.

1. Administrado_FullAccess

![image](https://github.com/user-attachments/assets/b38cef21-0991-4d7b-b625-4ee5831d4064)


Este es el usuario de usos generales este usuario se creo con la finalidad de evitar el uso del usuraio root ya que eso es lo recomendado por la documentación de AWS

Permisos: AdministratorAccess

2. Bucket_user

![image](https://github.com/user-attachments/assets/e5aabcd7-1dbc-47a1-9706-89c1e728ca79)


El usuario Bucket_user es el encargado de estar controlando los buckets, tanto desde la creacion como estar monitoreando que las canciones sean agregadas y las fotos tambien, si en dado caso se necesitara que los buckets sean eliminados este usuario seria el responsable de realizar esa gestión

permisos: AmazonS3FullAccess

3. Ec2_user

![image](https://github.com/user-attachments/assets/6d875f88-4679-4990-bef5-33fd9d33460f)


El usuario Ec2_user es el encargado de llevar a cabo la gestión de la creacion de las instancias, monitoreas las instancias, encender las instancias, eliminar instancias y detener las instancias cada vez que sea necesario. Ademas de estas funcionalidades este usuario es el encargado de la creacion del balanceador de carga y de configurar dicho balanceador

permisos: AmazonEC2FullAccess

4. RDS_user

![image](https://github.com/user-attachments/assets/02ae220d-6ab5-40e7-bb26-7016949661f5)


El usuario RDS_user es el encargado de llevar a cabo toda la gestión de la base de datos montada en RDS asi como la creacion de la base como estar monitorizando la base en cuestion, ver estadisticas y problemas si en dado caso surgieran algunos.

permisos: AmazonRDSDataFullAccess

## Capturas Recursos

**Instancias:**

![image](https://github.com/user-attachments/assets/78e5c17c-1def-461e-8f82-225854f79be1)


Instancia Python en la cual se utilizaron dos grupos de seguridad una para la conexion SSH y la otra para el manejo de los puertos necesarios tales como el HTTP, HTTPS y el puerto 3000 haciendo uso de las caracteristicas de la capa gratuita

![image](https://github.com/user-attachments/assets/a4c5d21a-3a74-4326-b413-6677216a3808)



Instancia NodeJS en la cual se utilizaron dos grupos de seguridad una para la conexion SSH y la otra para el manejo de los puertos necesarios tales como el HTTP, HTTPS y el puerto 3000 haciendo uso de las caracteristicas de la capa gratuita

![image](https://github.com/user-attachments/assets/f9648ff6-1334-4480-90f1-3742d3ed50e5)

Balanceador de carga clasico, en el cual se configuró el endpoint check el cual servira para hacer los estados de comprobación y asi determinar si una instancia es optima para su uso.

![image](https://github.com/user-attachments/assets/cc647587-0522-41ae-ac31-a77406cb3871)


Acá podemos visualizar las instancias utilizadas para que trbaje el balanceador

![image](https://github.com/user-attachments/assets/981d6ceb-2572-48ca-929b-4c1d6507cee8)


estos son los tiempos utilizados para la comprobación de estado asi como la configuración de la ruta de ping la cual es el endpoint check.

![image](https://github.com/user-attachments/assets/fae12afe-1319-4a71-a7cb-465d4d6e2de3)

Para s3 se utilizaron dos buckets como bien se mencionó anteriormente uno es para toda la multimedia y el otro especificamente para el despliegue del frontend, esta es la captura de los buckets

![image](https://github.com/user-attachments/assets/c97220e0-c4e6-4095-8676-5a271506e100)


Configuración del bucket multimedia: unicamente se dejo habilitado el acceso publico y la configuración de una politica para poder utilizar la multimedia desde el frontend

![image](https://github.com/user-attachments/assets/ad6ba334-cdb9-4d12-94c4-b4e8d81f9278)


Configuración del bucket frontend: al igual que el bucket multimedia en este solo se dejo con acceso publico y se habilitó el apartado para desplegar un sitio web estático

![image](https://github.com/user-attachments/assets/d57985d1-bfc4-4fec-9ea0-ede4d49a18a8)


Para la configuración de RDS se hizo de la manera simple unicamente con las configuraciónes minimas necesarias tales como el puerto 3306, usuario "admin" y una contraseña generada automáticamente. Ademas de activar la opcion de "Accesible publicamente" para poder conectarnos desde cualquier direccion de ip, mas allá de eso nos limitamos a usar las funcionalidades por defecto aptas para la capa gratuita de AWS y configurar el grupo de seguridad correcto para evitar el creado por default

![image](https://github.com/user-attachments/assets/a19e568d-a9b5-4ef2-bd8d-5d5f21e01110)


