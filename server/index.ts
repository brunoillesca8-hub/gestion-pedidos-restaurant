import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { db, initDatabase, DEFAULT_SETTINGS } from './db';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Inicializar tablas y datos
initDatabase();

// --- 0. Ajustes del Local (Nombre, Eslogan, Contraseñas) ---
app.get('/api/settings', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM settings');
    const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
    result.rows.forEach(r => {
      settingsMap[String(r.key)] = String(r.value);
    });
    res.json(settingsMap);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar ajustes' });
  }
});

app.patch('/api/settings', async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await db.execute({
        sql: 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        args: [key, String(value)]
      });
    }
    io.emit('settings_updated', updates);
    res.json({ success: true, updates });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ajustes' });
  }
});

// --- 1. Categorías ---
app.get('/api/categories', async (req, res) => {
  try {
    const result = await db.execute('SELECT * FROM categories ORDER BY order_index ASC');
    const categories = result.rows.map(r => ({
      id: String(r.id),
      name: String(r.name),
      order_index: Number(r.order_index),
      icon: String(r.icon || 'Coffee'),
      is_active: Boolean(r.is_active)
    }));
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar categorías' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name, icon, is_active } = req.body;
    const id = req.body.id || `cat-${Date.now()}`;
    const order_index = req.body.order_index || 1;

    await db.execute({
      sql: 'INSERT INTO categories (id, name, order_index, icon, is_active) VALUES (?, ?, ?, ?, ?)',
      args: [id, name, order_index, icon || 'Coffee', is_active ? 1 : 0]
    });

    const newCat = { id, name, order_index, icon, is_active };
    io.emit('categories_updated', newCat);
    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

app.patch('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, is_active } = req.body;

    await db.execute({
      sql: 'UPDATE categories SET name = ?, icon = ?, is_active = ? WHERE id = ?',
      args: [name, icon, is_active ? 1 : 0, id]
    });

    io.emit('categories_updated', { id, name, icon, is_active });
    res.json({ id, name, icon, is_active });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute({ sql: 'DELETE FROM categories WHERE id = ?', args: [id] });
    io.emit('category_deleted', id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

// --- 2. Productos ---
app.get('/api/products', async (req, res) => {
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
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar productos' });
  }
});

app.post('/api/products', async (req, res) => {
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

    const newProd = { id, category_id, name, description, price, image_url, is_available, tags };
    io.emit('products_updated', newProd);
    res.status(201).json(newProd);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, price, image_url, is_available, tags } = req.body;

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

    const updated = { id, category_id, name, description, price, image_url, is_available, tags };
    io.emit('products_updated', updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

app.patch('/api/products/:id/toggle-availability', async (req, res) => {
  try {
    const { id } = req.params;
    const current = await db.execute({ sql: 'SELECT is_available FROM products WHERE id = ?', args: [id] });
    if (current.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const newStatus = current.rows[0].is_available ? 0 : 1;
    await db.execute({
      sql: 'UPDATE products SET is_available = ? WHERE id = ?',
      args: [newStatus, id]
    });

    io.emit('product_availability_toggled', { id, is_available: Boolean(newStatus) });
    res.json({ id, is_available: Boolean(newStatus) });
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar disponibilidad' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [id] });
    io.emit('product_deleted', id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// --- 3. Comandas / Pedidos ---
app.get('/api/orders', async (req, res) => {
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
        status: String(o.status) as any,
        created_at: String(o.created_at),
        items: orderItems
      };
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Error al consultar comandas' });
  }
});

app.post('/api/orders', async (req, res) => {
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

    io.emit('new_order', newOrder);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear comanda' });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await db.execute({
      sql: 'UPDATE orders SET status = ? WHERE id = ?',
      args: [status, id]
    });

    io.emit('order_status_updated', { orderId: id, status });
    res.json({ id, status });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar estado de comanda' });
  }
});

// Reset Demo en Turso
app.post('/api/reset-demo', async (req, res) => {
  try {
    await db.execute('DELETE FROM order_items');
    await db.execute('DELETE FROM orders');
    await db.execute('DELETE FROM products');
    await db.execute('DELETE FROM categories');
    await initDatabase();

    io.emit('data_reset', true);
    res.json({ message: 'Base de datos Turso restablecida a datos de prueba' });
  } catch (err) {
    res.status(500).json({ error: 'Error al resetear la base de datos' });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor Gastronómico Turso escuchando en http://localhost:${PORT}`);
});
