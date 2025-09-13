FROM node:20-alpine
WORKDIR /app

COPY prisma ./prisma
COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

# ✅ ganti ENV supaya sesuai dengan kode
ENV APP_PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start:prod"]

