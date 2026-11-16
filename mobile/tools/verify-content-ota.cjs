const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const [folder, mode] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(path.join(folder, '_manifest.json'), 'utf8'));
const pageIds = Object.keys(require('../src/generated/page-hashes.json')).sort();
assert.equal(manifest.schema, 1);
assert.deepEqual(Object.keys(manifest.pages).sort(), pageIds);
const hashes = [...new Set(Object.values(manifest.pages))];
assert(hashes.every(hash => typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash)));

for (const hash of hashes) {
  const name = `${hash}.html`;
  if (mode === '--list') {
    console.log(name);
  } else {
    const bytes = fs.readFileSync(path.join(folder, 'objects', name));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash, name);
  }
}
