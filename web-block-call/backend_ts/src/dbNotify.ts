// listenNotifications.ts
import pool from './db';

export async function dbNotificationListener() {
  const client = await pool.connect();

  client.on('error', (err) => {
    console.error('PostgreSQL LISTEN client error:', err);
  });

  await client.query('LISTEN table_update_channel');

  client.on('notification', (msg) => {
    if (msg.channel === 'table_update_channel') {
      const payload = msg.payload ?? '';
      console.log('[NOTIFY] table_update_channel:', payload);

      // TODO: Emit via WebSocket, PubSub, etc.
    }
  });

  console.log('Listening to table_update_channel');
}
