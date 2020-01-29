require('dotenv').config();
const Slack = require('./lib.slack');
const Unifi = require('./lib.unifi');
const unifi = new Unifi({
	controller: process.env.URL,
	username: process.env.LOGIN,
	password: process.env.PASS,
});


function log (text = '') {
	if (!text) return;
	Slack(text).then(() => console.log(text));
}

unifi.on('ready', () => log('Connected To UniFi Controller'));

unifi.on('event', data => {
	console.log(data.key);
	log(data.msg);
});
