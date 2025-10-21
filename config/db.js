import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';



if (!process.env.DATABASE_URL) {
  dotenv.config();
}


const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

pool.connect()
  .then(() => console.log('Conectado a PostgreSQL en Railway'))
  .catch(err => console.error('Error al conectar a PostgreSQL', err));

export default pool;
