const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Verificar conexión
pool.getConnection()
    .then(conn => {
        const res = conn.query('SELECT 1');
        conn.release();
        return res;
    })
    .then(results => {
        console.log('Conectado a la base de datos MySQL');
    })
    .catch(err => {
        console.error('Error al conectar:', err);
    });

module.exports = pool;