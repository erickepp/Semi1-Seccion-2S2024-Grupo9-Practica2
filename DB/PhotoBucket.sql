create database photobucket;
use photobucket;

CREATE TABLE Usuario(
id_usuario int not null primary key auto_increment,
nombre_usuario varchar(100) not null unique,
correo varchar (100) not null unique,
pass varchar (100) not null,
confirmacion_pass varchar(100) not null,
imagen longtext not null,
login_imagen bool default False,
imagen_clave longtext
);

CREATE TABLE Album(
id_album int not null primary key auto_increment,
nombre longtext not null,
id_usuario int not null,
foreign key (id_usuario) references Usuario (id_usuario)ON DELETE CASCADE
);

CREATE TABLE Imagen(
id_imagen int not null primary key auto_increment,
nombre varchar (100) not null,
descripcion longtext not null,
url longtext not null,
id_album int not null,
foreign key (id_album) references Album (id_album) ON DELETE CASCADE
);


-- procedimientos almacenados

-- Agregar usuario
DELIMITER $$

CREATE PROCEDURE AgregarUsuario(
    IN p_nombre_usuario VARCHAR(100),
    IN p_correo VARCHAR(100),
    IN p_pass VARCHAR(100),
    IN p_confirmacion_pass VARCHAR(100),
    IN p_imagen LONGTEXT
)
BEGIN
    -- Verifica que la contraseña y la confirmación coincidan
    IF p_pass = p_confirmacion_pass THEN
        -- Inserta el nuevo usuario en la tabla
        INSERT INTO Usuario(nombre_usuario, correo, pass, confirmacion_pass, imagen)
        VALUES (p_nombre_usuario, p_correo, p_pass, p_confirmacion_pass, p_imagen);
    ELSE
        -- Lanza un error si las contraseñas no coinciden
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'La contraseña y la confirmación no coinciden';
    END IF;
END$$

DELIMITER ;

-- LOGIN
DELIMITER //

CREATE PROCEDURE Login(
    IN p_correo VARCHAR(150),
    IN p_contra VARCHAR(150)
)
BEGIN
    DECLARE contador INT;

    SELECT COUNT(*) INTO contador
    FROM Usuario
    WHERE correo = p_correo AND pass = p_contra;

    IF contador > 0 THEN
        SELECT TRUE AS Resultado;
    ELSE
        SELECT FALSE AS Resultado;
    END IF;
END //

DELIMITER ;

-- actualizar usuario
DELIMITER $$

CREATE PROCEDURE EditarUsuario(
    IN p_id_usuario INT,
    IN p_nombre_usuario VARCHAR(100),
    IN p_correo VARCHAR(100),
    IN p_imagen LONGTEXT
)
BEGIN
    -- Actualiza los campos nombre_usuario, correo, e imagen del usuario especificado
    UPDATE Usuario
    SET nombre_usuario = p_nombre_usuario,
        correo = p_correo,
        imagen = p_imagen
    WHERE id_usuario = p_id_usuario;
END$$

DELIMITER ;

-- Eliminar usuario segun su nombre de usuario
DELIMITER $$

CREATE PROCEDURE EliminarUsuario(
    IN p_nombre_usuario VARCHAR(100)
)
BEGIN
    -- Elimina el usuario que coincide con el nombre de usuario proporcionado
    DELETE FROM Usuario
    WHERE nombre_usuario = p_nombre_usuario;
END$$

DELIMITER ;

-- Activar reconocimiento
DELIMITER $$

CREATE PROCEDURE Activar_reconocimiento(
    IN p_id_usuario INT,
    IN p_pass VARCHAR(100),
    IN p_imagen_url LONGTEXT
)
BEGIN
    -- Verifica si login_imagen es FALSE y la contraseña coincide
    IF (SELECT login_imagen FROM Usuario WHERE id_usuario = p_id_usuario) = FALSE 
    AND (SELECT pass FROM Usuario WHERE id_usuario = p_id_usuario) = p_pass THEN
        -- Actualiza el campo imagen con la URL proporcionada
        UPDATE Usuario
        SET imagen_clave = p_imagen_url,
            login_imagen = TRUE
        WHERE id_usuario = p_id_usuario;
    ELSE
        -- Lanza un error si las condiciones no se cumplen
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: La contraseña no coincide o el reconocimiento ya está activado.';
    END IF;
END$$

DELIMITER ;

-- Desactivar login imagenes
DELIMITER $$

CREATE PROCEDURE Desactivar_reconocimiento(
    IN p_id_usuario INT,
    IN p_pass VARCHAR(100)
)
BEGIN
    -- Verifica si login_imagen es TRUE y la contraseña coincide
    IF (SELECT login_imagen FROM Usuario WHERE id_usuario = p_id_usuario) = TRUE 
    AND (SELECT pass FROM Usuario WHERE id_usuario = p_id_usuario) = p_pass THEN
        -- Actualiza el campo login_imagen a FALSE y limpia el campo imagen
        UPDATE Usuario
        SET login_imagen = FALSE,
            imagen_clave = ''
        WHERE id_usuario = p_id_usuario;
    ELSE
        -- Lanza un error si las condiciones no se cumplen
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: La contraseña no coincide o el reconocimiento facial no está activado.';
    END IF;
