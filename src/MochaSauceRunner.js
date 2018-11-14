const { EventEmitter } = require("events");
const fetch = require("node-fetch");
const wd = require("wd");
const { Builder } = require('selenium-webdriver');

const RETRY_TIMEOUT = 1000;

export class MochaSauceRunner {
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
    this.server = `http://${this.user}:${this.key}@ondemand.saucelabs.com:80/wd/hub`;
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
    console.log('browser', browser);
    let url;
    let response;
    let driver;
    let sessionId;

    this.emit('init', browser);

    if (process.env.TRAVIS_JOB_NUMBER) {
      driver = new Builder()
        .withCapabilities({
          'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
          build: process.env.TRAVIS_BUILD_NUMBER,
          username: this.user,
          accessKey: this.key,
          browserName: browser.browserName,
          browserPlatform: browser.platform
        })
        .usingServer(this.server)
        .build();
    } else {
      driver = new Builder()
      .withCapabilities({
        username: this.user,
        accessKey: this.key,
        browserName: browser.browserName,
        browserPlatform: browser.platform
      })
      .usingServer(this.server)
      .build();
    }

    return driver.getSession()
      .then(id => sessionId = id)
      .then(() => this.emit("start", browser))
      .then(() => driver.get(this.url))
      .then(() => driver.executeScript(() => window.ready))
      .then(() => console.log('response', response))
      .then(resp => resp !== true ? setTimeout(() => this.runner(browser), RETRY_TIMEOUT) : driver.getWindowHandle('window.mochaResults'))
      .then(resp => response = resp)
      .then(() => response.tests !== response.passes ? Promise.reject(new Error('one or more tests failed')) : true)
      .then(() => url = `https://${this.user}:${this.key}@saucelabs.com/rest/v1/${this.user}/jobs/${driver.sessionID}`)
      .then(() => fetch(url, {
        body: JSON.stringify({ 'custom-data': { mocha: response.jsonReport }, passed: response.tests === response.passes }),
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
