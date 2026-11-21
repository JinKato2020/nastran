const assert = require('node:assert/strict');
const { canOpenLesson, FREE_ANALYSIS_HASHES, isAnalysisIndex } = require('../src/pro-access.ts');
const { NAVIGATION } = require('../src/content.ts');
const { PAGE_IDS } = require('../src/protocol.ts');
const { PRO_ENTITLEMENT, isProPackage, hasProEntitlement, validPublicAppleKey } = require('../src/pro-purchases.ts');

assert.deepEqual(FREE_ANALYSIS_HASHES, ['#static', '#thick-cylinder', '#buckling']);
for (const item of [...NAVIGATION.elements, ...NAVIGATION.analyses, ...NAVIGATION.materialTheory,
  ...NAVIGATION.meshTheory, ...NAVIGATION.boundaryTheory, ...NAVIGATION.loadTheory, ...NAVIGATION.contactTheory, ...NAVIGATION.dampingTheory,
  ...NAVIGATION.common, ...NAVIGATION.materials, ...NAVIGATION.intro, ...NAVIGATION.operations, ...NAVIGATION.homeResources]) {
  const expected = ['elements.html', 'bulk.html', 'comparisons.html'].includes(item.path) || (item.path === 'analysis.html' && FREE_ANALYSIS_HASHES.includes(item.hash));
  assert.equal(canOpenLesson(item, false), expected, item.path + item.hash);
  assert(canOpenLesson(item, true));
}
for (const path of PAGE_IDS) {
  const free = ['elements.html', 'bulk.html', 'comparisons.html'].includes(path);
  assert.equal(canOpenLesson({ path, hash: '' }, false), free, path);
  assert(canOpenLesson({ path, hash: '' }, true));
}
assert(canOpenLesson({ path: 'analysis.html', hash: '#static/beam/input' }, false));
assert(!canOpenLesson({ path: 'analysis.html', hash: '#modes/base/result' }, false));
assert(!canOpenLesson({ path: 'analysis.html', hash: '#static-extension' }, false));
assert(isAnalysisIndex({ path:'analysis.html', hash:'#index' }));

const apple = { identifier: '$rc_lifetime', product: { identifier: 'nastran_pro', priceString: '¥1,000', productType:'NON_CONSUMABLE' } };
assert(isProPackage(apple));
assert(!isProPackage({ ...apple, identifier: '$rc_monthly' }));
assert(!isProPackage({ ...apple, product: { ...apple.product, identifier: 'lifetime' } }));
assert(!isProPackage({ ...apple, product: { ...apple.product, priceString: '' } }));
assert(!isProPackage({ ...apple, product: { ...apple.product, productType: 'AUTO_RENEWABLE_SUBSCRIPTION' } }));
assert(hasProEntitlement({ entitlements: { active: { [PRO_ENTITLEMENT]: {} } } }));
assert(!hasProEntitlement({ entitlements: { active: { unrelated: {} }, all: { [PRO_ENTITLEMENT]: {} } } }));
assert(validPublicAppleKey('appl_exampleTest'));
assert(!validPublicAppleKey('test_example'));
assert(!validPublicAppleKey('sk_example'));
console.log('PASS: Free and Pro lesson routes, Apple lifetime SKU, localized price and exact active entitlement.');
