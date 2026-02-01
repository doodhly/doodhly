import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log('Connecting to MySQL...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
    });

    const dbName = process.env.DB_NAME;
    console.log(`Creating database '${dbName}' if it implies...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' check complete.`);
    await connection.end();
}

main().catch((err) => {
    console.error('Failed to create database:', err);
    process.exit(1);
});
