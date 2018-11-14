const { EventEmitter } = require("events");
const fetch = require("node-fetch");
const wd = require("wd");

const RETRY_TIMEOUT = 1000;

class MochaSauceRunner {
  constructor(conf) {
    this.browsers = [];
    this.build = conf.build || "";
    this.concurrency = 2;
    this.key = conf.accessKey || process.env.SAUCE_API_KEY;
    this.screenshots = false;
    this.tags = conf.tags || [];
    this.url = conf.url || "";
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
    if (typeof screenshots === "undefined") screenshots = video;
    this.video = video;
    this.screenshots = screenshots;
  }

  runner(browser) {
    let url;
    let response;

    browser.tags = this.tags;
    browser.name = this.name;
    browser.build = this.build;
    const remoteBrowser = wd.promiseRemote(this.host, this.port, this.user, this.key);

    this.emit('init', browser);

    return remoteBrowser
      .init(browser)
      .then(() => this.emit("start", browser))
      .then(() => remoteBrowser.get(this.url))
      .then(() => remoteBrowser.eval("window.ready"))
      .then(resp => resp !== true ? setTimeout(() => this.runner(browser), RETRY_TIMEOUT) : remoteBrowser.eval('window.mochaResults'))
      .then(resp => response = resp)
      .then(() => url = `https://${this.user}:${this.key}@saucelabs.com/rest/v1/${this.user}/jobs/${remoteBrowser.sessionID}`)
      .then(() => fetch(url, {
        body: JSON.stringify({ 'custom-data': { mocha: response.jsonReport }, passed: !response.failures }),
        headers: { 'Content-Type': 'application/json'},
        method: 'PUT'
      }))
      .then(() => fetch(url + '/stop', { method: 'PUT', body: {}}))
      .then(() => this.emit('end', browser, response));
  }

  start() {
    return Promise.all(this.browsers.map(b => this.runner(b)))
      .then(() => process.exit(0))
      .catch(err => {
        console.error("err", err);
        process.exit(1);
      });
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
