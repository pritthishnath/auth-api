import crypto from "crypto";

export function randomString(length: number): string {
  let result = "";

  const charset =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const buffer = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += charset[buffer[i] % charset.length];
  }
  return result;
}

export function randomPin(length: number): string {
  let result = "";

  const characters = "0123456789";

  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
    counter++;
  }
  return result;
}
