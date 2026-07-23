const crypto = require('crypto');
const fs = require('fs');

class VisualVault {
  constructor() {
    this.key = process.env.POLISH_KEY || crypto.randomBytes(32);
    this.encryptedDir = './PolishOS/vault/encrypted';
    if (!fs.existsSync(this.encryptedDir)) {
      fs.mkdirSync(this.encryptedDir, { recursive: true });
    }
  }

  encryptVisual(visualData, filename) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(visualData)), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const output = {
      iv: iv.toString('hex'),
      encrypted: encrypted.toString('hex'),
      authTag: authTag.toString('hex'),
      filename
    };

    fs.writeFileSync(`${this.encryptedDir}/${filename}.enc`, JSON.stringify(output));
    return { success: true, file: `${filename}.enc` };
  }

  decryptVisual(filename) {
    const data = fs.readFileSync(`${this.encryptedDir}/${filename}.enc`, 'utf8');
    const { iv, encrypted, authTag } = JSON.parse(data);
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'hex')),
      decipher.final()
    ]);
    return JSON.parse(decrypted.toString('utf8'));
  }
}

module.exports = VisualVault;
