import { db, ensureDatabaseReady } from './_db';

export default async function handler(req: any, res: any) {
  // Desactivar cualquier caché de navegador o de Vercel Edge para que los pedidos sean 100% en tiempo real
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    await ensureDatabaseReady();
  } catch (dbErr: any) {
    console.error('Error al inicializar tablas en orders:', dbErr);
  }

  if (req.method === 'GET') {
    try {
      const ordersRes = await db.execute('SELECT * FROM orders ORDER BY created_at DESC');
      const itemsRes = await db.execute('SELECT * FROM order_items');

      const orders = ordersRes.rows.map(o => {
        const orderItems = itemsRes.rows
          .filter(item => String(item.order_id) === String(o.id))
          .map(it => ({
            id: String(it.id),
            order_id: String(it.order_id),
            product_id: String(it.product_id),
            product_name: String(it.product_name),
            quantity: Number(it.quantity),
            unit_price: Number(it.unit_price),
            item_notes: String(it.item_notes || ''),
            subtotal: Number(it.subtotal)
          }));

        return {
          id: String(o.id),
          table_number: String(o.table_number),
          general_notes: String(o.general_notes || ''),
          total_amount: Number(o.total_amount),
          status: String(o.status),
          created_at: String(o.created_at),
          items: orderItems
        };
      });

      return res.status(200).json(orders);
    } catch (err: any) {
      console.error('Error en GET /api/orders:', err);
      return res.status(500).json({ error: err.message || 'Error al obtener comandas' });
    }
  }

  if (req.method === 'POST') {
    try {
      const newOrder = req.body;
      if (!newOrder || !newOrder.id) {
        return res.status(400).json({ error: 'Datos de orden incompletos' });
      }

      await db.execute({
        sql: 'INSERT INTO orders (id, table_number, general_notes, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        args: [
          newOrder.id,
          String(newOrder.table_number),
          newOrder.general_notes || '',
          Number(newOrder.total_amount) || 0,
          newOrder.status || 'pendiente',
          newOrder.created_at || new Date().toISOString()
        ]
      });

      for (const it of newOrder.items || []) {
        await db.execute({
          sql: 'INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, item_notes, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          args: [
            it.id || `item-${Date.now()}-${Math.random()}`,
            newOrder.id,
            it.product_id || '',
            it.product_name || '',
            Number(it.quantity) || 1,
            Number(it.unit_price) || 0,
            it.item_notes || '',
            Number(it.subtotal) || 0
          ]
        });
      }

      console.log('✅ Comanda insertada en Turso con éxito:', newOrder.id);
      return res.status(201).json(newOrder);
    } catch (err: any) {
      console.error('Error en POST /api/orders:', err);
      return res.status(500).json({ error: err.message || 'Error al guardar comanda en Turso' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, status } = req.body;
      await db.execute({
        sql: 'UPDATE orders SET status = ? WHERE id = ?',
        args: [status, id]
      });
      return res.status(200).json({ id, status });
    } catch (err: any) {
      console.error('Error en PATCH /api/orders:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
