import { browserRunner } from './browserRunner.js';

export function MochaSauceConnect(mocha, runner) {
  browserRunner(mocha, runner);
}
