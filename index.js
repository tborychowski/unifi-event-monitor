require('dotenv').config();
const rp = require('request-promise-native');
const Watcher = require('./watcher');
const unifi = new Watcher({
	controller: process.env.URL,
	username: process.env.LOGIN,
	password: process.env.PASS,
});


function log (text = '') {
	if (!text) return;
	return rp.post(process.env.SLACK_HOOK_URL, {json: {text}})
		.then(() => console.log(text))
		.catch(err => console.log(err));

}

unifi.on('ready', () => log('Connected To UniFi Controller'));

unifi.on('connected', async data => {
	const ap = await unifi.getAp(data.ap);
	const client = await unifi.getClient(data.user);
	log(`*${client.name}* was connected to *${data.ssid}* (${ap.name}).`);
});

unifi.on('disconnected', async data => {
	const ap = await unifi.getAp(data.ap);
	const client = await unifi.getClient(data.user);
	log(`*${client.name}* was disconnected from *${data.ssid}* (${ap.name}).`);
});

unifi.on('event', data => {
	console.log(data.key);
	log(data.msg);
});

// unifi.on('unknown', data => log(data.msg));
