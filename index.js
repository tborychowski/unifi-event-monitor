require('dotenv').config();
const fs = require('fs');
const Notify = require('./lib.notify');
const Unifi = require('./lib.unifi');
const unifi = new Unifi({
	controller: process.env.HOST,
	username: process.env.USERNAME,
	password: process.env.PASSWORD,
});
const BLACKLIST = 'blacklist.txt';

function log (text = '') {
	if (!text) return;
	console.log(text);
	Notify(text);
}

function filter (text = '') {
	if (fs.existsSync(BLACKLIST)) {
		text = text.replace(/\*/g, '').trim().toLowerCase();
		const list = fs.readFileSync(BLACKLIST, 'utf8');
		const lines = list
			.trim()
			.replace(/\*/g, '')
			.split('\n')
			.filter(l => !!l)
			.map(l => l.trim().toLowerCase());

		for (let l of lines) {
			if (text.includes(l)) return;
		}
	}
	return text;
}

unifi.on('ready', () => log('Connected To UniFi Controller'));
unifi.on('event', data => log(filter(data.msg)));
