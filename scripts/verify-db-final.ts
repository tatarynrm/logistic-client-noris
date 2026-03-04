import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function main() {
    const connectionString = process.env.DATABASE_URL;
    console.log('Testing connection to:', connectionString?.replace(/:[^@]*@/, ':****@'));

    if (!connectionString) {
        console.error('DATABASE_URL environment variable is not set');
        process.exit(1);
    }

    const pool = new pg.Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        await prisma.$connect();
        console.log('✅ Successfully connected to database');
        const userCount = await prisma.user.count();
        console.log('📊 User count in database:', userCount);

        if (userCount === 0) {
            console.log('⚠️ WARNING: No users found. Authentication will fail unless you seed the database.');
        }
    } catch (error) {
        console.error('❌ Failed to connect to database:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main().catch(console.error);
