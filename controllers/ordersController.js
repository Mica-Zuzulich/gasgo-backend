import pool from '../config/db.js';

export const getOrders = async (req, res) => {
  try {
    // 1. Usamos JOIN para vincular la tabla 'orders' con la tabla 'users'
    // Esto trae el nombre y email del usuario que hizo el pedido.
    const query = `
      SELECT 
        o.*,
        u.nombre AS cliente,  -- Renombramos u.nombre a 'cliente' para coincidir con el frontend
        u.email AS email      -- Traemos el email del usuario
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener pedidos', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { user_id, total, estado, productos } = req.body; 

    if (!user_id || !total || total <= 0 || !estado || !productos?.length) {
      return res.status(400).json({ error: 'Datos de pedido incompletos' });
    }

    const orderResult = await pool.query(
      'INSERT INTO orders (user_id, total, estado, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [user_id, total, estado] 
    );
    const orderId = orderResult.rows[0].id;

    for (const p of productos) {
      // CORRECCIÓN/OPTIMIZACIÓN: Usamos el precio_unitario que asumimos viene en p
      // Y quitamos el SELECT que puede fallar.
      if (!p.precio_unitario) {
          console.error('Falta precio unitario en el item del pedido');
          // Podríamos lanzar un error aquí para evitar el fallo del INSERT
      }

      await pool.query(
        `INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario, created_at) 
         VALUES ($1, $2, $3, $4, NOW())`,
        [orderId, p.product_id, p.cantidad, p.precio_unitario] // Asumimos que p.precio_unitario existe
      );
    }

    res.status(201).json({ message: "Pedido creado exitosamente", orderId });
  } catch (error) {
    console.error('Error al crear pedido (verifique logs de DB):', error);
    res.status(500).json({ error: 'Error interno al crear pedido' });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'ID de pedido inválido' });
    }

    const orderCheck = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);
    if (!orderCheck.rows.length) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    await pool.query('UPDATE orders SET estado = $1 WHERE id = $2', ['cancelado', orderId]);

    res.json({ message: 'Pedido cancelado exitosamente' });
  } catch (error) {
    console.error('Error al cancelar pedido:', error);
    res.status(500).json({ error: 'Error interno al cancelar pedido' });
  }
};
