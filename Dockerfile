FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including dev deps needed for build)
RUN npm ci

COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm ci --only=production

EXPOSE 3000

CMD ["npm", "start"]
