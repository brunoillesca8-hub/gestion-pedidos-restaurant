import { initDatabase, db } from './db';

async function main() {
  console.log('🔄 Conectando a Turso y verificando tablas...');
  await initDatabase();
  
  const catCount = await db.execute('SELECT COUNT(*) as c FROM categories');
  const prodCount = await db.execute('SELECT COUNT(*) as c FROM products');
  const ordCount = await db.execute('SELECT COUNT(*) as c FROM orders');
  
  console.log(`✅ Base de datos Turso conectada exitosamente:`);
  console.log(`- Categorías: ${catCount.rows[0].c}`);
  console.log(`- Productos: ${prodCount.rows[0].c}`);
  console.log(`- Pedidos iniciales: ${ordCount.rows[0].c}`);
}

main().catch(console.error);
