import { NextFunction, Request, Response } from "express";
import { serverTokens } from "../constants";
import { decrypt } from "../utils";

export function checkServerToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const key = req.body.serverKey;

  const originalToken = serverTokens.get(key);

  if (!originalToken) {
    res.status(400).json({ error: true, message: "Invalid server token!" });
  } else {
    const decryptedToken = decrypt(key);

    if (decryptedToken !== originalToken) {
      res.status(400).json({ error: true, message: "Invalid server token!" });
    } else {
      serverTokens.delete(key);
      next();
    }
  }
}
