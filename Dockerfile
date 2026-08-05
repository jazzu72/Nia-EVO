FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev || true

COPY . .

EXPOSE 3070 3030 3050

CMD ["node","nia-mission-dashboard-api.js"]
