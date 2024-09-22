---
title: Documentacion Seminario de sistemas 1 Practica 2 Grupo 9

---

# Documentacion Seminario de sistemas 1 Practica 2 Grupo 9

## Integrantes:


## Arquitectura
Para el desarrollo de la plataforma soundstream se elijio como servicio cloud AWS para hacer uso de sus diferentes servicios y funcionalidades a continuacion se describira brevemente cada uno de los servicios utilizados para el desarrollo del proyecto.

**EC2:**

![image](https://github.com/user-attachments/assets/78748e32-4e8a-4aa4-b897-4b0cd6885317)



* Maquina virtual: Contiene el backend de python de la aplicacion haciendo uso de dos grupos de seguridad para permitir acceso unicamente a los puertos necesarios.
 
* Maquina virtual: Contiene el backend de NodeJS de la aplicacion este es el segundo servidor utilizado para el desarrollo del proyecto, igualmente se hizo uso de 2 grupos de seguridad uno para la conexion SSH y el otro para permitir el accesso a los puertos necesarios HTTP, HTTPS y el puerto 3000

* Balanceador de carga:  Debido a que tenemos dos backend hacemos uso de un balanceador de carga para distribuir de una forma mas eficiente la carga para evitar saturar un servidor y asi garantizar que los servidores estaran funcionando por un tiempo mas prolongado.

**S3:**

![image](https://hackmd.io/_uploads/H1Un4G66C.png)

Bucket multimedia: Tenemos un bucket multimedia con acceso al publico para hacer la gestión de las imagenes y de las canciones utilizadas en la aplicacion, disponemos de dos carpetas una llamada "Fotos" la cual albergará las fotos de perfil y las fotos utilizadas para las canciones o albums, tenemos otra carpeta llamada "Canciones" la cual contiene todas las canciones utilizadas en la plataforma. 

**RDS:**

![image](https://hackmd.io/_uploads/r1CTNfTTR.png)

Para contener la base de datos se hizo uso del servicio RDS para manejar la base de datos, en nuestro caso utilizamos MySQL para el desarrollo de esta aplicacion por lo que se hizo uso de los settings por defecto tales como el puerto 3306, usuario admin y una contraseña proporcionada por amazon.

**Diagrama Entidad  Relacion**

![image](https://hackmd.io/_uploads/HJnDrfTpC.png)

## Usuarios IAM

Se hizo uso de 4 usuarios IAM los cuales se estaran explicando acontinuación.

1. Administrado_FullAccess

![image](https://hackmd.io/_uploads/By_ABGaaC.png)

Este es el usuario de usos generales este usuario se creo con la finalidad de evitar el uso del usuraio root ya que eso es lo recomendado por la documentación de AWS

Permisos: AdministratorAccess

2. Bucket_user

![image](https://hackmd.io/_uploads/Hk-g8MpTA.png)

El usuario Bucket_user es el encargado de estar controlando los buckets, tanto desde la creacion como estar monitoreando que las canciones sean agregadas y las fotos tambien, si en dado caso se necesitara que los buckets sean eliminados este usuario seria el responsable de realizar esa gestión

permisos: AmazonS3FullAccess

3. Ec2_user

![image](https://hackmd.io/_uploads/BJjQUG6pC.png)

El usuario Ec2_user es el encargado de llevar a cabo la gestión de la creacion de las instancias, monitoreas las instancias, encender las instancias, eliminar instancias y detener las instancias cada vez que sea necesario. Ademas de estas funcionalidades este usuario es el encargado de la creacion del balanceador de carga y de configurar dicho balanceador

permisos: AmazonEC2FullAccess

4. RDS_user

![image](https://hackmd.io/_uploads/SkQiUz66C.png)

El usuario RDS_user es el encargado de llevar a cabo toda la gestión de la base de datos montada en RDS asi como la creacion de la base como estar monitorizando la base en cuestion, ver estadisticas y problemas si en dado caso surgieran algunos.

permisos: AmazonRDSDataFullAccess

## Capturas Recursos

**Instancias:**

![image](https://hackmd.io/_uploads/Hy1fvMa6R.png)

Instancia Python en la cual se utilizaron dos grupos de seguridad una para la conexion SSH y la otra para el manejo de los puertos necesarios tales como el HTTP, HTTPS y el puerto 3000 haciendo uso de las caracteristicas de la capa gratuita

![image](https://hackmd.io/_uploads/r1NLPfTpR.png)


Instancia NodeJS en la cual se utilizaron dos grupos de seguridad una para la conexion SSH y la otra para el manejo de los puertos necesarios tales como el HTTP, HTTPS y el puerto 3000 haciendo uso de las caracteristicas de la capa gratuita

![image](https://hackmd.io/_uploads/r1JPwG660.png)

Balanceador de carga clasico, en el cual se configuró el endpoint check el cual servira para hacer los estados de comprobación y asi determinar si una instancia es optima para su uso.

![image](https://hackmd.io/_uploads/SyTwDfTaR.png)

Acá podemos visualizar las instancias utilizadas para que trbaje el balanceador

![image](https://hackmd.io/_uploads/HJKOwMaTA.png)

estos son los tiempos utilizados para la comprobación de estado asi como la configuración de la ruta de ping la cual es el endpoint check.

![image](https://hackmd.io/_uploads/SyJ5DGTTC.png)

Grupos de seguridad utilizados para el desarrollo de la aplicacion, se hizo uso unicamente de la configuración de reglas de entrada para limitar los puertos, ademas de dejar libre el origen para que sea accesible desde cualquier computadora. Acá la lista de grupos de seguridad

![image](https://hackmd.io/_uploads/rkA9vG6pR.png)

Configuración del grupo de seguridad Maquinas virtuales python y NodeJS donde se usan los puertos 443,80,3000

![image](https://hackmd.io/_uploads/rynsPfpTA.png)

Configuración del grupo de seguridad SSH haciendo uso del puerto 22

![image](https://hackmd.io/_uploads/r1v2Pfp6R.png)

Configuración del grupo de seguridad para la base de datos implementada en RDS haciendo uso unicamente del puerto 3306 que es el puerto por defecto para mysql

![image](https://hackmd.io/_uploads/rkV6vzT6A.png)

Para s3 se utilizaron dos buckets como bien se mencionó anteriormente uno es para toda la multimedia y el otro especificamente para el despliegue del frontend, esta es la captura de los buckets

![image](https://hackmd.io/_uploads/BJKRvf6T0.png)

Configuración del bucket multimedia: unicamente se dejo habilitado el acceso publico y la configuración de una politica para poder utilizar la multimedia desde el frontend

![image](https://hackmd.io/_uploads/B1s1_MT6A.png)

Configuración del bucket frontend: al igual que el bucket multimedia en este solo se dejo con acceso publico y se habilitó el apartado para desplegar un sitio web estático

![image](https://hackmd.io/_uploads/HyuxOM6a0.png)

Para la configuración de RDS se hizo de la manera simple unicamente con las configuraciónes minimas necesarias tales como el puerto 3306, usuario "admin" y una contraseña generada automáticamente. Ademas de activar la opcion de "Accesible publicamente" para poder conectarnos desde cualquier direccion de ip, mas allá de eso nos limitamos a usar las funcionalidades por defecto aptas para la capa gratuita de AWS y configurar el grupo de seguridad correcto para evitar el creado por default

![image](https://hackmd.io/_uploads/HJKW_MTTR.png)

