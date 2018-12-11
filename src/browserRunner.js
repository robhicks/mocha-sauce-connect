export function browserRunner(mocha, runner) {
  let failed = [];
  let failures = 0;
  let passes = 0;
  let tries = 0;

  runner.on('pass', test => {
    passes++;
    tries++;
  });
  runner.on('fail', (test, err) => {
    failures++;
    tries++;
    failed.push({
      title: test.title,
      fullTitle: test.fullTitle(),
      error: {
        message: err.message,
        stack: err.stack
      }
    });
  });

  runner.on('end', () => {
    let el = document.createElement('div');
    el.id = 'mocha-sauce-connect';
    el.setAttribute('mocha-results', JSON.stringify({
      coverage: window.__coverage__,
      passes,
      failures,
      failed,
      tries
    }));
    document.body.append(el);
    // console.log('el', el);
  });
}
