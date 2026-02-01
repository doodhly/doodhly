
import db from '../../config/db';

export class DeliveryService {

    // READ-ONLY: Fetch Run Sheet
    async getRunSheet(cityId: string, date: string) {
        return db('daily_deliveries as dd')
            .join('users as u', 'dd.user_id', 'u.id')
            .join('subscriptions as s', 'dd.subscription_id', 's.id')
            .join('products as p', 's.product_id', 'p.id')
            // JOIN fallback: If subscription has no address_id, use user's latest address
            .leftJoin('addresses as a', function () {
                this.on('a.id', '=', db.raw('COALESCE(s.address_id, (SELECT id FROM addresses WHERE user_id = u.id ORDER BY updated_at DESC LIMIT 1))'));
            })
            .where({ 'dd.city_id': cityId })
            .whereIn('dd.status', ['PENDING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'MISSED'])
            .andWhere('dd.date', date)
            .select(
                'dd.id',
                'u.id as userId',
                'u.name as customerName',
                'u.phone_hash as phone',
                'a.street as address',
                'a.lat',
                'a.lng',
                'p.name as productName',
                'dd.status',
                's.quantity',
                'p.unit',
                db.raw('1 as sequence')
            )
            .orderBy('dd.id', 'asc');
    }
}
