FROM node:alpine
RUN apk update && \
    apk add git && \
    apk add python && \
    apk add py-pip && \
    pip install apprise && \
    git clone https://github.com/tborychowski/unifi-event-monitor
WORKDIR /unifi-event-monitor
RUN npm i
CMD ["node", "index.js"]
