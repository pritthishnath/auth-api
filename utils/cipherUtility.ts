import crypto from "crypto";

const algorithm = "aes-256-ctr";

const getSecret = (): string => process.env.CIPHER_SECRET.substring(0, 32); // Secret of 32 bytes

export function encrypt(token: string): string {
  const iv = crypto.randomBytes(16); // Init vector of 16 bytes

  const cipher = crypto.createCipheriv(algorithm, getSecret(), iv);

  const encryptedToken = Buffer.concat([cipher.update(token), cipher.final()]);

  return [iv.toString("hex"), encryptedToken.toString("hex")].join("#");
}

export function decrypt(hash: string): string {
  const iv = Buffer.from(hash.split("#")[0], "hex");
  const encryptedToken = hash.split("#")[1];

  const decipher = crypto.createDecipheriv(algorithm, getSecret(), iv);

  const decryptedToken = Buffer.concat([
    decipher.update(Buffer.from(encryptedToken, "hex")),
    decipher.final(),
  ]);

  return decryptedToken.toString();
}
