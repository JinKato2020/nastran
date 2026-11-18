'use strict';

const {spawnSync} = require('node:child_process');
const {expo} = require('../app.json');

// Dispatch only. A requested retry may choose Intel after a hosted Arm runner shortage.
const options = process.argv.slice(2);
if (options.some(value => value !== '--intel')) {
  console.error('Usage: node mobile/tools/start-ios-build.cjs [--intel]');
  process.exit(1);
}
const args = [
  'workflow', 'run', 'build-ios.yml',
  '--repo', 'JinKato2020/nastran',
  '--ref', 'main',
  '-f', 'app_version=' + expo.version,
  '-f', 'build_number=' + expo.ios.buildNumber,
  '-f', 'testflight=true',
];
if (options.includes('--intel')) args.push('-f', 'intel_runner=true');
const result = spawnSync('gh', args, {stdio: 'inherit'});
if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
