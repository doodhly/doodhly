
import { Request, Response } from 'express';
import { routeOptimizationService } from './route-optimization.service';

export class RouteOptimizationController {

    public optimizeRoute = async (req: Request, res: Response): Promise<void> => {
        try {
            const { deliveries } = req.body;

            if (!deliveries || !Array.isArray(deliveries) || deliveries.length === 0) {
                res.status(400).json({ message: 'Invalid deliveries list' });
                return;
            }

            // Map deliveries to Location interface
            const locations = deliveries.map((d: any) => ({
                id: d.id,
                lat: parseFloat(d.lat),
                lng: parseFloat(d.lng)
            })).filter(l => !isNaN(l.lat) && !isNaN(l.lng));

            if (locations.length < 2) {
                // Nothing to optimize
                res.json({ optimizedRoute: deliveries });
                return;
            }

            // Optimize
            const optimizedLocs = routeOptimizationService.optimizeRoute(locations);

            // Re-map back to full delivery objects in new order
            // We create a map for O(1) lookup
            const deliveryMap = new Map(deliveries.map((d: any) => [d.id, d]));

            const optimizedDeliveries = optimizedLocs.map((loc, index) => {
                const original = deliveryMap.get(loc.id);
                return {
                    ...original,
                    sequence: index + 1
                };
            });

            // Append any un-optimizable items (missing lat/lng) at the end
            const unoptimizable = deliveries.filter((d: any) => isNaN(parseFloat(d.lat)) || isNaN(parseFloat(d.lng)));

            let finalSeq = optimizedDeliveries.length + 1;
            const remaining = unoptimizable.map((d: any) => ({ ...d, sequence: finalSeq++ }));

            res.json({
                optimizedRoute: [...optimizedDeliveries, ...remaining],
                savings: {
                    distance: "2.4 km", // Mock for now, or calculate real delta
                    time: "15 mins"
                }
            });

        } catch (error) {
            console.error('Route optimization error:', error);
            res.status(500).json({ message: 'Failed to optimize route' });
        }
    }
}

export const routeOptimizationController = new RouteOptimizationController();
