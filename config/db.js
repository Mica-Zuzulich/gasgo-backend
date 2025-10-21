// src/config/db.js (o como se llame tu archivo de conexión)
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Creamos el pool directamente con la URL
const pool = new Pool({
  // pg busca automáticamente la variable 'DATABASE_URL' si no le pasas un objeto
  // Pero para asegurarnos, usamos la conexión con la cadena:
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

pool.connect()
  .then(() => console.log('Conectado a PostgreSQL en Railway'))
  .catch(err => console.error('Error al conectar a PostgreSQL', err));

export default pool;