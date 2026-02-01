
import { AppError } from '../../core/errors/app-error';

export type DeliveryStatus = 'PENDING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'MISSED' | 'EXCEPTION';

export class DeliveryStateMachine {
    private static allowedTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
        'PENDING': ['OUT_FOR_DELIVERY', 'EXCEPTION'], // Batch -> Out OR Admin Issue
        'OUT_FOR_DELIVERY': ['DELIVERED', 'MISSED', 'EXCEPTION'], // Verify OR Report Issue
        'DELIVERED': [], // Terminal State
        'MISSED': ['EXCEPTION'], // Can move to Exception (e.g. Audit correction) but mostly terminal
        'EXCEPTION': [] // Terminal
    };

    static validateTransition(current: string, next: string): void {
        const allowed = this.allowedTransitions[current as DeliveryStatus];
        if (!allowed || !allowed.includes(next as DeliveryStatus)) {
            throw new AppError(`Invalid State Transition: ${current} -> ${next}`, 422);
        }
    }
}
