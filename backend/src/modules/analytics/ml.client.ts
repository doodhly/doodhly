
import axios from 'axios';
import { AppError } from '../../core/errors/app-error';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

export class MLClient {

    async predictConsumption(userId: number) {
        try {
            // Hard timeout of 5s for ML calls
            const response = await axios.post(`${ML_SERVICE_URL}/predict/consumption`, { user_id: userId }, { timeout: 5000 });
            return response.data;
        } catch (error: any) {
            console.error(`[ML Service] Consumption Prediction Failed: ${error.message}`);
            // Fallback: Return 0 prediction rather than crashing main flow
            return { predicted_liters: 0, status: 'error' };
        }
    }

    async predictChurn(userId: number) {
        try {
            const response = await axios.post(`${ML_SERVICE_URL}/predict/churn`, { user_id: userId }, { timeout: 5000 });
            return response.data;
        } catch (error: any) {
            console.error(`[ML Service] Churn Prediction Failed: ${error.message}`);
            return { churn_probability: 0, status: 'error' };
        }
    }
}
