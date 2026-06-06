/**
 * Simple test framework for be-a11y
 * Usage: node test/framework.js [test-file.js]
 */

const fs = require("fs");
const path = require("path");

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  addTest(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log("\n" + "=".repeat(60));
    console.log("be-a11y Test Framework");
    console.log("=".repeat(60) + "\n");

    for (const test of this.tests) {
      try {
        await test.fn();
        this.passed++;
        console.log(`✓ ${test.name}`);
      } catch (error) {
        this.failed++;
        console.log(`✗ ${test.name}`);
        console.log(`  Error: ${error.message}`);
        if (error.stack) {
          const relevantStack = error.stack.split('\n').slice(1, 4).join('\n  ');
          console.log(`  ${relevantStack}`);
        }
      }
    }

    console.log("\n" + "-".repeat(60));
    console.log(`Results: ${this.passed} passed, ${this.failed} failed`);
    console.log("-".repeat(60) + "\n");

    return this.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || "Assertion failed");
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        `${message || "Values not equal"}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
      );
    }
  }

  assertDeepEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        `${message || "Objects not equal"}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
      );
    }
  }

  assertMatch(str, pattern, message) {
    if (!pattern.test(str)) {
      throw new Error(
        `${message || "String does not match pattern"}: ${str} does not match ${pattern}`
      );
    }
  }
}

// Export for use in test files
module.exports = { TestRunner };

// If run directly, run all test files
if (require.main === module) {
  const runner = new TestRunner();
  const testDir = path.join(__dirname, "tests");

  // Auto-discover test files
  const testFiles = fs
    .readdirSync(testDir)
    .filter((f) => f.endsWith(".js") && f !== "framework.js")
    .sort();

  console.log(`Found ${testFiles.length} test file(s)`);

  // Import and register tests from each file
  for (const testFile of testFiles) {
    const testPath = path.join(testDir, testFile);
    const testModule = require(testPath);
    if (typeof testModule.register === "function") {
      testModule.register(runner);
    }
  }

  // Run all tests
  runner.run().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
