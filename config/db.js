import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false } 
});

pool.connect()
  .then(() => console.log('Conectado a PostgreSQL en Railway'))
  .catch(err => console.error('Error al conectar a PostgreSQL', err));

export default pool;
