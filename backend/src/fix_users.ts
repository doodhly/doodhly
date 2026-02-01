import 'dotenv/config';
import db from './config/db';

async function fix() {
    await db('users').whereNull('default_city_id').update({ default_city_id: 1 });
    console.log('Users updated');
    process.exit(0);
}

fix();
