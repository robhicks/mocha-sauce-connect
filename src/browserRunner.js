import { JSONReporter } from './JSONReporter.js';

export function browserRunner(mocha, runner) {
  let failed = [];

  mocha.reporter(JSONReporter);
  new mocha._reporter(runner);

  runner.on('end', () => {
    runner.stats.failed = failed;
    runner.stats.jsonReport = window.jsonReport;
    window.mochaResults = runner.stats;
    window.ready = true;
  });

  runner.on('fail', (test, err) => {
    failed.push({
      title: test.title,
      fullTitle: test.fullTitle(),
      error: {
        message: err.message,
        stack: err.stack
      }
    });
  });
}
