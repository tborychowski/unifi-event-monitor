# [Unifi Event Monitor](https://github.com/tborychowski/unifi-event-monitor)
Listens for events from Unifi controller and pushes them as notifications to [apprise](https://github.com/caronc/apprise).


## Setup using [docker image](https://hub.docker.com/r/tborychowski/unifi-event-monitor)
1. Create `.apprise` file with your [apprise config](https://github.com/caronc/apprise#popular-notification-services), e.g.:

```
slack://<token1>/<token2>/<token3>
mailtos://<userid>:<pass>@<domain.com>
```

2. Create `.env` file with the Unifi Controller credentials:

```
HOST=https://<controllerIP>:8443
USERNAME=<username>
PASSWORD=<password>
```

3. Create `docker-compose.yml` file:

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
      - type: bind
        source: ./.apprise
        target: /unifi-event-monitor/.apprise
```


4. Run:

```sh
docker run -d --rm --env-file=./.env /
  --mount "type=bind,src=/absolute/path/to/.apprise,dst=/unifi-event-monitor/.apprise" \
  tborychowski/unifi-event-monitor
```

or with `docker-compose`:
```sh
docker-compose up -d
```



## Credit
I used some code from: https://github.com/oznu/unifi-events
