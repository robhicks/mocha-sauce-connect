Mocha Sauce Connect
===================

This is a simple test runner for running Mocha tests on SauceLabs using selenium-webdriver through SauceConnect.

# Why this Repo?

This was created because I couldn't find any decent test runners for Mocha on SauceLabs. Okay, I found some test runners
but they either required me to use Grunt (yuck), were too hard to set up, or haven't been updated forever, or wouldn't actually run in Travis
through SauceConnect.

# Installation

```npm i mocha-sauce-connect -D```

# Use

Using this requires setting up the test runner in NodeJs and configuring the browser.

## NodeJs Test Runner

Look at mocha-sauce-test-runner.js.

## Browser Configuration

Look at mocha.html.

# Legal

Copyright 2018 Mentor Capital, LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
