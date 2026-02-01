# Build stage
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=build /app/dist ./dist

# Create logs directory
RUN mkdir -p logs && chown node:node logs

USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]
