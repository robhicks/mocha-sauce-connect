const { resolve } = require('path');
const nodeResolve = require('rollup-plugin-node-resolve');
const root = process.cwd();
const commonJs = require('rollup-plugin-commonjs');

export default [
  {
    input: resolve(root, 'src', 'MochaSauceConnect.js'),
    output: {
      file: resolve(root, 'dist', 'MochaSauceConnect.js'),
      format: 'es'
    }
  },
  {
    input: resolve(root, 'src', 'MochaSauceRunner.js'),
    plugins: [
      nodeResolve(),
      commonJs()
    ],
    output: {
      file: resolve(root, 'index.js'),
      format: 'cjs'
    }
  },
  {
    input: resolve(root, 'src', 'MochaSauceRunner.js'),
    plugins: [
      nodeResolve(),
      commonJs()
    ],
    output: {
      file: resolve(root, 'index.mjs'),
      format: 'es'
    }
  }
];
