const express = require('express');
const router = express.Router();
const pool = require('../db');

// Obtener todas las materias del usuario
router.get('/', async (req, res) => {
    try {
        const [materias] = await pool.query(
            'SELECT * FROM materias WHERE user_id = ? ORDER BY nombre ASC',
            [req.user.id]
        );
        res.json(materias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar materias por nombre (coincidencias parciales) del usuario
router.get('/nombre/:nombre', async (req, res) => {
    try {
        const nombre = req.params.nombre;
        const [materias] = await pool.query(
            'SELECT * FROM materias WHERE nombre LIKE ? AND user_id = ? ORDER BY nombre ASC',
            [`%${nombre}%`, req.user.id]
        );

        if (materias.length === 0) {
            return res.status(404).json({ error: 'No se encontraron materias con ese nombre' });
        }

        res.json(materias);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// (Opcional) Obtener tareas por nombre de materia del usuario
router.get('/tareas/:nombre', async (req, res) => {
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

// Crear nueva materia asociada al usuario
router.post('/', async (req, res) => {
    try {
        const { nombre, color } = req.body;

        if (!nombre || !color) {
            return res.status(400).json({ error: 'Nombre y color son obligatorios' });
        }

        // Verificar si ya existe una materia con ese nombre para este usuario
        const [existing] = await pool.query(
            'SELECT id FROM materias WHERE nombre = ? AND user_id = ?',
            [nombre, req.user.id]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Ya tienes una materia con ese nombre' });
        }

        const [result] = await pool.query(
            'INSERT INTO materias (nombre, color, user_id) VALUES (?, ?, ?)',
            [nombre, color, req.user.id]
        );

        res.status(201).json({ 
            id: result.insertId, 
            nombre, 
            color,
            user_id: req.user.id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una materia del usuario
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, color } = req.body;

        // Verificar que la materia pertenece al usuario
        const [materia] = await pool.query(
            'SELECT id FROM materias WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        
        if (materia.length === 0) {
            return res.status(404).json({ error: 'Materia no encontrada o no tienes permisos' });
        }

        const [result] = await pool.query(
            'UPDATE materias SET nombre = ?, color = ? WHERE id = ? AND user_id = ?',
            [nombre, color, id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }

        res.json({ mensaje: 'Materia actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una materia del usuario
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que la materia pertenece al usuario
        const [materia] = await pool.query(
            'SELECT id FROM materias WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );
        
        if (materia.length === 0) {
            return res.status(404).json({ error: 'Materia no encontrada o no tienes permisos' });
        }

        // Verificar si tiene tareas asociadas
        const [tareas] = await pool.query(
            'SELECT COUNT(*) AS total FROM tareas WHERE materia_id = ? AND user_id = ?',
            [id, req.user.id]
        );
        
        if (tareas[0].total > 0) {
            return res.status(400).json({ 
                error: 'No se puede eliminar la materia porque tiene tareas asociadas' 
            });
        }

        const [result] = await pool.query(
            'DELETE FROM materias WHERE id = ? AND user_id = ?',
            [id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Materia no encontrada' });
        }

        res.json({ mensaje: 'Materia eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;