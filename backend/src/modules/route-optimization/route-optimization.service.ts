
// import { DailyDelivery } from "../../config/db";
interface DailyDelivery { id: number; lat: number; lng: number; }

interface Location {
    id: number;
    lat: number;
    lng: number;
}

export class RouteOptimizationService {

    // Haversine formula to calculate distance in meters
    private getDistance(loc1: Location, loc2: Location): number {
        const R = 6371e3; // Earth radius in meters
        const φ1 = loc1.lat * Math.PI / 180;
        const φ2 = loc2.lat * Math.PI / 180;
        const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
        const Δλ = (loc2.lng - loc1.lng) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    private calculateTotalDistance(route: Location[]): number {
        let total = 0;
        for (let i = 0; i < route.length - 1; i++) {
            total += this.getDistance(route[i], route[i + 1]);
        }
        return total;
    }

    // Simulated Annealing Algorithm for TSP
    public optimizeRoute(deliveries: Location[]): Location[] {
        if (deliveries.length < 3) return deliveries;

        let currentRoute = [...deliveries];
        let bestRoute = [...currentRoute];

        let currentDistance = this.calculateTotalDistance(currentRoute);
        let bestDistance = currentDistance;

        let temp = 10000;
        const coolingRate = 0.9995;

        while (temp > 1) {
            // Swap two random cities
            const newRoute = [...currentRoute];
            const idx1 = Math.floor(Math.random() * newRoute.length);
            const idx2 = Math.floor(Math.random() * newRoute.length);

            [newRoute[idx1], newRoute[idx2]] = [newRoute[idx2], newRoute[idx1]];

            const newDistance = this.calculateTotalDistance(newRoute);

            // Acceptance probability
            if (newDistance < currentDistance || Math.random() < Math.exp((currentDistance - newDistance) / temp)) {
                currentRoute = newRoute;
                currentDistance = newDistance;

                if (currentDistance < bestDistance) {
                    bestRoute = [...currentRoute];
                    bestDistance = currentDistance;
                }
            }

            temp *= coolingRate;
        }

        return bestRoute;
    }
}

export const routeOptimizationService = new RouteOptimizationService();
