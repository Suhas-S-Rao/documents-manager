import fs from 'node:fs';
import crypto from 'node:crypto';
const algorithm = 'aes-256-gcm';
const ENCRYPTION_KEY = crypto.createHash('sha256').update('documents-manager-secret-key').digest();

export const encryptFile = async (inputPath: string) => {
    const outputPath = `${inputPath}.enc`;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(algorithm, ENCRYPTION_KEY, iv);
    const input = fs.readFileSync(inputPath);
    const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
    const authTag = cipher.getAuthTag();
    const finalData = Buffer.concat([iv, authTag, encrypted]);
    fs.writeFileSync(outputPath, finalData);
    return outputPath;
};

export const decryptFile = async (inputPath: string, outputPath: string) => {
    const data = fs.readFileSync(inputPath);
    const iv = data.subarray(0, 12);
    const authTag = data.subarray(12, 28);
    const encrypted = data.subarray(28);
    const decipher = crypto.createDecipheriv(algorithm, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    fs.writeFileSync(outputPath, decrypted);
};