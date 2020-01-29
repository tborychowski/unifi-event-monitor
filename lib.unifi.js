// full list of events: https://demo.ui.com/manage/locales/en/eventStrings.json?v=5.12.35

const rp = require('request-promise-native');
const EventEmitter = require('events');
const WebSocket = require('@oznu/ws-connect');

module.exports = class UnifiWatcher extends EventEmitter {
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
		this.connect();
	}

	connect () {
		return this._login().then(() => this._listen());
	}

	_login () {
		return this.rp
			.post(`${this.controller.href}api/login`, {
				resolveWithFullResponse: true,
				json: {
					username: this.opts.username,
					password: this.opts.password,
					strict: true,
				}
			})
			.then(() => {
				if (this.socket) this.socket.options.headers.Cookie = this.jar.getCookieString(this.controller.href);
			})
			.catch((e) => this.emit('websocket-status', `UniFi Events: Login Failed ${e.message}`));
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

	async _reformat (data) {
		const params = {};
		if (data.ap) params.ap = await this.getAp(data.ap);
		if (data.ap_from) params.ap_from = await this.getAp(data.ap_from);
		if (data.ap_to) params.ap_to = await this.getAp(data.ap_to);
		if (data.guest) params.guest = await this.getClient(data.guest);
		else if (data.user) params.user = await this.getClient(data.user);
		data.msg = data.msg
			.replace(`AP[${data.ap}]`, `*${params.ap}*`)
			.replace(`AP[${data.ap_from}]`, `*${params.ap_from}*`)
			.replace(`AP[${data.ap_to}]`, `*${params.ap_to}*`)
			.replace(`Guest[${data.guest}]`, `*${params.guest}*`)
			.replace(`User[${data.user}]`, `*${params.user}*`);
		return data;
	}

	async _event (data) {
		if (data.key) {
			data = await this._reformat(data);
			this.emit(data.key, data);
			this.emit('event', data);
		}
		else this.emit('unknown', {msg: `Unknown event triggered by: ${data.name || data.hostname}`});
	}

	_ensureLoggedIn () {
		return this.rp
			.get(`${this.controller.href}api/self`)
			.catch(() => this._login());
	}

	getClients () {
		return this._ensureLoggedIn()
			.then(() => this.rp.get(`${this.controller.href}api/s/${this.opts.site}/stat/sta`, { json: true }))
			.catch(() => {});
	}

	getClient (mac) {
		return this._ensureLoggedIn()
			.then(() => this.rp.get(`${this.controller.href}api/s/${this.opts.site}/stat/user/${mac}`, { json: true }))
			.then(data => {
				if (!data || !data.data || !data.data.length) return mac;
				return data.data[0].name || data.data[0].hostname || mac;
			})
			.catch(() => {});
	}

	getAp (mac) {
		return this
			._ensureLoggedIn()
			.then(() => this.rp.get(`${this.controller.href}api/s/${this.opts.site}/stat/device/${mac}`, { json: true }))
			.then(data => {
				if (!data || !data.data || !data.data.length) return mac;
				return data.data[0].name || mac;
			})
			.catch(() => {});
	}
};
