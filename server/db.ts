import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ORDERS } from '../src/data/initialData';

dotenv.config();

const url = process.env.TURSO_DATABASE_URL || 'file:local.db';
const authToken = process.env.TURSO_AUTH_TOKEN || undefined;

export const db = createClient({
  url,
  authToken
});

export const DEFAULT_SETTINGS = {
  name: 'Café & Bistró Bellavista',
  tagline: 'Especialidad & Pastelería',
  admin_pin: '1234',
  kds_pin: '12345',
  currency_symbol: '$'
};

export async function initDatabase() {
  try {
    // 1. Crear tablas si no existen
    await db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        order_index INTEGER DEFAULT 1,
        icon TEXT DEFAULT 'Coffee',
        is_active INTEGER DEFAULT 1
      );
    `);

    await db.execute(`
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

    await db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        table_number TEXT NOT NULL,
        general_notes TEXT,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    await db.execute(`
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

    // 2. Comprobar e insertar settings por defecto
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
        args: [key, String(value)]
      });
    }

    // 3. Comprobar si ya existen categorías para sembrar datos
    const checkCat = await db.execute('SELECT COUNT(*) as count FROM categories');
    const count = Number(checkCat.rows[0].count);

    if (count === 0) {
      console.log('🌱 Inicializando datos semilla en la base de datos Turso...');
      
      // Insertar Categorías
      for (const cat of INITIAL_CATEGORIES) {
        await db.execute({
          sql: 'INSERT INTO categories (id, name, order_index, icon, is_active) VALUES (?, ?, ?, ?, ?)',
          args: [cat.id, cat.name, cat.order_index, cat.icon || 'Coffee', cat.is_active ? 1 : 0]
        });
      }

      // Insertar Productos
      for (const prod of INITIAL_PRODUCTS) {
        await db.execute({
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

      // Insertar Pedidos de prueba
      for (const order of INITIAL_ORDERS) {
        await db.execute({
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

        for (const item of order.items) {
          await db.execute({
            sql: 'INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, item_notes, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            args: [
              item.id,
              order.id,
              item.product_id,
              item.product_name,
              item.quantity,
              item.unit_price,
              item.item_notes || '',
              item.subtotal
            ]
          });
        }
      }
      console.log('✅ Datos semilla inicializados con éxito.');
    }
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
  }
}