END$$

DELIMITER ;

-- actualizar imagen clave
DELIMITER $$

CREATE PROCEDURE actualizar_imagen_clave(
    IN p_id_usuario INT,
    IN p_pass VARCHAR(100),
    IN p_imagen_url LONGTEXT
)
BEGIN
    -- Verifica si la contraseña proporcionada coincide con la del usuario
    IF (SELECT pass FROM Usuario WHERE id_usuario = p_id_usuario) = p_pass THEN
        -- Actualiza el campo imagen con la URL proporcionada
        UPDATE Usuario
        SET imagen_clave = p_imagen_url
        WHERE id_usuario = p_id_usuario;
    ELSE
        -- Lanza un error si la contraseña no coincide
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: La contraseña no coincide.';
    END IF;
END$$

DELIMITER ;

-- mostrar albums
DELIMITER $$

CREATE PROCEDURE MostrarAlbumsEImagenes(
    IN p_id_usuario INT
)
BEGIN
    -- Selecciona todos los álbumes del usuario y las imágenes asociadas
    SELECT a.id_album, a.nombre AS nombre_album, i.id_imagen, i.nombre AS nombre_imagen, i.descripcion
    FROM Album a
    LEFT JOIN Imagen i ON a.id_album = i.id_album
    WHERE a.id_usuario = p_id_usuario;
END$$

DELIMITER ;

-- Crear Albums
DELIMITER $$

CREATE PROCEDURE CrearAlbum(
    IN p_nombre_album LONGTEXT,
    IN p_id_usuario INT
)
BEGIN
    -- Verifica si el usuario existe antes de crear el álbum
    IF EXISTS (SELECT 1 FROM Usuario WHERE id_usuario = p_id_usuario) THEN
        -- Inserta el nuevo álbum para el usuario especificado
        INSERT INTO Album (nombre, id_usuario)
        VALUES (p_nombre_album, p_id_usuario);
    ELSE
        -- Lanza un error si el usuario no existe
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El ID de usuario proporcionado no existe.';
    END IF;
END$$

DELIMITER ;

-- Eliminar album
DELIMITER $$

CREATE PROCEDURE EliminarAlbum(
    IN p_id_album INT
)
BEGIN
    -- Verifica si el álbum existe antes de eliminarlo
    IF EXISTS (SELECT 1 FROM Album WHERE id_album = p_id_album) THEN
        -- Elimina el álbum
        DELETE FROM Album WHERE id_album = p_id_album;
    ELSE
        -- Lanza un error si el álbum no existe
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El ID de álbum proporcionado no existe.';
    END IF;
END$$

DELIMITER ;

-- Modificar Album
DELIMITER $$

CREATE PROCEDURE ModificarNombreAlbum(
    IN p_id_album INT,
    IN p_nuevo_nombre LONGTEXT
)
BEGIN
    -- Verifica si el álbum existe antes de intentar actualizarlo
    IF EXISTS (SELECT 1 FROM Album WHERE id_album = p_id_album) THEN
        -- Actualiza el nombre del álbum
        UPDATE Album
        SET nombre = p_nuevo_nombre
        WHERE id_album = p_id_album;
    ELSE
        -- Lanza un error si el álbum no existe
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El ID de álbum proporcionado no existe.';
    END IF;
END$$

DELIMITER ;


-- Agregar imagenes
DELIMITER $$

CREATE PROCEDURE AgregarImagen(
    IN p_nombre_imagen VARCHAR(100),
    IN p_descripcion LONGTEXT,
    IN p_url LONGTEXT,
    IN p_id_album INT
)
BEGIN
    -- Verifica si el álbum existe antes de insertar la imagen
    IF EXISTS (SELECT 1 FROM Album WHERE id_album = p_id_album) THEN
        -- Inserta la nueva imagen en el álbum especificado
        INSERT INTO Imagen (nombre, descripcion, url, id_album)
        VALUES (p_nombre_imagen, p_descripcion, p_url, p_id_album);
    ELSE
        -- Lanza un error si el álbum no existe
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El ID de álbum proporcionado no existe.';
    END IF;
END$$

DELIMITER ;






-- Llamadas a los procedimientos almacenados

call AgregarUsuario('fer','fer@gmail.com','hola123','hola123','url foto perfil');

call Login('fer@gmail.com','hola123');

call EditarUsuario(1,'fernando','fernando@gmail.com','nueva imagen');

call EliminarUsuario('pauu');

call Activar_reconocimiento(2,'hola123','url de la imagen clave2');

call Desactivar_reconocimiento(3,'hola123');

call actualizar_imagen_clave(3,'hola123','mi clave');

call MostrarAlbumsEImagenes(6);

call CrearAlbum('gatos',5);

call EliminarAlbum(7);

call ModificarNombreAlbum(7,'gatitos');

call AgregarImagen('perro','cualquiera','url perro',8);

select * from Usuario;
select * from Album;
select * from Imagen;


