const express = require('express');
const router = express.Router();
const pool = require('../db');

// Buscar tareas por nombre de la materia (del usuario)
router.get('/materia/:nombre', async (req, res) => {
    try {
        const nombreMateria = req.params.nombre;
        const [tareas] = await pool.query(
            `SELECT tareas.*, materias.nombre AS nombre_materia
             FROM tareas
             JOIN materias ON tareas.materia_id = materias.id
             WHERE materias.nombre LIKE ?
             AND tareas.user_id = ?
             AND materias.user_id = ?
             ORDER BY tareas.fecha_creacion DESC`,
            [`%${nombreMateria}%`, req.user.id, req.user.id]
        );

        if (tareas.length === 0) {
            return res.status(404).json({ error: 'No se encontraron tareas para esa materia' });
        }

        res.json(tareas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar tareas por nombre de la tarea (del usuario)
router.get('/nombre/:nombre', async (req, res) => {
    try {
        const nombreTarea = req.params.nombre;
        const [rows] = await pool.query(
            `SELECT tareas.*, materias.nombre AS nombre_materia
             FROM tareas
             LEFT JOIN materias ON tareas.materia_id = materias.id
             WHERE tareas.titulo LIKE ?
             AND tareas.user_id = ?
             ORDER BY tareas.fecha_creacion DESC`,
            [`%${nombreTarea}%`, req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'No se encontraron tareas con ese nombre' });
        }

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener todas las tareas del usuario
router.get('/', async (req, res) => {
    try {
        const [tareas] = await pool.query(
            `SELECT tareas.*, materias.nombre AS nombre_materia, materias.color
             FROM tareas
             LEFT JOIN materias ON tareas.materia_id = materias.id
             WHERE tareas.user_id = ?
             ORDER BY tareas.fecha_creacion DESC`,
            [req.user.id]
        );
        res.json(tareas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear nueva tarea (asociada al usuario)
router.post('/', async (req, res) => {
    try {
        const { titulo, descripcion, materia_id } = req.body;

        if (!titulo || !materia_id) {
            return res.status(400).json({ error: 'El título y materia_id son obligatorios' });
        }

        // Verificar que la materia pertenece al usuario
        const [materia] = await pool.query(
            'SELECT id FROM materias WHERE id = ? AND user_id = ?',
            [materia_id, req.user.id]
        );
        
        if (materia.length === 0) {
            return res.status(400).json({ error: 'Materia no válida o no tienes permisos' });
        }

        const [result] = await pool.query(
            'INSERT INTO tareas (titulo, descripcion, materia_id, user_id) VALUES (?, ?, ?, ?)',
            [titulo, descripcion || null, materia_id, req.user.id]
        );

        res.status(201).json({
            id: result.insertId,
            titulo,
            descripcion,
            materia_id,
            user_id: req.user.id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una tarea (del usuario)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, materia_id } = req.body;

        // Verificar que la tarea pertenece al usuario
        const [tarea] = await pool.query(
            'SELECT id FROM tareas WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        
        if (tarea.length === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada o no tienes permisos' });
        }

        // Si se cambia la materia, verificar que la nueva materia pertenece al usuario
        if (materia_id) {
            const [materia] = await pool.query(
                'SELECT id FROM materias WHERE id = ? AND user_id = ?',
                [materia_id, req.user.id]
            );
            
            if (materia.length === 0) {
                return res.status(400).json({ error: 'Materia no válida o no tienes permisos' });
            }
        }

        const [result] = await pool.query(
            'UPDATE tareas SET titulo = ?, descripcion = ?, materia_id = ? WHERE id = ? AND user_id = ?',
            [titulo, descripcion, materia_id, id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        res.json({ mensaje: 'Tarea actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una tarea (del usuario)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que la tarea pertenece al usuario
        const [tarea] = await pool.query(
            'SELECT id FROM tareas WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        
        if (tarea.length === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada o no tienes permisos' });
        }

        const [result] = await pool.query(
            'DELETE FROM tareas WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        res.json({ mensaje: 'Tarea eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;