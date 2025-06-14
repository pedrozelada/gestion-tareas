-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS gestion_tareas CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE gestion_tareas;

-- Crear tabla de materias
CREATE TABLE IF NOT EXISTS materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#ffffff'
);

-- Crear tabla de tareas
CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    materia_id INT,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL
);

INSERT INTO materias (nombre, color) VALUES
('Programación I', '#ff7f50'),
('Programación II', '#6495ed'),
('Bases de Datos', '#90ee90');

INSERT INTO tareas (titulo, descripcion, materia_id) VALUES
('Bucles', 'For(){}, while(){}, do{}while()', 1),
('Condiciones', 'if(){}else{}', 1),
('Ordenacion e Intercalacion', 'Bubble(){}', 2),
('Introduccion', '¿Para que se aplica un modelo relacional? R.- Para evitar la redundancia de datos',3);

