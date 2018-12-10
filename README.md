Mocha Sauce Connect
===================

This is a simple test runner for running Mocha tests on SauceLabs using selenium-webdriver through SauceConnect.

# Why this Repo?

This was created because I couldn't find any decent test runners for Mocha on SauceLabs in a Continuous Integration (CI) environment. Okay, I found some test runners but they either required me to use Grunt (yuck), were too hard to set up, or haven't been updated recently (in the last few years), or wouldn't actually run in Travis through SauceConnect.

So why not use Karma? Because Mocha is simple to understand. With Mocha you build a page just you do when you're developing. You load assets the same way. You run scripts the same way. Debugging is straight forward. Life is just better.

# Prerequisites

1. Mocha (required)
2. Chai (optional)
2. Sinon (optional)
3. istanbul (optional)
3. Your Mocha tests

# Installation

```npm i mocha-sauce-connect -D```

# Use

Using Mocha Sauce Connect requires doing the following:

1. Creating a NodeJs test runner. See instructions below.
2. Creating an HTML page to run your tests. See instructions below.
3. Serving up your test page with a local server. See example mocha-sauce-test-runner.js.
4. Starting SauceConnect. Starting SauceConnect can be done locally in your development environment or it can be done in you CI according to their instructions.
5. Running your test runner.

## NodeJs Test Runner

Configuring the runner requires creating a NodeJs file or incorporating something like the following into an existing one.

```JavaScript
const { MochaSauceRunner } = require("mocha-sauce-runner");
const host = 'localhost';
const port = 8080;
const url = `http://${host}:${port}/test/mocha.html`;

// options for MochaSauceConnect
// for other options see src/MochaSauceConnect.js
const runnerOptions = {
  name: 'name of your app or library',
  username: process.env.SAUCE_USERNAME, // your sauce username
  accessKey: process.env.SAUCE_ACCESS_KEY, // your sauce access key
  host: 'localhost', // host serving your Mocha test page
  port: 4445, // port of sauce connect
  url
}

const runner = new MochaSauceRunner(runnerOptions);

// record the display on SauceLabs
runner.record(true);

// set up your runners
// you can add version if you wish. without version it will run the latest version
runner.browser({ browserName: "chrome", platform: "Windows 10" });
runner.browser({ browserName: "firefox", platform: "Windows 10" });
runner.browser({ browserName: "safari", platform: "macOS 10.13" });
runner.browser({ browserName: "firefox", platform: "macOS 10.13" });
runner.browser({ browserName: "chrome", platform: "macOS 10.13" });

runner.on('init', browser => console.log('  init : %s %s', browser.browserName, browser.platform));

runner.on('start', browser => console.log('  start : %s %s', browser.browserName, browser.platform));

runner.on('end', (browser, res) => console.log('  end : %s %s : %d failures', browser.browserName, browser.platform, res.failures));

runner.on('error', err => console.log('err', err));

runner.start()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.log('err', err);
    process.exit(1);
  });
```

## Browser Configuration

Create an html file to run your tests. Here's an example:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My Tests</title>
    <link rel="stylesheet" href="/node_modules/mocha/mocha.css">
  </head>
  <body>
    <div id="mocha"></div>
    <script src="/node_modules/mocha/mocha.js"></script>
    <script src="/node_modules/chai/chai.js"></script>
    <script src="/dist/MochaSauceConnect.iife.js"></script>
    <!-- code under test, just like you include them in your app -->
    <script src="/dist/code-under-test.js"></script>
    <!-- if you want test coverage include your istanbul instrumented code instead -->
    <script src="/dist/code-under-test-instrumented.js"></script>
    <script>mocha.setup('bdd')</script>
    <script src="/test/browser-tests.js"></script>
    <script>
    document.addEventListener('DOMContentLoaded', () => {
      expect = chai.expect;
      MochaSauceConnect.MochaSauceConnect(mocha, mocha.run());
    });
    </script>
  </body>
</html>
```

## Getting Test Coverage

Mocha Sauce Connect includes support for [istanbul](https://istanbul.js.org/).

Istanbul instruments your ES5 and ES2015+ JavaScript code with line counters, so that you can track how well your unit-tests exercise your codebase.

To get test coverage for your code using Mocha Sauce Connect and istanbul, you'll need to do the following:

1. Instrument your code. You can instrument your code using istanbul. If you're using a bunlder such as rollup or webpack, you can use a plugin.
2. Load your instrumented code in your browser test HTML file (see Browser Configuration above).
3. Incorporate istanbul into your test runner.
4. Generate your reports.

In the following, we'll incorporate istanbul's text reporter into a test runner:

```JavaScript
const { MochaSauceRunner } = require("mocha-sauce-runner");
const istanbul = require('istanbul');
const host = 'localhost';
const url = `http://${host}:${port}/test/mocha.html`;

const runnerOptions = {
  name: 'name of your app or library',
  username: process.env.SAUCE_USERNAME,
  accessKey: process.env.SAUCE_ACCESS_KEY,
  host: 'localhost',
  port: 4445,
  url
}

const runner = new MochaSauceRunner(runnerOptions);

// record the display on SauceLabs
runner.record(true);

runner.browser({ browserName: "chrome", platform: "Windows 10" });
runner.browser({ browserName: "firefox", platform: "Windows 10" });
runner.browser({ browserName: "safari", platform: "macOS 10.13" });
runner.browser({ browserName: "firefox", platform: "macOS 10.13" });
runner.browser({ browserName: "chrome", platform: "macOS 10.13" });

runner.on('init', browser => console.log('  init : %s %s', browser.browserName, browser.platform));

runner.on('start', browser => console.log('  start : %s %s', browser.browserName, browser.platform));

runner.on('end', (browser, res) => console.log('  end : %s %s : %d failures', browser.browserName, browser.platform, res.failures));

runner.on('error', err => console.log('err', err));

runner.start()
  .then(collector => {
    const reporter = new istanbul.Reporter();
    reporter.add('text');
    reporter.write(collector, true, () => {});
    process.exit(0);
  })
  .catch(err => {
    console.log('err', err);
    process.exit(1);
  });
```
For more information on istanbul reporters, see [istanbul.org](https://istanbul.js.org/).

# Legal

Copyright 2018 Mentor Capital, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
