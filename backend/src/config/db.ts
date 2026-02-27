
import knex from 'knex';

const db = knex({
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'doodhly',
        connectTimeout: 30000, // 30 seconds
    },
    pool: {
        min: process.env.NODE_ENV === 'test' ? 1 : 2,
        max: process.env.NODE_ENV === 'test' ? 5 : 10,
        acquireTimeoutMillis: 60000, // 60 seconds
        createTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
        reapIntervalMillis: 1000,
        propagateCreateError: false // prevent crash on initial connection fail
    }
});

export default db;
