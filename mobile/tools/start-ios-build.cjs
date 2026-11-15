'use strict';

const {spawnSync} = require('node:child_process');
const {expo} = require('../app.json');

// Dispatch is the only remote operation. GitHub Actions owns the rest of the run.
const result = spawnSync('gh', [
  'workflow', 'run', 'build-ios.yml',
  '--repo', 'JinKato2020/nastran',
  '--ref', 'main',
  '-f', 'app_version=' + expo.version,
  '-f', 'build_number=' + expo.ios.buildNumber,
  '-f', 'testflight=true',
], {stdio: 'inherit'});

if (result.error) console.error(result.error.message);
process.exitCode = result.status ?? 1;
