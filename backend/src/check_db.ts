import 'dotenv/config';
import db from './config/db';

async function check() {
    const users = await db('users').select('*');
    console.log('USERS:', JSON.stringify(users, null, 2));
    const products = await db('products').select('*');
    console.log('PRODUCTS:', JSON.stringify(products, null, 2));
    process.exit(0);
}

check();
