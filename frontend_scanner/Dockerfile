FROM node:20-alpine as builder

WORKDIR /app

ARG VITE_API_URL=http://localhost:8000
ARG VITE_AUTH_URL=http://localhost:8001
ARG VITE_SCANNER_URL=ws://localhost:8002
ARG VITE_ML_URL=http://localhost:8003

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_AUTH_URL=$VITE_AUTH_URL
ENV VITE_SCANNER_URL=$VITE_SCANNER_URL
ENV VITE_ML_URL=$VITE_ML_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
