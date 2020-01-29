const {execFile} = require('child_process');

module.exports = function notify (text) {
	const params = [
		'--config',
		'./.apprise',
		'-b',
		text
	];
	return new Promise((resolve, reject) => {
		execFile('apprise', params, { cwd: __dirname }, (err, stdout, stderr) => {
			if (stderr) return reject('StdErr ' + stderr);
			// apprise for slack incorrectly returns code 1
			if (err && err.code > 1) return reject('Error ' + err);
			resolve(stdout);
		});
	})
		.catch(e => console.error(e));
};
