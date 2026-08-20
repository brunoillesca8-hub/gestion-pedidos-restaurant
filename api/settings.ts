import { db, ensureDatabaseReady, DEFAULT_SETTINGS } from './_db';

export default async function handler(req: any, res: any) {
  await ensureDatabaseReady();

  if (req.method === 'GET') {
    try {
      const result = await db.execute('SELECT * FROM settings');
      const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
      result.rows.forEach(r => {
        settingsMap[String(r.key)] = String(r.value);
      });
      return res.status(200).json(settingsMap);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'PATCH' || req.method === 'POST') {
    try {
      const updates = req.body; // e.g. { name, tagline, admin_pin, kds_pin }
      for (const [key, value] of Object.entries(updates)) {
        await db.execute({
          sql: 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
          args: [key, String(value)]
        });
      }
      return res.status(200).json({ success: true, updates });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'PATCH', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
