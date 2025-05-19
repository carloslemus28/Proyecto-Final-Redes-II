drop database ruletaDB;
create database ruletaDB;
use ruletaDB;
-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL, -- Se almacenará encriptada
    coins INT DEFAULT 100 NOT NULL, -- Cada jugador inicia con 100 COINS
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Historial de Apuestas
CREATE TABLE historial_apuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_apuesta ENUM('color', 'numero') NOT NULL, -- Tipo de apuesta
    valor_apostado VARCHAR(10) NOT NULL, -- Puede ser 'rojo', 'negro', 'verde' o un número entre 1 y 36
    monto_apostado INT NOT NULL, -- Cantidad de COINS apostadas
    resultado ENUM('ganado', 'perdido') NOT NULL,
    coins_ganados INT DEFAULT 0, -- Cantidad de COINS ganadas o 0 si perdió
    numero_ganador INT NOT NULL, -- Número en el que cayó la ruleta
    color_ganador ENUM('rojo', 'negro', 'verde') NOT NULL, -- Color del número ganador
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
select * from usuarios
