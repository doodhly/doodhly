
import db from '../../config/db';

export class AdminService {

    async getDashboardSummary(cityId: number) {
        // Today's Deliveries Summary
        const today = new Date().toISOString().split('T')[0];

        const deliveryStats = await db('daily_deliveries')
            .where({ city_id: cityId, date: today })
            .select('status')
            .count('id as count')
            .groupBy('status');

        // Low Balance Users
        const lowBalanceUsers = await db('wallets as w')
            .join('users as u', 'w.user_id', 'u.id')
            .where('w.balance', '<', 5000) // Rs. 50
            .select('u.name', 'u.phone_hash as phone', 'w.balance')
            .limit(5);

        // Recent Issues
        const recentIssues = await db('daily_deliveries as dd')
            .join('users as u', 'dd.user_id', 'u.id')
            .where({ 'dd.city_id': cityId, 'dd.status': 'MISSED' })
            .select('u.name', 'dd.status', 'dd.updated_at')
            .orderBy('dd.updated_at', 'desc')
            .limit(5);

        // User Analytics
        const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const activeUsersCount = await db('users')
            .where({ is_active: true, role: 'CUSTOMER' })
            .count('id as count')
            .first();

        const onlineUsersCount = await db('users')
            .where('last_seen_at', '>', fiveMinsAgo)
            .where({ role: 'CUSTOMER' })
            .count('id as count')
            .first();

        const monthlyVisitorsCount = await db('users')
            .where('last_seen_at', '>', startOfMonth)
            .where({ role: 'CUSTOMER' })
            .count('id as count')
            .first();

        return {
            deliveries: deliveryStats,
            lowBalanceUsers,
            recentIssues,
            metrics: {
                activeUsers: Number(activeUsersCount?.count || 0),
                onlineUsers: Number(onlineUsersCount?.count || 0),
                monthlyVisitors: Number(monthlyVisitorsCount?.count || 0)
            }
        };
    }

    async getProducts() {
        return db('products').select('*').orderBy('id', 'asc');
    }

    async toggleProduct(productId: number, isActive: boolean) {
        return db('products').where({ id: productId }).update({ is_active: isActive });
    }

    async getRunSheets(cityId: number, date: string) {
        return db('daily_deliveries as dd')
            .join('users as u', 'dd.user_id', 'u.id')
            .join('subscriptions as s', 'dd.subscription_id', 's.id')
            .join('products as p', 's.product_id', 'p.id')
            .where({ 'dd.city_id': cityId, 'dd.date': date })
            .select(
                'dd.id',
                'u.name',
                'p.name as product',
                'dd.status',
                'dd.updated_at'
            )
            .orderBy('u.name', 'asc');
    }

    // --- Expanded Features ---

    async createProduct(data: any) {
        return db('products').insert({
            name: data.name,
            description: data.description,
            price_paisa: data.price_paisa,
            unit: data.unit,
            is_active: data.is_active ?? true,
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    async updateProduct(id: number, data: any) {
        return db('products').where({ id }).update({
            ...data,
            updated_at: new Date()
        });
    }

    async getCustomers(cityId: number, search?: string) {
        let query = db('users as u')
            .leftJoin('wallets as w', 'w.user_id', 'u.id')
            .leftJoin('addresses as a', function () {
                this.on('a.user_id', '=', 'u.id')
                    .andOn('a.id', '=', db.raw('(SELECT id FROM addresses WHERE user_id = u.id ORDER BY updated_at DESC LIMIT 1)'));
            })
            .where(function () {
                if (cityId) {
                    this.where({ 'u.default_city_id': cityId })
                        .orWhereNull('u.default_city_id'); // Temporary: allow seeing unassigned users
                }
            })
            .select(
                'u.id',
                'u.name',
                'u.phone_hash as phone',
                'u.whatsapp_number',
                'u.household_size',
                'u.daily_milk_liters',
                'u.role',
                'u.is_active',
                'u.last_seen_at',
                'u.created_at',
                'w.balance',
                'a.street as address',
                'a.lat',
                'a.lng'
            );

        if (search) {
            query = query.where(function () {
                this.where('u.name', 'like', `%${search}%`)
                    .orWhere('u.phone_hash', 'like', `%${search}%`);
            });
        }

        return query.orderBy('u.created_at', 'desc');
    }

    async adjustWallet(adminId: number, userId: number, amountPaisa: number, note: string) {
        return db.transaction(async (trx) => {
            // Update balance
            await trx('wallets')
                .where({ user_id: userId })
                .increment('balance', amountPaisa);

            // Fetch current balance for ledger
            const wallet = await trx('wallets').where({ user_id: userId }).first();

            // Log entry
            await trx('wallet_ledger').insert({
                wallet_id: wallet.id,
                amount_paisa: amountPaisa,
                direction: amountPaisa > 0 ? 'CREDIT' : 'DEBIT',
                type: 'ADJUSTMENT',
                description: `Admin Adjustment: ${note}`,
                balance_after_paisa: wallet.balance,
                created_at: new Date()
            });

            return wallet;
        });
    }

    async getSubscriptionsSummary(cityId: number) {
        return db('subscriptions as s')
            .join('users as u', 's.user_id', 'u.id')
            .join('products as p', 's.product_id', 'p.id')
            .where({ 'u.default_city_id': cityId })
            .select(
                's.id',
                'u.name as customer_name',
                'p.name as product_name',
                's.status',
                's.quantity',
                's.frequency_type as frequency',
                's.start_date'
            )
            .orderBy('s.created_at', 'desc');
    }

    async toggleCustomerStatus(userId: number, isActive: boolean) {
        return db('users').where({ id: userId }).update({
            is_active: isActive,
            updated_at: new Date()
        });
    }
}
