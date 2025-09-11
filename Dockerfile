FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

# ✅ ganti ENV supaya sesuai dengan kode
ENV APP_PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
