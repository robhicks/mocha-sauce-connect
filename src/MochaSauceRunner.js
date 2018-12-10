const { Builder, By, until } = require('selenium-webdriver');
const { EventEmitter } = require("events");
const fetch = require("node-fetch");
const istanbul = require('istanbul');
const path = require('path');

const coveragePath = path.resolve(__dirname, 'coverage');

const RETRY_TIMEOUT = 1000;
const MAX_RETRIES = 5;

export class MochaSauceRunner {
  constructor(conf) {
    this.browsers = conf.browsers || [];
    this.build = conf.build || "";
    this.key = conf.accessKey || process.env.SAUCE_API_KEY;
    this.maxRetries = conf.maxRetries || MAX_RETRIES;
    this.maxRunningTime = conf.timeout || RETRY_TIMEOUT * MAX_RETRIES;
    this.name = conf.name;
    this.port = conf.port;
    this.retryTimeout = conf.timeout ? conf.timeout / 5 : RETRY_TIMEOUT;
    this.screenshots = false;
    this.user = conf.username || process.env.SAUCE_USER_NAME;
    this.server = `http://${this.user}:${this.key}@ondemand.saucelabs.com:80/wd/hub`;
    this.tags = conf.tags || [];
    this.tunnelId = conf.tunnelId;
    this.url = conf.url || "";
    this.video = false;
    this.collector = new istanbul.Collector();
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
    // console.log('runner::browser', browser);
    let url;
    let response;
    let driver;
    let sessionId;

    this.emit('init', browser);

    const browsers = {
      browserName: browser.name,
      platform: browser.platform
    };
    if (browser.version) browsers.version = browser.version;

    const creds = {
      username: this.user,
      accessKey: this.key
    };

    const job = {
      name: `${browser.name}::${browser.platform}`
    };

    if (process.env.TRAVIS_JOB_NUMBER) {
      const capabilities = Object.assign({
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        build: process.env.TRAVIS_BUILD_NUMBER
      }, job, creds, browsers);
      driver = new Builder()
        .withCapabilities(capabilities)
        .usingServer(this.server)
        .build();
    } else {
      const capabilities = Object.assign({}, creds, browsers, job);
      driver = new Builder()
      .withCapabilities(capabilities)
      .usingServer(this.server)
      .build();
    }

    return driver.getSession()
      // .then(session => console.log('session', session))
      .then(session => sessionId = session.id_)
      .then(() => this.emit("start", browser))
      .then(() => driver.get(this.url))
      .then(() => url = `https://${this.user}:${this.key}@saucelabs.com/rest/v1/${this.user}/jobs/${sessionId}`)
      .then(() => driver.wait(until.elementLocated(By.id('mocha-sauce-connect')), this.maxRunningTime))
      .then(() => driver.findElement({id: 'mocha-sauce-connect'}))
      .then(el => el.getAttribute('mocha-results'))
      .then(res => typeof res === 'string' ? JSON.parse(res) : res)
      .then(resp => response = resp)
      .then(() => response.passes !== response.tries ? Promise.reject(new Error(response.failed)) : null)
      .then(() => JSON.stringify({ 'custom-data': { mocha: response }, passed: response.tries === response.passes }))
      .then(body => fetch(url, {
        body,
        headers: { 'Content-Type': 'application/json'},
        method: 'PUT'
      }))
      .then(() => {
        this.collector.add(response.coverage);
        this.emit('end', browser, response);
        fetch(url + '/stop', { method: 'PUT', body: {}});
      })
      .catch(err => {
        fetch(url + '/stop', { method: 'PUT', body: {}});
        return Promise.reject(err);
      });
  }

  start() {
    return Promise.all(this.browsers.map(b => this.runner(b)))
      .then(() => this.collector);
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
