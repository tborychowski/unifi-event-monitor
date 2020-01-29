require('dotenv').config();
const Notify = require('./lib.notify');
const Unifi = require('./lib.unifi');
const unifi = new Unifi({
	controller: process.env.HOST,
	username: process.env.USERNAME,
	password: process.env.PASSWORD,
});

function log (text = '') {
	if (!text) return;
	console.log(text);
	Notify(text);
}

unifi.on('ready', () => log('Connected To UniFi Controller'));

unifi.on('event', data => log(data.msg));
