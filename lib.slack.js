const rp = require('request-promise-native');

function post (text) {
	return rp.post(process.env.SLACK_HOOK_URL, {json: {text}})
		.catch(err => console.log(err));
}

module.exports = post;
