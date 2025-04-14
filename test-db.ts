/*
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const connectionString = 'postgresql://neondb_owner:npg_vE4SX5uHAfFQ@ep-bitter-cloud-a5kzq17y.cloud.neon.tech/neondb?sslmode=require';

async function testConnection() {
  const pool = new Pool({ connectionString });
  
  try {
    console.log('Attempting to connect to database...');
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful! Current database time:', result.rows[0].now);
  } catch (error) {
    console.error('Failed to connect:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
*/



import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

// USE THE HOSTNAME WITHOUT "-pooler" HERE
const connectionString = 'postgresql://neondb_owner:npg_vE4SX5uHAfFQ@ep-bitter-cloud-a5kzq17y.us-east-2.aws.neon.tech/neondb?sslmode=require';

async function testConnection() {
  // The Pool constructor will use the connectionString above
  const pool = new Pool({ connectionString }); 
  
  try {
    console.log('Attempting to connect to database (via WebSocket Pooler)...'); // Added clarity
    // The library internally modifies the hostname to add "-pooler" before connecting
    const result = await pool.query('SELECT NOW()');
    console.log('Connection successful! Current database time:', result.rows[0].now);
  } catch (error) {
    console.error('Failed to connect:', error);
  } finally {
    // Important: Close the pool to release resources
    await pool.end(); 
    console.log('Connection pool closed.');
  }
}

testConnection();
