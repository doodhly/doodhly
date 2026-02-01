import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER,      // Current ROOT
        password: process.env.DB_PASSWORD,
    });

    console.log('Connected as root. Creating service user...');

    // 1. Create User
    try {
        await connection.query(`CREATE USER IF NOT EXISTS 'doodhly_service'@'%' IDENTIFIED BY 'Milk@123';`);
        console.log('User created.');
    } catch (e) {
        console.log('User creation skipped/failed:', (e as any).message);
    }

    // 2. Grant Privileges (DML only, no DDL like DROP TABLE to be safe in runtime)
    // Actually for migrations we might need DDL, but usually service users are DML only.
    // However, since we run migrations with the same user in this simplified setup, we need DDL.
    // Let's restricting it slightly or just allowing everything on this specific DB.
    // For "Security Hardening", let's give ALL PRIVILEGES on doodhly.* but not global.

    await connection.query(`GRANT ALL PRIVILEGES ON doodhly.* TO 'doodhly_service'@'%';`);
    await connection.query(`FLUSH PRIVILEGES;`);

    console.log('Privileges granted to doodhly_service on database doodhly.');

    await connection.end();
}

main().catch(console.error);
