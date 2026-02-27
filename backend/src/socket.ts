
import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";
import { setupTrackingSockets } from "./modules/tracking/tracking.socket";
import logger from "./core/utils/logger";
import { corsOptions } from "./config/env";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

let io: SocketIOServer;

export const initSocket = async (httpServer: HttpServer) => {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: corsOptions.origin,
            methods: ["GET", "POST"]
        },
        path: "/socket.io"
    });

    // Configure Redis Adapter if Redis is enabled
    if (process.env.DISABLE_REDIS !== 'true') {
        const pubClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
        const subClient = pubClient.duplicate();

        try {
            await Promise.all([pubClient.connect(), subClient.connect()]);
            io.adapter(createAdapter(pubClient, subClient));
            logger.info("⚡ Socket.io Redis Adapter configured globally.");
        } catch (err) {
            logger.error("Failed to connect Socket.io Redis Adapter:", err);
            // Fallback to in-memory if Redis fails to connect
        }
    }

    io.on("connection", (socket) => {
        logger.info(`Socket connected: ${socket.id}`);

        socket.on("disconnect", () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    // Initialize module listeners
    setupTrackingSockets(io);

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
