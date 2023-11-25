import { NextFunction, Request, Response } from "express";
import { serverTokens } from "../constants";
import { decrypt, jsonError } from "../utils";

export function checkServerToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = req.body.serverKey;

  const originalToken = serverTokens.get(key);

  if (!originalToken) {
    return jsonError(
      res,
      400,
      "Server key expired, refresh the page and try again"
    );
  } else {
    const decryptedToken = decrypt(key);

    if (decryptedToken !== originalToken) {
      return jsonError(
        res,
        400,
        "Server key expired, refresh the page and try again"
      );
    } else {
      serverTokens.delete(key);
      next();
    }
  }
}
