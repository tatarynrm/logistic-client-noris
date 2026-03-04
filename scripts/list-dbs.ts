import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function main() {
    // Try to connect to 'postgres' database to list others
    const connectionString = process.env.DATABASE_URL?.replace(/\/([^/]+)$/, '/postgres');

    if (!connectionString) {
        console.error('DATABASE_URL not set');
        process.exit(1);
    }

    const pool = new pg.Pool({ connectionString });

    try {
        const res = await pool.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
        console.log('Available databases:');
        res.rows.forEach(row => console.log(`- ${row.datname}`));
    } catch (error) {
        console.error('Failed to list databases:', error);
    } finally {
        await pool.end();
    }
}

main().catch(console.error);
