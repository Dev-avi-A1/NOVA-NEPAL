import { runAutomatedTests } from './pricingAndInventory.test';

console.log('=====================================================');
console.log('   NOVA NEPAL — AUTOMATED B2B INTEGRITY TEST SUITE   ');
console.log('=====================================================');

const { passed, failed, results } = runAutomatedTests();

results.forEach((r) => {
  if (r.startsWith('PASS')) {
    console.log(`\x1b[32m✔ ${r}\x1b[0m`);
  } else {
    console.log(`\x1b[31m✖ ${r}\x1b[0m`);
  }
});

console.log('-----------------------------------------------------');
console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32mAll core marketplace integrity tests verified successfully!\x1b[0m');
  process.exit(0);
}
