
import { Server, Socket } from "socket.io";
import logger from "../../core/utils/logger";
import db from "../../config/db";

export const setupTrackingSockets = (io: Server) => {
    // Connect to default namespace for simplicity
    io.on("connection", (socket: Socket) => {
        logger.info(`Tracking Socket connected: ${socket.id}`);

        // Join a specific delivery room (for customers) or partner room
        socket.on("join_room", (room: string) => {
            socket.join(room);
            logger.info(`Socket ${socket.id} joined room: ${room}`);
        });

        // Leave room
        socket.on("leave_room", (room: string) => {
            socket.leave(room);
            logger.info(`Socket ${socket.id} left room: ${room}`);
        });

        // Receive location update from Partner
        socket.on("update_location", async (data: {
            deliveryId: number,
            partnerId: number,
            lat: number,
            lng: number,
            speed?: number,
            heading?: number
        }) => {
            try {
                // 1. Validate (Basic)
                if (!data.deliveryId || !data.partnerId || !data.lat || !data.lng) {
                    logger.warn(`Invalid location data from ${socket.id}`);
                    return;
                }

                // 2. Persist to DB (Ephemeral optimization: could skip await or use Redis)
                // For now, we write to DB for audit history
                await db('delivery_locations').insert({
                    delivery_id: data.deliveryId,
                    partner_id: data.partnerId,
                    lat: data.lat,
                    lng: data.lng,
                    speed: data.speed || 0,
                    heading: data.heading || 0
                });

                // 3. Broadcast to subscribing customers (Room: delivery_{deliveryId})
                const room = `delivery_${data.deliveryId}`;
                socket.to(room).emit("location_update", data);

                // Also broadcast to partner specific room if admins are tracking partner
                socket.to(`partner_${data.partnerId}`).emit("partner_location_update", data);

                logger.debug(`Location updated for Delivery ${data.deliveryId}`);

            } catch (error) {
                logger.error(`Error processing location update: ${error}`);
            }
        });
    });
};
