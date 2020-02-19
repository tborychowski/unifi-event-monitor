FROM node:alpine
RUN apk update && \
    apk add python && \
    apk add py-pip && \
    pip install apprise

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
CMD ["node", "index.js"]
