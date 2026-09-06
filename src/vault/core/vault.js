const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class QuantumVault {
  constructor(configPath = path.join(__dirname, '../config.json')) {
    // Load configuration
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found at: ${configPath}`);
    }
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Runtime paths
    this.auditLog = './runtime/vault/audit.log';
    this.secretsFile = './runtime/vault/secrets.enc';
    this.encryptionKey = process.env.VAULT_ENCRYPTION_KEY || null;

    // Ensure runtime directories exist
    if (!fs.existsSync('./runtime/vault')) {
      fs.mkdirSync('./runtime/vault', { recursive: true });
    }
  }

  // AES-256-GCM encryption
  encrypt(text) {
    if (!this.encryptionKey) {
      throw new Error('VAULT_ENCRYPTION_KEY not set in environment');
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(this.encryptionKey, 'hex'), iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      iv: iv.toString('hex'),
      encrypted: encrypted.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData) {
    if (!this.encryptionKey) {
      throw new Error('VAULT_ENCRYPTION_KEY not set in environment');
    }

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(this.encryptionKey, 'hex'),
      Buffer.from(encryptedData.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData.encrypted, 'hex')),
      decipher.final()
    ]);
    return decrypted.toString('utf8');
  }

  // Store a secret
  storeSecret(key, value) {
    const secrets = this.loadSecrets();
    secrets[key] = this.encrypt(value);
    fs.writeFileSync(this.secretsFile, JSON.stringify(secrets, null, 2));
    this.audit('SECRET_STORED', key);
    return { stored: true, key };
  }

  // Retrieve a secret
  retrieveSecret(key) {
    const secrets = this.loadSecrets();
    if (!secrets[key]) {
      this.audit('SECRET_NOT_FOUND', key);
      return null;
    }
    const decrypted = this.decrypt(secrets[key]);
    this.audit('SECRET_RETRIEVED', key);
    return decrypted;
  }

  // Load all secrets
  loadSecrets() {
    try {
      const data = fs.readFileSync(this.secretsFile, 'utf8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  // Audit logging
  audit(action, key) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      key,
      user: process.env.VAULT_USER || 'system'
    };
    fs.appendFileSync(
      this.auditLog,
      JSON.stringify(entry) + '\n',
      'utf8'
    );
  }

  // Health check
  health() {
    return {
      status: 'operational',
      vaultName: this.config.vaultName,
      version: this.config.version,
      encryption: this.config.encryption,
      auditLogging: this.config.auditLogging,
      approvalRequired: this.config.approvalRequired,
      secretsStored: Object.keys(this.loadSecrets()).length
    };
  }
}

module.exports = QuantumVault;
