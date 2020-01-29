const rp = require('request-promise-native');
const EventEmitter = require('events');
const WebSocket = require('@oznu/ws-connect');

module.exports = class UnifiEvents extends EventEmitter {
	constructor (opts) {
		super();

		this.opts = opts;
		this.opts.site = this.opts.site || 'default';
		this.userAgent = 'UniFi Events';
		this.controller = new URL(this.opts.controller);
		this.jar = rp.jar();
		this.rp = rp.defaults({
			strictSSL: false,
			jar: this.jar,
			headers: { 'User-Agent': this.userAgent }
		});

		// convenience emitters
		this.helpers = {
			'EVT_WU_Connected': 'connected',		// user connected to AP
			'EVT_WG_Connected': 'connected',		// guest
			'EVT_WU_Disconnected': 'disconnected',
			'EVT_WG_Disconnected': 'disconnected',

			'EVT_LU_Connected': 'connected',		// user connected to network
			'EVT_LG_Connected': 'connected',		// guest
			'EVT_LU_Disconnected': 'disconnected',
			'EVT_LG_Disconnected': 'disconnected',
		};
		// full list: https://demo.ui.com/manage/locales/en/eventStrings.json?v=5.12.35
		this.connect();
	}

	connect () {
		return this._login().then(() => this._listen());
	}

	_login () {
		return this.rp.post(`${this.controller.href}api/login`, {
			resolveWithFullResponse: true,
			json: {
				username: this.opts.username,
				password: this.opts.password,
				strict: true,
			}
		})
			.then(() => {
				if (this.socket) {
					this.socket.options.headers.Cookie = this.jar.getCookieString(this.controller.href);
				}
			})
			.catch((e) => {
				this.emit('websocket-status', `UniFi Events: Login Failed ${e.message}`);
			});
	}

	_listen () {
		this.socket = new WebSocket(`wss://${this.controller.host}/wss/s/${this.opts.site}/events`, {
			options: {
				perMessageDeflate: false,
				rejectUnauthorized: false,
				headers: {
					'User-Agent': this.userAgent,
					'Cookie': this.jar.getCookieString(this.controller.href)
				}
			},
			beforeConnect: this._ensureLoggedIn.bind(this)
		});

		this.socket.on('json', (payload) => {
			if ('data' in payload && Array.isArray(payload.data)) {
				payload.data.forEach(entry => this._event(entry));
			}
		});

		if (this.socket) this.emit('ready');
		this.socket.on('websocket-status', status => {
			const isError = status.toLowerCase().includes('error');
			if (isError) console.log(status);
			this.emit('websocket-status', `UniFi Events: ${status}`);
		});
	}

	_event (data) {
		// send to convenience emitters
		if (data.key in this.helpers) this.emit(this.helpers[data.key], data);
		else if (data.key) {
			this.emit(data.key, data);
			this.emit('event', data);
		}
		else {
			this.emit('unknown', {msg: `Unknown event triggered by: ${data.name || data.hostname}`});
		}
	}

	_ensureLoggedIn () {
		return this.rp
			.get(`${this.controller.href}api/self`)
			.catch(() => this._login());
	}

	getClients () {
		return this._ensureLoggedIn()
			.then(() => {
				return this.rp
					.get(`${this.controller.href}api/s/${this.opts.site}/stat/sta`, { json: true });
			});
	}

	getClient (mac) {
		return this._ensureLoggedIn()
			.then(() => {
				return this.rp
					.get(`${this.controller.href}api/s/${this.opts.site}/stat/user/${mac}`, { json: true })
					.then(data => {
						const {ip, name, hostname, is_wired } = data.data[0];
						return {ip, name, hostname, is_wired };
					});
			});
	}

	getAp (mac) {
		return this
			._ensureLoggedIn()
			.then(() => {
				return this.rp
					.get(`${this.controller.href}api/s/${this.opts.site}/stat/device/${mac}`, { json: true })
					.then(data => {
						const {name, ip} = data.data[0];
						return {name, ip};
					});
			});
	}

	// getSites () {
	// 	return this
	// 		._ensureLoggedIn()
	// 		.then(() => {
	// 			return this.rp
	// 				.get(`${this.controller.href}api/self/sites`, { json: true });
	// 		});
	// }
};
