FROM node:20.10-slim
WORKDIR /root/panic-news-telegram-bot/
COPY . .
RUN npm install
CMD [ "node", "index.js" ]