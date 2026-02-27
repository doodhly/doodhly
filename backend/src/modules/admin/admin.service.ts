
import db from '../../config/db';
import jwt from 'jsonwebtoken';
import { secrets } from '../../config/secrets';

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

    // --- User Management ---

    async getAllUsers(filters?: { search?: string, role?: string, is_active?: string, page?: number, limit?: number }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const offset = (page - 1) * limit;

        let query = db('users as u')
            .leftJoin('wallets as w', 'w.user_id', 'u.id')
            .select(
                'u.id',
                'u.name',
                'u.phone_hash',
                'u.role',
                'u.is_active',
                'u.default_city_id',
                'u.created_at',
                'u.last_seen_at',
                'w.balance'
            );

        // Apply filters
        if (filters?.search) {
            query = query.where(function () {
                this.where('u.name', 'like', `%${filters.search}%`)
                    .orWhere('u.phone_hash', 'like', `%${filters.search}%`);
            });
        }

        if (filters?.role) {
            query = query.where('u.role', filters.role);
        }

        if (filters?.is_active !== undefined) {
            query = query.where('u.is_active', filters.is_active === 'true');
        }

        // Get total count for pagination
        const countQuery = query.clone().clearSelect().count('u.id as count').first();
        const totalResult = await countQuery;
        const total = Number(totalResult?.count || 0);

        // Apply pagination
        const users = await query
            .orderBy('u.created_at', 'desc')
            .limit(limit)
            .offset(offset);

        return {
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async updateUserRole(userId: number, newRole: string) {
        // Check if user exists
        const user = await db('users').where({ id: userId }).first();
        if (!user) {
            throw new Error('User not found');
        }

        // Update role
        await db('users').where({ id: userId }).update({
            role: newRole,
            updated_at: new Date()
        });

        return { success: true };
    }

    async createUser(data: { phone: string, name: string, role: string, default_city_id: number }) {
        // Check if phone already exists
        const existing = await db('users').where({ phone_hash: data.phone }).first();
        if (existing) {
            throw new Error('User with this phone number already exists');
        }

        // Insert user
        const [userId] = await db('users').insert({
            phone_hash: data.phone,
            name: data.name,
            role: data.role,
            default_city_id: data.default_city_id,
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        });

        // Create wallet for new user
        await db('wallets').insert({
            user_id: userId,
            balance: 0,
            created_at: new Date(),
            updated_at: new Date()
        });

        return { id: userId, ...data };
    }

    async impersonateUser(adminId: number, targetUserId: number) {
        // 1. Verify Target User exists and is a Customer
        const targetUser = await db('users').where({ id: targetUserId }).first();
        if (!targetUser) throw new Error('Target user not found');
        if (targetUser.role !== 'CUSTOMER') throw new Error('Can only impersonate CUSTOMER accounts');

        // 2. Log the impersonation event for security audit
        await db('audit_logs').insert({
            user_id: adminId, // The admin doing the action
            action: 'USER_IMPERSONATION',
            resource: 'users',
            resource_id: targetUserId,
            details: JSON.stringify({ reason: 'Admin dashboard impersonation flow' }),
            created_at: new Date()
        });

        // 3. Generate Impersonation JWT

        const payload = {
            id: targetUser.id,
            role: targetUser.role,
            city_id: targetUser.default_city_id,
            impersonatedBy: adminId // CRITICAL: Flag to show this is an impersonated session
        };

        const token = jwt.sign(payload, secrets.JWT_SECRET, {
            expiresIn: '1h' // Short lived token
        });

        return { token, user: targetUser };
    }
}
