import { db, ensureDatabaseReady } from './_db';

export default async function handler(req: any, res: any) {
  await ensureDatabaseReady();

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM categories ORDER BY order_index ASC');
      const categories = result.rows.map(r => ({
        id: String(r.id),
        name: String(r.name),
        order_index: Number(r.order_index),
        icon: String(r.icon || 'Coffee'),
        is_active: Boolean(r.is_active)
      }));
      return res.status(200).json(categories);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, icon, is_active } = req.body;
      const id = req.body.id || `cat-${Date.now()}`;
      const order_index = req.body.order_index || 1;

      await db.execute({
        sql: 'INSERT INTO categories (id, name, order_index, icon, is_active) VALUES (?, ?, ?, ?, ?)',
        args: [id, name, order_index, icon || 'Coffee', is_active ? 1 : 0]
      });

      return res.status(201).json({ id, name, order_index, icon, is_active });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, name, icon, is_active } = req.body;
      await db.execute({
        sql: 'UPDATE categories SET name = ?, icon = ?, is_active = ? WHERE id = ?',
        args: [name, icon, is_active ? 1 : 0, id]
      });
      return res.status(200).json({ id, name, icon, is_active });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query.id || req.body.id;
      await db.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [id] });
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
