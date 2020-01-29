# Unifi Controller Event Monitor & Slack Relay
Monitors Unifi Controller events and sends them as slack messages.

Code shamelessly borrowed from: https://github.com/oznu/unifi-events

## Setup
1. Create `.env` file with the below:
```ini
URL=https://<controller IP>:8443
LOGIN=<controller username>
PASS=<controller password>
SLACK_HOOK_URL=https://hooks.slack.com/services/<token>
```

2. Create `docker-compose.yml` file with the below:
```yml
version: "3"
services:
  unifi-event-monitor:
    container_name: unifi-event-monitor
    image: tborychowski/unifi-event-monitor
    restart: unless-stopped
    env_file:
      - ./.env
```

3. Run
```sh
docker-compose up -d
```
