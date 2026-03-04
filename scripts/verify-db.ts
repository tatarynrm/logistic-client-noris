import { prisma } from '../src/lib/db';

async function main() {
    try {
        console.log('Testing connection...');
        const userCount = await prisma.user.count();
        console.log('Successfully connected to database');
        console.log('User count:', userCount);

        if (userCount === 0) {
            console.log('WARNING: No users found in database. You might need to seed the database.');
        }
    } catch (error) {
        console.error('Failed to connect to database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
