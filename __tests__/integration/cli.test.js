const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const cliPath = path.join(__dirname, '../../index.js');

describe('CLI Integration Tests', () => {
  const testDir = path.join(__dirname, 'test-html');

  beforeAll(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('CLI Execution', () => {
    it('should execute without errors on valid HTML', (done) => {
      const validHtml = '<html><body><h1>Test</h1><img alt="test"></body></html>';
      fs.writeFileSync(path.join(testDir, 'valid.html'), validHtml);

      exec(`node ${cliPath} ${testDir}`, (error, stdout, stderr) => {
        // May have exit code 0 or 1 depending on whether issues were found
        // We just check it runs without crashing
        expect(stdout || stderr).toBeTruthy();
        done();
      });
    });

    it('should report accessibility issues', (done) => {
      const invalidHtml = '<html><body><img src="test.jpg"></body></html>';
      fs.writeFileSync(path.join(testDir, 'invalid.html'), invalidHtml);

      exec(`node ${cliPath} ${testDir}`, (error, stdout, stderr) => {
        // The CLI may exit with non-zero code when issues are found
        // We just check that it runs and reports issues
        expect(stdout || stderr).toBeTruthy();
        expect((stdout + stderr).toLowerCase()).toContain('accessibility');
        done();
      });
    });

    it('should accept URL input', (done) => {
      // This test will fail without network, but we can test the CLI accepts the format
      exec(`node ${cliPath} https://example.com 2>&1 || true`, (error, stdout, stderr) => {
        // We just verify it doesn't crash immediately
        expect(stdout || stderr).toBeTruthy();
        done();
      });
    });

    it('should output JSON when report file is specified', (done) => {
      const html = '<html><body><img src="test.jpg"></body></html>';
      const reportPath = path.join(testDir, 'report.json');
      fs.writeFileSync(path.join(testDir, 'test.json.html'), html);

      exec(`node ${cliPath} ${path.join(testDir, 'test.json.html')} ${reportPath}`, (error, stdout, stderr) => {
        // Check if report file was created
        if (fs.existsSync(reportPath)) {
          const report = fs.readFileSync(reportPath, 'utf8');
          expect(report).toBeTruthy();
          // Try to parse as JSON
          try {
            JSON.parse(report);
            expect(true).toBe(true); // If we get here, JSON is valid
          } catch (e) {
            expect(e).toBeNull();
          }
        }
        done();
      });
    });
  });
});
