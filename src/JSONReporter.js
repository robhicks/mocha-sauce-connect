export function JSONReporter(runner) {
  let root = null;
  const result = {};
  const recurse = (suite, result) => {
    result.durationSec = 0;
		result.passed = true;
    if (suite.title) result.description = suite.title;
    if (suite.tests.length) {
      result.specs = [];
      for (let i = 0; i < suite.tests.length; i++) {
        result.specs.push({
          "description": suite.tests[i].title,
					"durationSec": (suite.tests[i].duration / 1000) || 0, // duration of spec run in seconds
					"passed": suite.tests[i].state === "passed" // did the spec pass?
        });

        result.durationSec += (suite.tests[i].duration / 1000) || 0;

        if (suite.tests[i].state !== "passed") result.passed = false;
      }
    }
    if (suite.suites.length) {
			result.suites = [];
			let sub = null;
			for (let j = 0; j < suite.suites.length; j++) {
				sub = {};
				recurse(suite.suites[j], sub);
				result.suites.push(sub);
				result.durationSec += sub.durationSec || 0;

				if (!sub.passed) result.passed = false;
			}
		}
  }

  runner.on('suite', function(suite) {
		if(suite.parent.root) root = suite.parent;
	});

	runner.on('end', function() {
		recurse(root, result);
		window.jsonReport = result;
	});
}
