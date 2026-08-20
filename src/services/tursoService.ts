import { createClient } from '@libsql/client/web';
import { Category, Product, Order, RestaurantSettings } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../data/initialData';

const TURSO_URL = 'libsql://pedidos-restaurant-brunoillesca.aws-us-east-1.turso.io';
const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODcyNDc3MzQsImlkIjoiMDFhMDIwNDAtYjIwMS03MWQ2LThkMDMtNWM4NmVmMDlhMDM2Iiwia2lkIjoieUZRUkNaUVhCXzZOZ3JSeHdwOXEtRzNNY3hmMkVZa2xDS0dweXlHV3E3QSIsInJpZCI6ImNjZDQ2OTgyLWIyZDktNGE5Mi1hYmJkLTQzMzU5MTc1YmViYyJ9.ttBRSYz8_IdQ7vuv-8AuhQVq6gadp4bJUN_xNuJiihfGgDlPTXVfp8EWzWiQkLQWRJzSIhZ5QDzB0lKqAhBlAA';

export const turso = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN
});

export const DEFAULT_SETTINGS: RestaurantSettings = {
  name: 'Café & Bistró Bellavista',
  tagline: 'Especialidad & Pastelería',
  admin_pin: '1234',
  kds_pin: '12345',
  currency_symbol: '$'
};

// Inicializar y asegurar tablas
export async function initTursoClient() {
  try {
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        order_index INTEGER DEFAULT 1,
        icon TEXT DEFAULT 'Coffee',
        is_active INTEGER DEFAULT 1
      );
    `);

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        category_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        image_url TEXT,
        is_available INTEGER DEFAULT 1,
        tags TEXT
      );
    `);

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        table_number TEXT NOT NULL,
        general_notes TEXT,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    await turso.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT,
        product_name TEXT,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        item_notes TEXT,
        subtotal REAL NOT NULL
      );
    `);

    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await turso.execute({
        sql: 'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
        args: [key, String(value)]
      });
    }

    const check = await turso.execute('SELECT COUNT(*) as count FROM categories');
    if (Number(check.rows[0]?.count || 0) === 0) {
      for (const cat of INITIAL_CATEGORIES) {
        await turso.execute({
          sql: 'INSERT INTO categories (id, name, order_index, icon, is_active) VALUES (?, ?, ?, ?, ?)',
          args: [cat.id, cat.name, cat.order_index, cat.icon || 'Coffee', cat.is_active ? 1 : 0]
        });
      }

      for (const prod of INITIAL_PRODUCTS) {
        await turso.execute({
          sql: 'INSERT INTO products (id, category_id, name, description, price, image_url, is_available, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          args: [
            prod.id,
            prod.category_id,
            prod.name,
            prod.description,
            prod.price,
            prod.image_url,
            prod.is_available ? 1 : 0,
            JSON.stringify(prod.tags || [])
          ]
        });
      }

      for (const order of INITIAL_ORDERS) {
        await turso.execute({
          sql: 'INSERT INTO orders (id, table_number, general_notes, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          args: [
            order.id,
            String(order.table_number),
            order.general_notes || '',
            order.total_amount,
            order.status,
            order.created_at
          ]
        });

        for (const it of order.items) {
          await turso.execute({
            sql: 'INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, item_notes, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            args: [
              it.id,
              order.id,
              it.product_id,
              it.product_name,
              it.quantity,
              it.unit_price,
              it.item_notes || '',
              it.subtotal
            ]
          });
        }
      }
    }
  } catch (err) {
    console.error('Error inicializando Turso:', err);
  }
}

// 1. Obtener todas las órdenes
export async function fetchOrdersFromTurso(): Promise<Order[]> {
  try {
    const ordersRes = await turso.execute('SELECT * FROM orders ORDER BY created_at DESC');
    const itemsRes = await turso.execute('SELECT * FROM order_items');

    return ordersRes.rows.map(o => {
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
        status: String(o.status) as any,
        created_at: String(o.created_at),
        items: orderItems
      };
    });
  } catch (e) {
    console.error('Error consultando órdenes de Turso:', e);
    throw e;
  }
}

// 2. Guardar una nueva orden
export async function saveOrderToTurso(order: Order): Promise<void> {
  try {
    await turso.execute({
      sql: 'INSERT INTO orders (id, table_number, general_notes, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      args: [
        order.id,
        String(order.table_number),
        order.general_notes || '',
        order.total_amount,
        order.status,
        order.created_at
      ]
    });

    for (const it of order.items) {
      await turso.execute({
        sql: 'INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, item_notes, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          it.id || `item-${Date.now()}-${Math.random()}`,
          order.id,
          it.product_id,
          it.product_name,
          it.quantity,
          it.unit_price,
          it.item_notes || '',
          it.subtotal
        ]
      });
    }
  } catch (e) {
    console.error('Error insertando orden en Turso:', e);
    throw e;
  }
}

// 3. Actualizar estado de una orden
export async function updateOrderStatusInTurso(orderId: string, status: string): Promise<void> {
  try {
    await turso.execute({
      sql: 'UPDATE orders SET status = ? WHERE id = ?',
      args: [status, orderId]
    });
  } catch (e) {
    console.error('Error actualizando estado en Turso:', e);
  }
}

// 4. Obtener productos y categorías
export async function fetchProductsFromTurso(): Promise<Product[]> {
  try {
    const res = await turso.execute('SELECT * FROM products');
    return res.rows.map(r => {
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
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export async function fetchCategoriesFromTurso(): Promise<Category[]> {
  try {
    const res = await turso.execute('SELECT * FROM categories ORDER BY order_index ASC');
    return res.rows.map(r => ({
      id: String(r.id),
      name: String(r.name),
      order_index: Number(r.order_index),
      icon: String(r.icon || 'Coffee'),
      is_active: Boolean(r.is_active)
    }));
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export async function fetchSettingsFromTurso(): Promise<RestaurantSettings> {
  try {
    const res = await turso.execute('SELECT * FROM settings');
    const map: Record<string, string> = { ...DEFAULT_SETTINGS };
    res.rows.forEach(r => {
      map[String(r.key)] = String(r.value);
    });
    return map as unknown as RestaurantSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettingsInTurso(settings: Partial<RestaurantSettings>): Promise<void> {
  try {
    for (const [key, value] of Object.entries(settings)) {
      await turso.execute({
        sql: 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        args: [key, String(value)]
      });
    }
  } catch (e) {
    console.error('Error actualizando settings en Turso:', e);
  }
}
