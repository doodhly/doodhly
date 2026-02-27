
import { RouteOptimizationService } from './route-optimization.service';

const service = new RouteOptimizationService();

const mockLocations = [
    { id: 1, lat: 12.9716, lng: 77.5946 }, // Bangalore Center
    { id: 2, lat: 12.9352, lng: 77.6245 }, // Koramangala
    { id: 3, lat: 13.0358, lng: 77.5970 }, // Hebbal
    { id: 4, lat: 12.9784, lng: 77.6408 }, // Indiranagar
    { id: 5, lat: 12.9141, lng: 77.6103 }  // BTM
];

// Shuffle
const shuffled = [...mockLocations].sort(() => Math.random() - 0.5);

console.log("Input:", shuffled.map(l => l.id));

const optimized = service.optimizeRoute(shuffled);

console.log("Output:", optimized.map(l => l.id));

if (optimized.length !== shuffled.length) {
    console.error("Length mismatch");
    process.exit(1);
}

// Calculate total distance of optimized vs shuffled
// (We need to expose calculateTotalDistance or copy logic, but for now just verifying it runs and produces output)
console.log("Optimization executed successfully.");
