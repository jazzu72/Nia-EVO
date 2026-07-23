const crypto = require('crypto');
const fs = require('fs');

class MusicVault {
  constructor() {
    this.key = process.env.MUSEFORGE_KEY || crypto.randomBytes(32);
    this.encryptedDir = './MuseForgeOS/vault/encrypted';
    if (!fs.existsSync(this.encryptedDir)) {
      fs.mkdirSync(this.encryptedDir, { recursive: true });
    }
  }

  encryptTrack(trackData, filename) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(JSON.stringify(trackData)), cipher.final()]);
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
}

module.exports = MusicVault;
