export interface OfflineAction {
    id: string; // Unique ID for the action
    type: "VERIFY" | "REPORT";
    deliveryId: string;
    payload: any;
    timestamp: number;
}

const QUEUE_KEY = "doodhly_offline_queue";

export const getQueue = (): OfflineAction[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const addToQueue = (action: OfflineAction) => {
    const queue = getQueue();
    queue.push(action);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const removeFromQueue = (id: string) => {
    const queue = getQueue().filter(a => a.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const clearQueue = () => {
    localStorage.removeItem(QUEUE_KEY);
};
