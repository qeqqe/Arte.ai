import * as dotenv from 'dotenv';
import { validateDatabaseUrl } from './utils';

dotenv.config();

async function testDatabaseConnection() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not defined');
    }

    const connectionString = process.env.DATABASE_URL;

    validateDatabaseUrl(connectionString);
    console.log('✅ Database URL format is valid');

    const url = new URL(connectionString);
    console.log(`\nDatabase connection info:`);
    console.log(`- Protocol: ${url.protocol.replace(':', '')}`);
    console.log(`- Host: ${url.hostname}`);
    console.log(`- Port: ${url.port || '5432 (default)'}`);
    console.log(`- Database: ${url.pathname.replace('/', '')}`);
    console.log(`- Username: ${url.username}`);
    console.log(`- Password: ${'*'.repeat(url.password.length)}`);

    // Test DNS resolution
    console.log(`\nTesting DNS resolution for ${url.hostname}...`);
    const dns = require('dns').promises;
    const addresses = await dns.lookup(url.hostname);
    console.log(
      `✅ DNS resolution successful: ${url.hostname} -> ${addresses.address}`,
    );

    // Test TCP connection
    console.log(
      `\nTesting TCP connection to ${url.hostname}:${url.port || 5432}...`,
    );
    const net = require('net');
    await new Promise((resolve, reject) => {
      const socket = net.createConnection({
        host: url.hostname,
        port: url.port || 5432,
        timeout: 5000,
      });

      socket.on('connect', () => {
        console.log(`✅ TCP connection successful`);
        socket.end();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });

      socket.on('error', (err) => {
        reject(err);
      });
    });

    // Test actual database connection
    console.log(`\nTesting database authentication and connection...`);
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: connectionString,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      connectionTimeoutMillis: 10000,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log(`✅ Database connection successful!`);
    console.log(`Database time: ${result.rows[0].now}`);
    client.release();
    await pool.end();

    console.log(
      `\nAll connection tests passed successfully! Your database connection is working properly.`,
    );
  } catch (error) {
    console.error(`\n❌ Connection test failed: ${error.message}`);
    console.error(`\nPossible solutions:`);
    console.error(`1. Check if the database server is running`);
    console.error(`2. Verify your DATABASE_URL in .env file`);
    console.error(`3. Check your network connection and firewall settings`);
    console.error(
      `4. If using Neon or other cloud DB, verify the database is active`,
    );
    console.error(
      `5. Try connecting from a different network (e.g., without VPN)`,
    );
    process.exit(1);
  }
}

testDatabaseConnection();
