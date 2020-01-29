# Unifi Controller Event Monitor & Slack Relay
Monitors Unifi Controller events and sends them as slack messages.

Code shamelessly borrowed from: https://github.com/oznu/unifi-events

Requires `.env` file with the below:
```ini
URL=https://<controller IP>:8443
LOGIN=<controller username>
PASS=<controller password>
SLACK_HOOK_URL=https://hooks.slack.com/services/<token>
```
