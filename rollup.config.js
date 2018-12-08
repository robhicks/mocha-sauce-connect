const { resolve } = require('path');
const root = process.cwd();
const liveServer = require('rollup-plugin-live-server');

const tasks = [
  {
    input: resolve(root, 'src', 'MochaSauceConnect.js'),
    output: {
      file: resolve(root, 'dist', 'MochaSauceConnect.js'),
      format: 'es'
    }
  },
  {
    input: resolve(root, 'src', 'MochaSauceRunner.js'),
    output: {
      file: resolve(root, 'index.js'),
      format: 'cjs'
    }
  },
  {
    input: resolve(root, 'src', 'MochaSauceRunner.js'),
    output: {
      file: resolve(root, 'index.mjs'),
      format: 'es'
    }
  }
];

if (process.env.server) {
  tasks.push({
    input: resolve(root, 'src', 'MochaSauceConnect.js'),
    plugins: [
      liveServer({
        file: 'test/mocha.html',
        logLevel: 2,
        mount: [[ '/dist', './dist' ], [ '/src', './src' ], [ '/node_modules', './node_modules' ], [ '/test', './test' ]],
        open: false,
        port: 8080,
        verbose: true,
        wait: 500,
        watch: 'src'
      })
    ],
    output: {
      file: resolve(root, 'dist', 'MochaSauceConnect.iife.js'),
      format: 'iife',
      name: 'MochaSauceConnect'
    }
  });
} else {
  tasks.push({
    input: resolve(root, 'src', 'MochaSauceConnect.js'),
    output: {
      file: resolve(root, 'dist', 'MochaSauceConnect.iife.js'),
      format: 'iife',
      name: 'MochaSauceConnect'
    }
  });
}

export default tasks;
