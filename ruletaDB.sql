create database ruletaDB;

use ruletaDB;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    coins INT DEFAULT 100 NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE historial_apuestas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    tipo_apuesta ENUM('color', 'numero') NOT NULL,
    valor_apostado VARCHAR(10) NOT NULL,
    monto_apostado INT NOT NULL,
    resultado ENUM('ganado', 'perdido') NOT NULL,
    coins_ganados INT DEFAULT 0,
    numero_ganador INT NOT NULL,
    color_ganador ENUM('rojo', 'negro', 'verde') NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
