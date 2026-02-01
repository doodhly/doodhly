import { Router, Request, Response, NextFunction } from 'express';
import db from '../../config/db';
import { AppError } from '../../core/errors/app-error';
import { requireAuth } from '../../core/middleware/auth.middleware';

export const customerRouter = Router();

// Middleware to ensure user is logged in
customerRouter.use(requireAuth);

/**
 * GET /api/v1/customer/profile
 * Fetches the logged-in user's profile
 */
customerRouter.get('/profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const user = await db('users')
            .where({ id: userId })
            .select('id', 'name', 'phone_hash', 'email', 'role')
            .first();

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/v1/customer/profile
 * Updates the logged-in user's profile
 */
customerRouter.put('/profile', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id; // Extracted from JWT by requireAuth
        const { name, email } = req.body;

        if (!name) {
            throw new AppError('Name is required', 400);
        }

        await db('users')
            .where({ id: userId })
            .update({
                name,
                email: email || null // Optional
            });

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/customer/products
 * Fetches available products
 */
customerRouter.get('/products', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await db('products')
            .where({ is_active: true })
            .select('id', 'name', 'unit', db.raw('price_paisa / 100 as price'));
        res.json(products);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/v1/customer/addresses
 * Fetches all addresses for the logged-in user
 */
customerRouter.get('/addresses', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const addresses = await db('addresses')
            .where({ user_id: userId })
            .select('*');
        res.json(addresses);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/v1/customer/addresses
 * Adds a new address for the user
 */
customerRouter.post('/addresses', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { street, city, zip, lat, lng, accuracy } = req.body;

        const [addressId] = await db('addresses').insert({
            user_id: userId,
            street,
            city: city || 'Sakti',
            zip: zip || '',
            lat: lat || null,
            lng: lng || null,
            accuracy: accuracy || null,
            created_at: new Date(),
            updated_at: new Date()
        });

        res.status(201).json({ id: addressId, message: 'Address added successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/v1/customer/addresses/:id/geotag
 * Resets/Updates the geo-tag for a specific address
 */
customerRouter.put('/addresses/:id/geotag', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;
        const { lat, lng, accuracy } = req.body;

        if (!lat || !lng) {
            throw new AppError('Coordinates are required', 400);
        }

        const affected = await db('addresses')
            .where({ id, user_id: userId })
            .update({
                lat,
                lng,
                accuracy: accuracy || null,
                updated_at: new Date()
            });

        if (!affected) {
            throw new AppError('Address not found or unauthorized', 404);
        }

        res.json({ message: 'GPS Pin updated successfully' });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/v1/customer/addresses/:id
 */
customerRouter.delete('/addresses/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;

        const affected = await db('addresses')
            .where({ id, user_id: userId })
            .del();

        if (!affected) {
            throw new AppError('Address not found', 404);
        }

        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        next(error);
    }
});
