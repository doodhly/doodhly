import 'dotenv/config';
import db from '../config/db';

async function manageRoles() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('Usage: npx tsx src/scripts/manage_roles.ts <phone_number> <ROLE>');
        console.log('Example roles: ADMIN, DELIVERY_PARTNER, CUSTOMER');
        process.exit(1);
    }

    const [phone, role] = args;
    const validRoles = ['ADMIN', 'DELIVERY_PARTNER', 'CUSTOMER'];

    if (!validRoles.includes(role.toUpperCase())) {
        console.error(`Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}`);
        process.exit(1);
    }

    try {
        const updated = await db('users')
            .where('phone_hash', phone)
            .update({ role: role.toUpperCase(), updated_at: new Date() });

        if (updated) {
            console.log(`Successfully updated ${phone} to ${role.toUpperCase()}`);
        } else {
            console.error(`User with phone ${phone} not found.`);
        }
    } catch (error) {
        console.error('Database error:', error);
    } finally {
        process.exit(0);
    }
}

manageRoles();
