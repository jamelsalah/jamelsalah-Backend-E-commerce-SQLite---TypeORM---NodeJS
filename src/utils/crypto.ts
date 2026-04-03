import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) throw new Error("ENCRYPTION_KEY não definida no .env");
    const buf = Buffer.from(key, "hex");
    if (buf.length !== 32) throw new Error("ENCRYPTION_KEY deve ter 64 caracteres hexadecimais (32 bytes)");
    return buf;
}

export function encrypt(value: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, getKey(), iv);

    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(value: string): string {
    const [ivHex, authTagHex, encryptedHex] = value.split(":");

    const iv = Buffer.from(ivHex!, "hex");
    const authTag = Buffer.from(authTagHex!, "hex");
    const encrypted = Buffer.from(encryptedHex!, "hex");

    const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);

    return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
}
