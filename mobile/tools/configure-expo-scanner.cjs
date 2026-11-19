'use strict';

// Expo autolinking 58.0.17 hard-codes a 5-second scan deadline. On our hosted
// Intel runner the scan timed out, leaving expo-modules-core unregistered.
// Increase only the deadline; preserve scanning, diagnostics and missing-module
// failures. Review/remove this workaround when upgrading autolinking.
const fs = require('node:fs');
const path = require('node:path');
const SUPPORTED_VERSION = '58.0.17';
const SCAN_TIMEOUT_MS = 60000;

function patchedScanner(source, version) {
  if (version !== SUPPORTED_VERSION) {
    throw Error('Review the Expo scanner workaround for autolinking ' + version);
  }
  const pattern = /(scanner\.scanModules\(roots,\s*\{\s*timeout:\s*)(5000|60000)(\s*\}\))/g;
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== 1) {
    throw Error('Expected exactly one known Expo module scanner timeout; dependency was not modified.');
  }
  return source.replace(pattern, (_, before, value, after) => before + SCAN_TIMEOUT_MS + after);
}

function apply() {
  const packageFile = require.resolve('expo-modules-autolinking/package.json', {
    paths: [path.resolve(__dirname, '..')],
  });
  const {version} = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  const file = path.join(path.dirname(packageFile), 'build/platforms/apple/moduleScanner.js');
  const source = fs.readFileSync(file, 'utf8');
  const patched = patchedScanner(source, version);
  if (patched !== source) fs.writeFileSync(file, patched);
  console.log('Expo module scan deadline: ' + SCAN_TIMEOUT_MS + ' ms (autolinking ' + version + ').');
}

if (require.main === module) apply();
module.exports = {patchedScanner, SUPPORTED_VERSION, SCAN_TIMEOUT_MS};
