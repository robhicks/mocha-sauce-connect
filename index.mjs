const { EventEmitter } = require('events');
const Batch = require('batch');
const fetch = require('node-fetch');
const wd = require('wd');

const RETRY_TIMEOUT = 1000;

class MochaSauceRunner {
  constructor(conf) {
  	this.browsers = [];
  	this.build = conf.build || '';
  	this.concurrency = 2;
  	this.key = conf.accessKey || process.env.SAUCE_API_KEY;
  	this.screenshots = false;
  	this.tags = conf.tags || [];
  	this.url = conf.url || '';
  	this.user = conf.username || process.env.SAUCE_USER_NAME;
  	this.video = false;
    this.name = conf.name;
    this.tunnelId = conf.tunnelId;
    this.port = conf.port;
  }

  browser(conf) {
    this.browsers.push(conf);
  }

  record(video, screenshots) {
    if (typeof screenshots === 'undefined') screenshots = video;
    this.video = video;
    this.screenshots = screenshots;
  }

  runner(browser) {
    browser.tags = this.tags;
    browser.name = this.name;
    browser.build = this.build;
    const remoteBrowser = wd.promiseRemote(this.host, this.port, this.user, this.key);
    return remoteBrowser.init(browser)
      .then(() => this.emit('start', browser))
      .then(() => remoteBrowser.get(this.url))
      .then(() => remoteBrowser.eval('window.ready'))
      .then(resp => console.log('resp', resp))
  }

  start() {

    return Promise.all(this.browsers.map(b => this.runner(b)))
      .catch(err => console.log('err', err))

    const batch = new Batch();
    batch.concurrency = this.concurrency;

    this.browsers.forEach(b => {
      b.tags = this.tags;
      b.name = this.name;
      b.build = this.build;

      batch.push(done => {
        const browser = wd.remote(this.host, this.port, this.user, this.key);
        this.emit('init', b);

        browser.init(b, () => {
          this.emit('start', b);
          browser.get(this.url, err => {
            if (err) {
              this.emit('error', err);
              return done(err);
            }

            const run = () => {
              browser.eval('window.ready', (err, res) => {
                if (res !== true) setTimeout(() => run(), RETRY_TIMEOUT);
                if (err) {
                  this.emit('error', err);
                  return done(err);
                }
                browser.eval('window.mochaResults', (err, res) => {
                  if (err) {
                    this.emit('error', err);
                    return done(err);
                  }
                  if (!res) res = {};
                  res.browse = b;
                  const data = {
                    'custom-data': { mocha: res.jsonReport },
  									'passed': !res.failures
                  };
                  const uri = `https://${this.user}:${this.key}@saucelabs.com/rest/v1/${this.user}/jobs/${browser.sessionID}`;
                  const config = { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)};
                  fetch(uri, config)
                    .then(() => {
                      this.emit('end', b, res);
                      browser.quit();
                      done(null, res);
                    })
                    .catch(err => {
                      this.emit('error', err);
                      done(err);
                    });
                });
              });
            };
            run();
          });
        });
      });

    });
    batch.end();
  }

  get build() {
    return this._build;
  }

  set build(build) {
    this._build = build;
  }

  get concurrency() {
    return this._concurrency;
  }

  set concurrency(concurrency) {
    this._concurrency = concurrency;
  }

  get screenshots() {
    return this._screenshots;
  }

  set screenshots(screenshots) {
    this._screenshots = screenshots;
  }

  get tags() {
    return this._tags;
  }

  set tags(tags) {
  this._tags = tags;
  }

  get video() {
    return this._video;
  }

  set video(video) {
    this._video = video;
  }

  get url() {
    return this._url;
  }

  set url(url) {
    this._url = url;
  }

}

MochaSauceRunner.prototype.__proto__ = EventEmitter.prototype;

export { MochaSauceRunner };
