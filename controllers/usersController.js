import pool from '../config/db.js';
import bcrypt from 'bcrypt';

// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const userResult = await pool.query(
      'SELECT id, nombre, apellido, email, password, telefono, dni, direccion_fiscal, ciudad, barrio FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = userResult.rows[0];

    console.log('DB hash:', user.password);

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
        dni: user.dni || '',
        direccion: user.direccion_fiscal || '',
        ciudad: user.ciudad || '',
        barrio: user.barrio || ''
      }
    });

  } catch (error) {
    console.error('🔥 Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, dni, direccion_fiscal, ciudad, barrio } = req.body;

    if (!nombre || !email || !password || !dni) {
      return res.status(400).json({ error: 'Nombre, email, password y DNI son requeridos' });
    }

    const emailCheck = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR dni = $2',
      [email, dni]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'El email o DNI ya están registrados' });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await pool.query(
      `INSERT INTO users (nombre, apellido, email, password, telefono, dni, direccion_fiscal, ciudad, barrio)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, nombre, apellido, email, telefono, dni, direccion_fiscal, ciudad, barrio`,
      [nombre, apellido, email, hashedPassword, telefono, dni, direccion_fiscal, ciudad, barrio]
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error('🔥 Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = parseInt(id);
    if (isNaN(idNum)) return res.status(400).json({ error: 'ID inválido' });

    const result = await pool.query(
      'SELECT id, nombre, apellido, email, telefono, dni, direccion_fiscal, ciudad, barrio FROM users WHERE id = $1',
      [idNum]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error('🔥 Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
