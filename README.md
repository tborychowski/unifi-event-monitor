# Unifi Controller Event Monitor & Slack Relay
Monitors Unifi Controller events and sends them as notification via [apprise](https://github.com/caronc/apprise).

Code shamelessly borrowed from: https://github.com/oznu/unifi-events

## Setup
1. Create `.apprise` file with your config, e.g.:
```
slack://<token1>/<token2>/<token3>
mailtos://<userid>:<pass>@<domain.com>
```

2. Create `docker-compose.yml` file with the below:
```yml
version: "3"
services:
  unifi-event-monitor:
    container_name: unifi-event-monitor
    image: tborychowski/unifi-event-monitor
    restart: unless-stopped
	environment:
      - HOST=https://<controller IP>:8443
      - USERNAME=<controller username>
	  - PASSWORD=<controller password>
    volumes:
      - type: bind
        source: ./.apprise
        target: /unifi-event-monitor/.apprise
```

3. Run
```sh
docker-compose up -d
```
