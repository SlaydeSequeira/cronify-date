let passed = 0;
let failed = 0;

export const test = (name: string, fn: () => void) => {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e: any) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
  }
};

export const eq = (actual: unknown, expected: unknown) => {
  if (actual !== expected) throw new Error(`Expected "${expected}", got "${actual}"`);
};

export const summary = () => {
  console.log(`  ${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
  passed = 0;
  failed = 0;
};
