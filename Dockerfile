FROM node:alpine
RUN apk update && \
    apk add git && \
    git clone https://github.com/tborychowski/unifi-event-monitor
WORKDIR /unifi-event-monitor
RUN npm i
CMD ["node", "index.js"]
