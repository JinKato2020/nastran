'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createRequire} = require('node:module');
const {patchedScanner, SUPPORTED_VERSION, SCAN_TIMEOUT_MS} = require('./configure-expo-scanner.cjs');

async function check() {
  const packageFile = require.resolve('expo-modules-autolinking/package.json');
  const {version} = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  const file = path.join(path.dirname(packageFile), 'build/platforms/apple/moduleScanner.js');
  const source = fs.readFileSync(file, 'utf8');
  const patched = patchedScanner(source, version);
  assert.equal(patchedScanner(patched, version), patched, 'Reapplying must be harmless');
  assert.throws(() => patchedScanner(source, '99.0.0'), /Review/);
  assert.throws(() => patchedScanner('', SUPPORTED_VERSION), /exactly one/);
  assert.throws(() => patchedScanner(source + source, version), /exactly one/);
  const warnings = [];
  const context = {
    exports: {},
    require: createRequire(file),
    console: {warn: text => warnings.push(text)},
  };
  vm.runInNewContext(patched, context, {filename: file});
  const {scanExpoModulesAsync, groupScannedModules} = context.exports;
  const root = path.dirname(require.resolve('expo-modules-core/package.json'));
  const roots = {'expo-modules-core': root};
  const output = {warnings: [], modules: [{
    name: 'CoreModule', file: path.join(root, 'ios/CoreModule.swift'),
    accessLevel: 'public', platforms: ['iOS'],
  }]};
  let called = false;
  const scanner = {scanModules: async (paths, options) => {
    called = true;
    assert.equal(paths.length, 1);
    assert.equal(paths[0], root);
    assert.equal(options.timeout, SCAN_TIMEOUT_MS);
    return output;
  }};
  assert.equal(await scanExpoModulesAsync(scanner, roots), output);
  assert(called);
  const grouped = groupScannedModules(output, roots, 'ios');
  assert.equal(grouped['expo-modules-core'][0].class, 'CoreModule');
  const failed = await scanExpoModulesAsync({scanModules: async () => {
    throw Error('scanner failure');
  }}, roots);
  assert.equal(failed, null, 'Failures must remain failures');
  assert(warnings.some(text => text.includes('scanner failure')));
  const {findPackagesMissingScannedModules} = require('expo-modules-autolinking/build/commands/generateModulesProviderCommand');
  const missing = findPackagesMissingScannedModules(
    ['expo-modules-core'], [{packageName: 'expo-modules-core', modules: []}],
    false, {'expo-modules-core': {path: root, config: {declaresAppleModules: () => false}}}
  );
  assert.deepEqual(missing, ['expo-modules-core'], 'Do not bypass missing native-module protection');
  console.log('PASS: Expo scan deadline, idempotence, version guard, module registration and failure protection.');
}
check().catch(error => {console.error(error); process.exitCode = 1;});
