import db from '@/config/db';
import logger from '@/core/utils/logger';

// Silence logger during tests
logger.silent = true;

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'doodhly_test';

beforeAll(async () => {
    try {
        // Run migrations on test database
        await db.migrate.latest();
        console.log('✓ Test database migrations completed');
    } catch (error) {
        console.error('Failed to run migrations:', error);
        throw error;
    }
});

afterAll(async () => {
    try {
        // Rollback migrations and close connection
        await db.migrate.rollback();
        await db.destroy();
        console.log('✓ Test database cleaned up');
    } catch (error) {
        console.error('Failed to cleanup database:', error);
    }
});

afterEach(async () => {
    // Clear all tables after each test for isolation
    try {
        await db.raw('SET FOREIGN_KEY_CHECKS = 0');

        const tables = await db.raw('SHOW TABLES');
        const tableKey = `Tables_in_${process.env.DB_NAME}`;

        for (const table of tables[0]) {
            const tableName = table[tableKey];
            // Skip migrations table
            if (tableName !== 'knex_migrations' && tableName !== 'knex_migrations_lock') {
                await db(tableName).truncate();
            }
        }

        await db.raw('SET FOREIGN_KEY_CHECKS = 1');
    } catch (error) {
        console.error('Failed to clear tables:', error);
    }
});

// Helper function to create test user
export async function createTestUser(overrides = {}) {
    const defaultUser = {
        name: 'Test User',
        phone: '+919876543210',
        phone_hash: require('crypto').createHash('sha256').update('+919876543210').digest('hex'),
        role: 'CUSTOMER',
        is_active: true,
        ...overrides,
    };

    const [userId] = await db('users').insert(defaultUser);
    return { ...defaultUser, id: userId };
}

// Helper function to create test product
export async function createTestProduct(overrides = {}) {
    const defaultProduct = {
        name: 'Test Milk',
        price_paisa: 5000, // ₹50
        unit: 'L',
        is_active: true,
        ...overrides,
    };

    const [productId] = await db('products').insert(defaultProduct);
    return { ...defaultProduct, id: productId };
}

// Helper function to create test wallet
export async function createTestWallet(userId: number, balance = 0) {
    await db('wallets').insert({
        user_id: userId,
        balance_paisa: balance,
    });

    return { user_id: userId, balance_paisa: balance };
}
