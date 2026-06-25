#!/usr/bin/env node

/**
 * SMART BOOTSTRAP - Only validates immutable files
 * Ignores all mutable state files
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SmartBootstrap {
  constructor() {
    this.immutablePatterns = [
      /\.js$/,           // JavaScript code
      /\.json$/,         // Config JSONs (NOT data JSONs)
      /package\.json$/,
      /manifest\.json$/
    ];

    this.excludePatterns = [
      /ledger\.json$/,          // MUTABLE - financial data
      /properties\.json$/,      // MUTABLE - property data
      /\.nia-complete/,         // MUTABLE - state directory
      /\.nia-credentials/,      // MUTABLE - credentials
      /\.nia-vault/,            // MUTABLE - vault
      /\.log$/,                 // MUTABLE - logs
      /node_modules/,           // MUTABLE - dependencies
      /\.git/,                  // MUTABLE - git
      /public\/.*\.json$/       // MUTABLE - user data
    ];

    this.checksumPath = path.join(process.env.HOME, '.nia-complete', 'code-checksums.json');
    this.loadChecksums();
  }

  isImmutable(filePath) {
    // Check if file should be hashed
    for (const exclude of this.excludePatterns) {
      if (exclude.test(filePath)) {
        return false; // Excluded - don't hash
      }
    }

    for (const pattern of this.immutablePatterns) {
      if (pattern.test(filePath)) {
        return true; // Should hash this
      }
    }

    return false;
  }

  loadChecksums() {
    if (fs.existsSync(this.checksumPath)) {
      try {
        this.checksums = JSON.parse(fs.readFileSync(this.checksumPath, 'utf8'));
      } catch {
        this.checksums = {};
      }
    } else {
      this.checksums = {};
    }
  }

  saveChecksums() {
    const dir = path.dirname(this.checksumPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.checksumPath, JSON.stringify(this.checksums, null, 2));
  }

  hashFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  validateCodeIntegrity() {
    const codeDir = path.join(process.env.HOME, 'nia-capital-os');
    const issues = [];

    const scanDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Don't scan excluded directories
          if (!this.excludePatterns.some(p => p.test(filePath))) {
            scanDirectory(filePath);
          }
        } else if (this.isImmutable(filePath)) {
          const currentHash = this.hashFile(filePath);
          const previousHash = this.checksums[filePath];

          if (previousHash && currentHash !== previousHash) {
            issues.push({
              file: filePath,
              type: 'CODE_MODIFIED',
              status: 'WARNING'
            });
          }

          this.checksums[filePath] = currentHash;
        }
      }
    };

    scanDirectory(codeDir);
    this.saveChecksums();

    return issues;
  }

  start() {
    console.log('\n🔐 SMART BOOTSTRAP - Code Integrity Monitor');
    console.log('═'.repeat(60));
    console.log('\nValidating immutable code files...');
    console.log('Ignoring mutable data files...\n');

    const issues = this.validateCodeIntegrity();

    if (issues.length === 0) {
      console.log('✅ Code integrity verified');
      console.log('✅ All immutable files unchanged');
      console.log('✅ Mutable state files ignored\n');
    } else {
      console.log(`⚠️  ${issues.length} code files have been modified:\n`);
      issues.forEach(issue => {
        console.log(`  ${issue.file}`);
        console.log(`  Status: ${issue.status}\n`);
      });
    }

    console.log('═'.repeat(60));
    console.log('System ready for operation\n');

    return issues.length === 0;
  }
}

const bootstrap = new SmartBootstrap();
bootstrap.start();

module.exports = SmartBootstrap;
