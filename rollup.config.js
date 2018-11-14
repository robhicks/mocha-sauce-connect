const { resolve } = require('path');
const root = process.cwd();

export default [
  {
    input: resolve(root, 'src', 'MochaSauceConnect.js'),
    output: {
      file: resolve(root, 'dist', 'MochaSauceConnect.iife.js'),
      format: 'iife',
      name: 'MochaSauceConnect'
    }
  },
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
