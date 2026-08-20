import { db, ensureDatabaseReady } from './_db';

export default async function handler(req: any, res: any) {
  await ensureDatabaseReady();

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM products');
      const products = result.rows.map(r => {
        let tags: string[] = [];
        try {
          tags = r.tags ? JSON.parse(String(r.tags)) : [];
        } catch {
          tags = [];
        }
        return {
          id: String(r.id),
          category_id: String(r.category_id),
          name: String(r.name),
          description: String(r.description || ''),
          price: Number(r.price),
          image_url: String(r.image_url || ''),
          is_available: Boolean(r.is_available),
          tags
        };
      });
      return res.status(200).json(products);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { category_id, name, description, price, image_url, is_available, tags } = req.body;
      const id = req.body.id || `prod-${Date.now()}`;

      await db.execute({
        sql: 'INSERT INTO products (id, category_id, name, description, price, image_url, is_available, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          id,
          category_id,
          name,
          description || '',
          price,
          image_url || '',
          is_available ? 1 : 0,
          JSON.stringify(tags || [])
        ]
      });

      return res.status(201).json({ id, category_id, name, description, price, image_url, is_available, tags });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const { id, category_id, name, description, price, image_url, is_available, tags, toggleAvailabilityOnly } = req.body;

      if (toggleAvailabilityOnly) {
        const cur = await db.execute({ sql: 'SELECT is_available FROM products WHERE id = ?', args: [id] });
        const newStatus = cur.rows[0].is_available ? 0 : 1;
        await db.execute({ sql: 'UPDATE products SET is_available = ? WHERE id = ?', args: [newStatus, id] });
        return res.status(200).json({ id, is_available: Boolean(newStatus) });
      }

      await db.execute({
        sql: 'UPDATE products SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?, is_available = ?, tags = ? WHERE id = ?',
        args: [
          category_id,
          name,
          description || '',
          price,
          image_url || '',
          is_available ? 1 : 0,
          JSON.stringify(tags || []),
          id
        ]
      });

      return res.status(200).json({ id, category_id, name, description, price, image_url, is_available, tags });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query.id || req.body.id;
      await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
      return res.status(200).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
