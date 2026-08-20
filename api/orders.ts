import { db, ensureDatabaseReady } from './_db';

export default async function handler(req: any, res: any) {
  await ensureDatabaseReady();

  if (req.method === 'GET') {
    try {
      const ordersRes = await db.execute('SELECT * FROM orders ORDER BY created_at DESC');
      const itemsRes = await db.execute('SELECT * FROM order_items');

      const orders = ordersRes.rows.map(o => {
        const orderItems = itemsRes.rows
          .filter(item => item.order_id === o.id)
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
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const newOrder = req.body;
      await db.execute({
        sql: 'INSERT INTO orders (id, table_number, general_notes, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        args: [
          newOrder.id,
          String(newOrder.table_number),
          newOrder.general_notes || '',
          newOrder.total_amount,
          newOrder.status,
          newOrder.created_at
        ]
      });

      for (const it of newOrder.items || []) {
        await db.execute({
          sql: 'INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, item_notes, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          args: [
            it.id || `item-${Date.now()}-${Math.random()}`,
            newOrder.id,
            it.product_id,
            it.product_name,
            it.quantity,
            it.unit_price,
            it.item_notes || '',
            it.subtotal
          ]
        });
      }

      return res.status(201).json(newOrder);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
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
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
