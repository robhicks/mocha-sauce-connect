const { MochaSauceRunner } = require("../index.js");
const StaticServer = require('static-server');
const port = 8001;
const host = 'localhost';

const server = new StaticServer({
  rootPath: '.',
  port: port,
  host: host,
  cors: '*',
  followSymlink: true
});

server.start(() => console.log(`test server running on port: ${port}`));

const url = `http://${host}:${port}/test/mocha.html`;
console.log('url', url);

const sauce = new MochaSauceRunner({
	name: "mocha-sauce-connect",
	username: process.env.SAUCE_USERNAME,
	accessKey: process.env.SAUCE_ACCESS_KEY,
	host,
	port: 4445,
	url
});

sauce.record(true);

sauce.browser({ browserName: "chrome", platform: "Windows 10" });
sauce.browser({ browserName: "firefox", platform: "Windows 10" });
sauce.browser({ browserName: "safari", platform: "macOS 10.13" });
sauce.browser({ browserName: "firefox", platform: "macOS 10.13" });
sauce.browser({ browserName: "chrome", platform: "macOS 10.13" });

sauce.on('init', browser => console.log('  init : %s %s', browser.browserName, browser.platform));

sauce.on('start', browser => console.log('  start : %s %s', browser.browserName, browser.platform));

sauce.on('end', (browser, res) => console.log('  end : %s %s : %d failures', browser.browserName, browser.platform, res.failures));

sauce.on('error', err => console.log('err', err));

sauce.start((err, res) => {
  if (err) {
    console.log('err', err);
    process.exit(1);
  } else {
    process.exit(0);
  }
});
