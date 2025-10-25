import pool from '../config/db.js';

export const getOrders = async (req, res) => {
  try {
    // 1. Usamos JOIN para vincular la tabla 'orders' con la tabla 'users'
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
    console.error('Error al obtener pedidos (JOIN falló, verifica tabla users):', error);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

export const createOrder = async (req, res) => {
  const client = await pool.connect(); // Obtener un cliente de conexión
  try {
    await client.query('BEGIN'); // INICIAR TRANSACCIÓN

    // 🚨 CORREGIDO: Extraer todos los campos que envía el frontend
    const { user_id, total, estado, productos, direccion_entrega, ubicacion_lat, ubicacion_lon } = req.body; 

    // También verificamos que se envíe la dirección
    if (!user_id || !total || total <= 0 || !estado || !productos?.length || !direccion_entrega) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Datos de pedido incompletos o falta la dirección de entrega' });
    }

    // 1. INSERTAR EL PEDIDO PRINCIPAL
    // 🚨 CORREGIDO: Incluir las nuevas columnas en el INSERT y en los valores
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, estado, direccion_entrega, ubicacion_lat, ubicacion_lon, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [user_id, total, estado, direccion_entrega, ubicacion_lat, ubicacion_lon] // <-- Se pasan 6 valores
    );
    const orderId = orderResult.rows[0].id;

    // 2. INSERTAR LOS ÍTEMS DEL PEDIDO
    for (const p of productos) {
      // Validación estricta del precio
      if (!p.precio_unitario) {
          throw new Error('Falta precio unitario para un producto en el pedido.');
      }

      await client.query(
        `INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario, created_at) 
         VALUES ($1, $2, $3, $4, NOW())`,
        [orderId, p.product_id, p.cantidad, p.precio_unitario]
      );
    }
    
    await client.query('COMMIT'); // CONFIRMAR TRANSACCIÓN (si todo fue bien)

    res.status(201).json({ message: "Pedido creado exitosamente", orderId });

  } catch (error) {
    await client.query('ROLLBACK'); // DESHACER CAMBIOS (si algo falló)
    // 🚨 Importante: Este error puede seguir siendo por falta de columnas en la DB (direccion_entrega, ubicacion_lat/lon)
    console.error('Error al crear pedido (TRANSACCIÓN FALLIDA):', error.message || error);
    res.status(500).json({ error: 'Error interno al crear pedido. Verifique que las COLUMNAS de dirección existan en la tabla orders.' });
  } finally {
    client.release(); // LIBERAR CONEXIÓN
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
