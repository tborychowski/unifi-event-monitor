# [Unifi Event Monitor](https://github.com/tborychowski/unifi-event-monitor)
Listens for events from Unifi controller and pushes them as notifications to [apprise](https://github.com/caronc/apprise).


# Get started

#### 1. [Apprise config](https://github.com/caronc/apprise#popular-notification-services)

Create `.apprise` file with your channels, e.g.:

```
slack://<token1>/<token2>/<token3>
mailtos://<userid>:<pass>@<domain.com>
```



#### 2. Unifi Controller credentials

Create `.env` file with the following:

```
HOST=https://<controllerIP>:8443
USERNAME=<username>
PASSWORD=<password>
```

## Setup using [docker image](https://hub.docker.com/r/tborychowski/unifi-event-monitor)
#### 1. Create `docker-compose.yml` file:

```yaml
---
version: "3.7"
services:
  unifi-event-monitor:
    container_name: unifi-event-monitor
    image: tborychowski/unifi-event-monitor
    restart: unless-stopped
    env_file:
      - ./.env
    volumes:
      - ./.apprise:/app/.apprise
      - ./blacklist.txt:/app/blacklist.txt
```


#### 2a. Run:

```sh
docker-compose up -d
```

#### 2b. Alternatively, you can run:

```sh
docker run -d --rm --env-file=./.env \
  --mount "type=bind,src=/absolute/path/to/.apprise,dst=/app/.apprise" \
  --mount "type=bind,src=/absolute/path/to/blacklist.txt,dst=/app/blacklist.txt" \
  tborychowski/unifi-event-monitor:latest
```

## Filtering events
By default the app listens to all events and forwards the messages as notifications.
It is possible to filter out some of the messages.
- Create `blacklist.txt` file (in the same folder as the `.apprise`)
- Add text of a message that you don't want to be pushed to your selected notification platform
- You can have multiple filters, but keep 1 filter per line, e.g.
  ```
  my laptop disconnected from
  my laptop has connected to
  ```
- This file is re-read before every event, so there's no need to restart the app after changing the file.



## Setup locally (with nodejs)

```sh
git clone https://github.com/tborychowski/unifi-event-monitor.git
cd unifi-event-monitor
npm ci
node index.js
```


# Credit
I used some code from: https://github.com/oznu/unifi-events
