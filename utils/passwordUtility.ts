import crypto from "crypto";

export function hashPassword(input: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hashedPassword = crypto
    .pbkdf2Sync(input, salt, 10, 32, "sha512")
    .toString("hex");

  return [salt, hashedPassword].join("#");
}

export function comparePassword(input: string, password: string): boolean {
  const salt = password.split("#")[0];
  const savedHash = password.split("#")[1];

  const hash = crypto.pbkdf2Sync(input, salt, 10, 32, "sha512").toString("hex");

  return hash === savedHash;
}
